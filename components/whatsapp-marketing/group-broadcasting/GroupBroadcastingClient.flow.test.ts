import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MutationObserver,
  QueryClient,
  QueryObserver,
  type MutationObserverOptions,
  type QueryObserverOptions,
} from '@tanstack/query-core';

// End-to-end flow of the Group Broadcasting list, minus the DOM - the same
// harness as BroadcastingWAClient.flow.test.ts: real hooks and fetchers
// against a fake backend, the real TanStack engine, the real useLazyRows, and
// SuperTable's restartKey / onStateChange effects replayed between renders.
// Every render is recorded, so a frame that would paint the empty state is
// caught however briefly it lasts.

const runner = vi.hoisted(() => {
  type Slot = { current?: unknown; value?: unknown; deps?: unknown[] };
  let slots: Slot[] = [];
  let cursor = 0;
  const useMemo = <T>(factory: () => T, deps: unknown[]): T => {
    const i = cursor++;
    const prev = slots[i];
    if (prev?.deps && prev.deps.length === deps.length && prev.deps.every((d, k) => Object.is(d, deps[k]))) {
      return prev.value as T;
    }
    const value = factory();
    slots[i] = { value, deps };
    return value;
  };
  return {
    mount() {
      slots = [];
      cursor = 0;
    },
    render<T>(fn: () => T): T {
      cursor = 0;
      return fn();
    },
    useRef<T>(initial: T) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { current: initial };
      return slots[i] as { current: T };
    },
    useMemo,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- this IS the hook runner
    useCallback: <T>(fn: T, deps: unknown[]) => useMemo(() => fn, deps),
  };
});
const ctx = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useRef: runner.useRef,
  useMemo: runner.useMemo,
  useCallback: runner.useCallback,
}));
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: (options: unknown) => options,
  useMutation: (options: unknown) => options,
  useQueryClient: () => ctx.client,
}));
vi.mock('js-cookie', () => ({ default: { get: () => 'test-token' } }));

import { useLazyRows } from '@/components/ui/super-table/hooks/useLazyRows';
import {
  groupBroadcastsKey,
  useCreateGroupBroadcast,
  useDeleteGroupBroadcast,
  useDuplicateGroupBroadcasts,
  useGroupBroadcasts,
  useUpdateGroupBroadcast,
} from '@/lib/hooks/useGroupBroadcasts';
import { createListRefresher } from '@/lib/hooks/useListRefresh';

const PAGE_SIZE = 3;
const LATENCY = 300;

// ─── Fake backend ──────────────────────────────────────────────────────────
type Row = { id: string; name: string };
type Stored = Row & { seq: number };

function fakeBackend(count: number) {
  let db: Stored[] = [];
  let seq = 0;
  const add = (name: string) => {
    const row = { id: `g${seq + 1}`, name, seq: ++seq };
    db.push(row);
    return row;
  };
  for (let i = 1; i <= count; i++) add(`Group ${i}`);
  const sorted = () => [...db].sort((a, b) => b.seq - a.seq);

  const failures: { method: string; path: RegExp; status: number; body: unknown }[] = [];
  const calls: string[] = [];

  const handle = (method: string, url: string, body: any): [number, unknown] => {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/api\/v1/, '');
    calls.push(`${method} ${path}`);
    const f = failures.findIndex((x) => x.method === method && x.path.test(path));
    if (f >= 0) {
      const [hit] = failures.splice(f, 1);
      return [hit.status, hit.body];
    }
    const ok = (data: unknown = {}) => [200, { success: true, data }] as [number, unknown];
    if (method === 'GET' && path === '/broadcast-groups') {
      const page = Number(u.searchParams.get('page'));
      const limit = Number(u.searchParams.get('limit'));
      const rows = sorted();
      return ok({
        broadcast_groups: rows.slice((page - 1) * limit, page * limit).map(({ id, name }) => ({ id, name })),
        total: rows.length,
        page,
        limit,
        total_pages: Math.ceil(rows.length / limit),
      });
    }
    if (method === 'POST' && path === '/broadcast-groups') return ok(add(body.name));
    if (method === 'POST' && path === '/broadcast-groups/duplicate') {
      (body.broadcast_group_ids as string[]).forEach((id) => add(`${db.find((g) => g.id === id)!.name} (duplicate)`));
      return ok();
    }
    if (method === 'DELETE' && path === '/broadcast-groups') {
      db = db.filter((g) => !(body.broadcast_group_ids as string[]).includes(g.id));
      return ok();
    }
    const one = path.match(/^\/broadcast-groups\/([^/]+)$/);
    if (one && method === 'PUT') {
      db.find((g) => g.id === one[1])!.name = body.name;
      return ok();
    }
    return [404, { detail: 'Not Found' }];
  };

  return {
    calls,
    failures,
    handle,
    firstBatch: () => sorted().slice(0, PAGE_SIZE).map(({ id, name }) => ({ id, name })),
    exists: (id: string) => db.some((g) => g.id === id),
  };
}

