import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MutationObserver,
  QueryClient,
  QueryObserver,
  type MutationObserverOptions,
  type QueryObserverOptions,
} from '@tanstack/query-core';

// End-to-end flow of the Template Broadcasting list, minus the DOM - the same
// harness as BroadcastingWAClient.flow.test.ts: real hooks and fetchers
// against a fake backend, the real TanStack engine, the real useLazyRows, and
// SuperTable's resetPageKey/restartKey and onStateChange effects replayed
// between renders.
// Every render is recorded, so a frame that would paint "No templates found"
// is caught however briefly it lasts.

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
  broadcastTemplatesKey,
  useBroadcastTemplates,
  useBulkDeleteBroadcastTemplates,
  useDeleteBroadcastTemplate,
  useDuplicateBroadcastTemplates,
} from '@/lib/hooks/useBroadcastTemplates';
import { createListRefresher } from '@/lib/hooks/useListRefresh';

const PAGE_SIZE = 3;
const LATENCY = 300;

// ─── Fake backend ──────────────────────────────────────────────────────────
type Row = { id: string; friendly_name: string };
type Stored = Row & { account: string; seq: number };

function fakeBackend(perAccount: Record<string, number>) {
  const db: Stored[] = [];
  let seq = 0;
  const add = (account: string, friendly_name: string) => {
    const row = { id: `t${seq + 1}`, friendly_name, account, seq: ++seq };
    db.push(row);
    return row;
  };
  for (const [account, count] of Object.entries(perAccount)) {
    for (let i = 1; i <= count; i++) add(account, `${account}_template_${i}`);
  }
  const listOf = (account: string | null) =>
    db.filter((t) => t.account === account).sort((a, b) => b.seq - a.seq);

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
    if (method === 'GET' && path === '/broadcast-templates') {
      const p = u.searchParams;
      const rows = listOf(p.get('account_id'));
      const page = Number(p.get('page'));
      const limit = Number(p.get('limit'));
      return [200, {
        success: true,
        data: {
          templates: rows.slice((page - 1) * limit, page * limit).map(({ id, friendly_name }) => ({ id, friendly_name })),
          total: rows.length,
          page,
          limit,
          total_pages: Math.ceil(rows.length / limit),
        },
      }];
    }
    if (method === 'POST' && path === '/broadcast-templates/duplicate') {
      const made = (body.template_ids as string[]).map((id) => {
        const src = db.find((t) => t.id === id)!;
        return add(src.account, `${src.friendly_name}_duplicate`);
      });
      return [201, { success: true, data: { total: made.length, created: true } }];
    }
    // The API has no bulk delete: DELETE on the collection is not a route.
    if (method === 'DELETE' && path === '/broadcast-templates') {
      return [405, { detail: 'Method Not Allowed' }];
    }
    const one = path.match(/^\/broadcast-templates\/([^/]+)$/);
    if (one && method === 'DELETE') {
      const i = db.findIndex((t) => t.id === one[1]);
      if (i < 0) return [404, { success: false, message: 'Template not found' }];
      db.splice(i, 1);
      return [200, { success: true, data: { id: one[1], deleted: true } }];
    }
    return [404, { detail: 'Not Found' }];
  };

  return {
    calls,
    failures,
    handle,
    firstBatch: (account: string) =>
      listOf(account).slice(0, PAGE_SIZE).map(({ id, friendly_name }) => ({ id, friendly_name })),
    exists: (id: string) => db.some((t) => t.id === id),
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
type Frame = { ids: string[]; isLoading: boolean; loadedCount: number };
type ListResponse = { data?: { templates?: Row[]; total?: number } };
type AnyMutation = MutationObserverOptions<unknown, Error, unknown>;

const getRowId = (row: Row) => row.id;

const appQueryClient = () =>
  new QueryClient({
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

/**
 * @param accounts how the WhatsApp accounts arrive: 'cached' (already there,
 *   as on a Back navigation) or a delay in ms (first open / refresh).
 */
async function openTemplatesPage(opts: { client?: QueryClient; accounts?: 'cached' | number } = {}) {
  const client = opts.client ?? appQueryClient();
  ctx.client = client;
  const accountsCached = opts.accounts === 'cached';

  // BroadcastTemplatesClient's state, and SuperTable's own page index.
  const state = {
    accountId: accountsCached ? 'A' : '',
    isAccountsPending: !accountsCached,
    page: 1,
    tablePageIndex: 0,
    listVersion: 0,
    writesInFlight: 0,
  };
  // resetPageKey={accountId} restartKey={listVersion}: either one sends the
  // table back to batch 1.
  const resetKeys = () => `${state.accountId}|${state.listVersion}`;
  let appliedResetKeys = resetKeys();

  const listParams = () => ({
    page: state.page,
    limit: PAGE_SIZE,
    search: undefined,
    account_id: state.accountId || undefined,
  });
  // As useBaseQuery prepares them: defaulted, optimistic results on.
  const listOptions = () => ({
    ...client.defaultQueryOptions(
      // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
      useBroadcastTemplates(listParams(), { enabled: !!state.accountId }) as unknown as QueryObserverOptions
    ),
    _optimisticResults: 'optimistic' as const,
  });
  const list = new QueryObserver(client, listOptions());

  runner.mount();
  const frames: Frame[] = [];
  const renderOnce = () => {
    const result = list.getOptimisticResult(listOptions());
    const resp = result.data as ListResponse | undefined;
    // The page's own composition, as passed to the table.
    const isLoading = result.isLoading || state.isAccountsPending || state.writesInFlight > 0;
    const lazy = runner.render(() =>
      useLazyRows<Row>({
        enabled: true,
        data: resp?.data?.templates || [],
        pageIndex: state.tablePageIndex,
        pageSize: PAGE_SIZE,
        rowCount: resp?.data?.total || 0,
        isFetching: undefined,
        isLoading,
        getRowId,
        // SuperTable: the list identity (with resetPageKey), then "|" and restartKey.
        resetToken: `${JSON.stringify([state.accountId])}|${state.listVersion}`,
      })
    );
    frames.push({ ids: lazy.rows.map((r) => r.id), isLoading, loadedCount: lazy.loadedCount });
  };

  // A React commit: render, then useTableState's resetPageKey/restartKey effect, then
  // onStateChange reaching the page (handleStateChange), then useBaseQuery's
  // setOptions - re-rendering after each.
  const commit = () => {
    renderOnce();
    if (appliedResetKeys !== resetKeys()) {
      appliedResetKeys = resetKeys();
      if (state.tablePageIndex !== 0) {
        state.tablePageIndex = 0;
        renderOnce();
      }
    }
    if (state.page !== state.tablePageIndex + 1) {
      state.page = state.tablePageIndex + 1;
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
  scheduleRender();

  if (!accountsCached) {
    setTimeout(() => setState((s) => {
      s.isAccountsPending = false;
      s.accountId = 'A';
    }), opts.accounts as number);
  }

  // ── BroadcastTemplatesClient, same steps in the same order ──
  // Its useListRefresh, minus React: the same code the page runs.
  const listRefresh = createListRefresher({
    queryClient: client,
    getBatchIndex: () => state.page - 1,
    getFirstBatchKey: () => broadcastTemplatesKey({ ...listParams(), page: 1 }),
    onWriteCountChange: (delta) => setState((s) => { s.writesInFlight += delta; }),
    restart: () => setState((s) => { s.listVersion += 1; }),
  });

  /* eslint-disable react-hooks/rules-of-hooks -- mocked: return their options */
  const duplicate = new MutationObserver(client, useDuplicateBroadcastTemplates() as unknown as AnyMutation);
  const removeOne = new MutationObserver(client, useDeleteBroadcastTemplate() as unknown as AnyMutation);
  const removeMany = new MutationObserver(client, useBulkDeleteBroadcastTemplates() as unknown as AnyMutation);
  /* eslint-enable react-hooks/rules-of-hooks */

  const toasts: string[] = [];
  const settle = () => vi.advanceTimersByTimeAsync(5_000);
  await settle();

  return {
    client,
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
    switchAccount(id: string) {
      // AccountSelect's onChange: setAccountId(id); setPage(1).
      setState((s) => {
        s.accountId = id;
        s.page = 1;
      });
    },
    leave() {
      list.destroy();
    },
    duplicate: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          await duplicate.mutate({ template_ids: ids });
          toasts.push('success');
          await listRefresh.refresh();
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
        }
      }),
    confirmDelete: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          if (ids.length === 1) await removeOne.mutate(ids[0]);
          else await removeMany.mutate(ids);
          toasts.push('success');
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
        }
        await listRefresh.refresh();
      }),
  };
}