let backend: ReturnType<typeof fakeBackend>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test/api/v1');
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init: RequestInit) => {
      const [status, body] = backend.handle(
        init.method ?? 'GET',
        String(url),
        typeof init.body === 'string' ? JSON.parse(init.body) : undefined
      );
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })),
          LATENCY
        )
      );
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// ─── The page ──────────────────────────────────────────────────────────────
type Frame = { ids: string[]; names: string[]; isLoading: boolean; loadedCount: number };
type ListResponse = { data?: { broadcast_groups?: Row[]; total?: number } };
type AnyMutation = MutationObserverOptions<unknown, Error, unknown>;

const getRowId = (row: Row) => row.id;

async function openGroupsPage() {
  const client = new QueryClient({
    // Same defaults as makeQueryClient() in lib/ReactQueryProvider.tsx.
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: 1,
      },
      mutations: { retry: 0 },
    },
  });
  ctx.client = client;

  // GroupBroadcastingClient's pagination, and SuperTable's own page index.
  const state = { pageIndex: 0, tablePageIndex: 0, listVersion: 0, writesInFlight: 0 };
  let appliedRestartKey = 0;

  const listParams = () => ({ page: state.pageIndex + 1, limit: PAGE_SIZE });
  // As useBaseQuery prepares them: defaulted, optimistic results on.
  const listOptions = () => ({
    ...client.defaultQueryOptions(
      // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
      useGroupBroadcasts(listParams()) as unknown as QueryObserverOptions
    ),
    _optimisticResults: 'optimistic' as const,
  });
  const list = new QueryObserver(client, listOptions());

  runner.mount();
  const frames: Frame[] = [];
  const renderOnce = () => {
    const result = list.getOptimisticResult(listOptions());
    const resp = result.data as ListResponse | undefined;
    const isLoading = result.isLoading || state.writesInFlight > 0;
    const lazy = runner.render(() =>
      useLazyRows<Row>({
        enabled: true,
        data: resp?.data?.broadcast_groups || [],
        pageIndex: state.tablePageIndex,
        pageSize: PAGE_SIZE,
        rowCount: resp?.data?.total,
        isFetching: undefined,
        isLoading,
        getRowId,
        // SuperTable: the list identity, then "|" and restartKey.
        resetToken: `${JSON.stringify([])}|${state.listVersion}`,
      })
    );
    frames.push({
      ids: lazy.rows.map((r) => r.id),
      names: lazy.rows.map((r) => r.name),
      isLoading,
      loadedCount: lazy.loadedCount,
    });
  };

  // A React commit: render, then useTableState's restartKey effect, then
  // onStateChange reaching the page, then useBaseQuery's setOptions.
  const commit = () => {
    renderOnce();
    if (appliedRestartKey !== state.listVersion) {
      appliedRestartKey = state.listVersion;
      if (state.tablePageIndex !== 0) {
        state.tablePageIndex = 0;
        renderOnce();
      }
    }
    if (state.pageIndex !== state.tablePageIndex) {
      state.pageIndex = state.tablePageIndex;
      renderOnce();
    }
    list.setOptions(listOptions());
  };
  let scheduled = false;
  const scheduleRender = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      commit();
    }, 0);
  };
  const setState = (update: (s: typeof state) => void) => {
    update(state);
    scheduleRender();
  };
  list.subscribe(scheduleRender);

  // ── GroupBroadcastingClient, same steps in the same order ──
  // Its useListRefresh, minus React: the same code the page runs.
  const listRefresh = createListRefresher({
    queryClient: client,
    getBatchIndex: () => state.pageIndex,
    getFirstBatchKey: () => groupBroadcastsKey({ ...listParams(), page: 1 }),
    onWriteCountChange: (delta) => setState((s) => { s.writesInFlight += delta; }),
    restart: () => setState((s) => { s.listVersion += 1; }),
  });

  /* eslint-disable react-hooks/rules-of-hooks -- mocked: return their options */
  const m = {
    create: new MutationObserver(client, useCreateGroupBroadcast() as unknown as AnyMutation),
    update: new MutationObserver(client, useUpdateGroupBroadcast() as unknown as AnyMutation),
    remove: new MutationObserver(client, useDeleteGroupBroadcast() as unknown as AnyMutation),
    duplicate: new MutationObserver(client, useDuplicateGroupBroadcasts() as unknown as AnyMutation),
  };
  /* eslint-enable react-hooks/rules-of-hooks */

  // A modal (Add, Edit): save, then onSuccess on success only.
  const modalSave = async (run: () => Promise<unknown>) => {
    try {
      await run();
      void listRefresh.refreshAfterSave();
    } catch {
      /* the modal shows the error and stays open */
    }
  };

  const toasts: string[] = [];
  const settle = () => vi.advanceTimersByTimeAsync(5_000);
  await settle();

  return {
    state,
    frames,
    toasts,
    settle,
    async act<T>(started: Promise<T>) {
      await settle();
      return started;
    },
    screen: () => frames[frames.length - 1],
    async loadMore() {
      setState((s) => { s.tablePageIndex += 1; });
      await settle();
    },
    add: (name: string) => modalSave(() => m.create.mutate({ name })),
    edit: (id: string, name: string) => modalSave(() => m.update.mutate({ id, name })),
    duplicate: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          await m.duplicate.mutate({ broadcast_group_ids: ids });
          toasts.push('success');
          await listRefresh.refresh();
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
        }
      }),
    confirmDelete: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          await m.remove.mutate({ broadcast_group_ids: ids });
          toasts.push('success');
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
          return;
        }
        await listRefresh.refresh();
      }),
  };
}