const listGets = (calls: string[], from: number) => calls.slice(from).filter((c) => c.startsWith('GET'));

/** No frame may show an empty, not-loading table while the account has rows. */
const emptyFlashes = (frames: Frame[], from: number) =>
  frames.slice(from).filter((f) => f.loadedCount === 0 && !f.isLoading).length;

// ─── Scenarios ─────────────────────────────────────────────────────────────
describe('Template Broadcasting: end to end', () => {
  describe('exactly one list request per action - batch 1 - and the screen matches the server', () => {
    type Page = Awaited<ReturnType<typeof openTemplatesPage>>;
    const actions: [string, (p: Page) => Promise<unknown>][] = [
      ['duplicate', (p) => p.duplicate(['t5'])],
      ['delete one', (p) => p.confirmDelete(['t5'])],
      ['delete three (bulk)', (p) => p.confirmDelete(['t5', 't4', 't3'])],
    ];
    for (const [label, act] of actions) {
      for (const batches of [1, 2]) {
        it(`${label}, ${batches} batch(es) loaded`, async () => {
          backend = fakeBackend({ A: 5 });
          const page = await openTemplatesPage({ accounts: 'cached' });
          if (batches === 2) await page.loadMore();
          const from = { calls: backend.calls.length, frames: page.frames.length };

          await page.act(act(page));
          await page.settle();

          expect(page.toasts).toEqual(['success']);
          expect(listGets(backend.calls, from.calls)).toEqual(['GET /broadcast-templates']);
          expect(page.screen().ids).toEqual(backend.firstBatch('A').map((t) => t.id));
          expect(page.screen().isLoading).toBe(false);
          expect(emptyFlashes(page.frames, from.frames)).toBe(0);
        });
      }
    }
  });

  it('bulk delete uses DELETE per id, never DELETE on the collection (405)', async () => {
    backend = fakeBackend({ A: 5 });
    const page = await openTemplatesPage({ accounts: 'cached' });
    const from = backend.calls.length;

    await page.act(page.confirmDelete(['t5', 't4', 't3']));
    await page.settle();

    expect(backend.calls.slice(from).filter((c) => c.startsWith('DELETE'))).toEqual([
      'DELETE /broadcast-templates/t5',
      'DELETE /broadcast-templates/t4',
      'DELETE /broadcast-templates/t3',
    ]);
  });

  it('bulk delete, one fails: the others are gone, the error counts the failure, the list is current', async () => {
    backend = fakeBackend({ A: 5 });
    const page = await openTemplatesPage({ accounts: 'cached' });
    backend.failures.push({ method: 'DELETE', path: /\/t4$/, status: 500, body: { success: false, message: 'Twilio error' } });

    await page.act(page.confirmDelete(['t5', 't4', 't3']));
    await page.settle();

    expect(page.toasts).toEqual(['error: 1 of 3 template(s) could not be deleted.']);
    expect(backend.exists('t5')).toBe(false);
    expect(backend.exists('t4')).toBe(true);
    expect(backend.exists('t3')).toBe(false);
    expect(page.screen().ids).toEqual(backend.firstBatch('A').map((t) => t.id));
  });

  it('duplicate fails: error toast, no list request, rows untouched, loading off', async () => {
    backend = fakeBackend({ A: 5 });
    const page = await openTemplatesPage({ accounts: 'cached' });
    const before = page.screen().ids;
    const from = backend.calls.length;
    backend.failures.push({ method: 'POST', path: /duplicate$/, status: 500, body: { success: false, message: 'Internal error' } });

    await page.act(page.duplicate(['t5']));
    await page.settle();

    expect(page.toasts).toEqual(['error: Internal error']);
    expect(listGets(backend.calls, from)).toEqual([]);
    expect(page.screen().ids).toEqual(before);
    expect(page.screen().isLoading).toBe(false);
  });

  it('first open / refresh: a skeleton while the WhatsApp accounts load, never "No templates found"', async () => {
    backend = fakeBackend({ A: 5 });
    const page = await openTemplatesPage({ accounts: 1_500 });

    expect(emptyFlashes(page.frames, 0)).toBe(0);
    expect(page.frames.some((f) => f.loadedCount === 0 && f.isLoading)).toBe(true); // skeleton
    expect(page.screen().ids).toEqual(backend.firstBatch('A').map((t) => t.id));
  });

  it('switch WhatsApp account after loading 2 batches: only the new account\'s templates, no mixing', async () => {
    backend = fakeBackend({ A: 5, B: 4 });
    const page = await openTemplatesPage({ accounts: 'cached' });
    await page.loadMore();
    expect(page.screen().ids).toHaveLength(5);
    const from = page.frames.length;

    page.switchAccount('B');
    await page.settle();

    expect(page.screen().ids).toEqual(backend.firstBatch('B').map((t) => t.id));
    expect(emptyFlashes(page.frames, from)).toBe(0);
  });

  it('back from a template after 30 s (stale cache): cached rows paint at once, no empty frame', async () => {
    backend = fakeBackend({ A: 5 });
    const first = await openTemplatesPage({ accounts: 'cached' });
    first.leave();
    await vi.advanceTimersByTimeAsync(31_000);

    const back = await openTemplatesPage({ client: first.client, accounts: 'cached' });

    expect(back.frames[0].ids).toEqual(backend.firstBatch('A').map((t) => t.id)); // first frame, from cache
    expect(emptyFlashes(back.frames, 0)).toBe(0);
  });
});