const listGets = (calls: string[], from: number) => calls.slice(from).filter((c) => c.startsWith('GET'));
const emptyFlashes = (frames: Frame[], from: number) =>
  frames.slice(from).filter((f) => f.loadedCount === 0 && !f.isLoading).length;
const skeletonFrames = (frames: Frame[], from: number) =>
  frames.slice(from).filter((f) => f.loadedCount === 0 && f.isLoading).length;

// ─── Scenarios ─────────────────────────────────────────────────────────────
describe('Group Broadcasting: end to end', () => {
  describe('exactly one list request per action - batch 1 - and the screen matches the server', () => {
    type Page = Awaited<ReturnType<typeof openGroupsPage>>;
    const actions: [string, (p: Page) => Promise<unknown>][] = [
      ['delete one', (p) => p.confirmDelete(['g5'])],
      ['delete three (bulk)', (p) => p.confirmDelete(['g5', 'g4', 'g3'])],
      ['duplicate', (p) => p.duplicate(['g3'])],
      ['add (modal)', (p) => p.add('New group')],
      ['edit (modal)', (p) => p.edit('g5', 'Renamed')],
    ];
    for (const [label, act] of actions) {
      for (const batches of [1, 2]) {
        it(`${label}, ${batches} batch(es) loaded`, async () => {
          backend = fakeBackend(5);
          const page = await openGroupsPage();
          if (batches === 2) await page.loadMore();
          const from = { calls: backend.calls.length, frames: page.frames.length };

          await page.act(act(page));
          await page.settle();

          expect(listGets(backend.calls, from.calls)).toEqual(['GET /broadcast-groups']);
          expect(page.screen().ids).toEqual(backend.firstBatch().map((g) => g.id));
          expect(page.screen().names).toEqual(backend.firstBatch().map((g) => g.name));
          expect(page.screen().isLoading).toBe(false);
          expect(emptyFlashes(page.frames, from.frames)).toBe(0);
        });
      }
    }
  });

  it('delete a batch-1 group after loading 2 batches: it is gone from the screen', async () => {
    backend = fakeBackend(5);
    const page = await openGroupsPage();
    await page.loadMore();
    expect(page.screen().ids).toContain('g5');

    await page.act(page.confirmDelete(['g5']));
    await page.settle();

    expect(backend.exists('g5')).toBe(false);
    expect(page.screen().ids).not.toContain('g5');
  });

  it('edit with one batch: the new name shows with no skeleton in between', async () => {
    backend = fakeBackend(3);
    const page = await openGroupsPage();
    const from = page.frames.length;

    await page.act(page.edit('g2', 'Renamed'));
    await page.settle();

    expect(page.screen().names).toContain('Renamed');
    expect(skeletonFrames(page.frames, from)).toBe(0);
  });

  it('delete fails: error toast, no list request, rows untouched, loading off', async () => {
    backend = fakeBackend(5);
    const page = await openGroupsPage();
    const before = page.screen().ids;
    const from = backend.calls.length;
    backend.failures.push({
      method: 'DELETE',
      path: /^\/broadcast-groups$/,
      status: 500,
      body: { success: false, message: 'Internal error' },
    });

    await page.act(page.confirmDelete(['g5']));
    await page.settle();

    expect(page.toasts).toEqual(['error: Internal error']);
    expect(listGets(backend.calls, from)).toEqual([]);
    expect(page.screen().ids).toEqual(before);
    expect(page.screen().isLoading).toBe(false);
  });
});
