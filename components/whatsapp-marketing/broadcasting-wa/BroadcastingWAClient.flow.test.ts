import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MutationObserver,
  QueryClient,
  QueryObserver,
  type MutationObserverOptions,
  type QueryObserverOptions,
} from '@tanstack/query-core';

// End-to-end flow of the Broadcasting WA list, minus the DOM: the real hooks
// and API client against a fake backend, the real TanStack engine, and the
// real useLazyRows fed exactly what SuperTable feeds it - with SuperTable's
// two effects that matter here (restartKey → page 1, onStateChange → the
// page's query key) replayed between renders. Every render is recorded, so a
// frame that would paint "No broadcasts found" is caught even if it lasts
// one frame and no human would see it.

// useLazyRows needs useRef/useMemo/useCallback only - see useLazyRows.test.ts.
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
vi.mock('@/lib/utils/logger', () => ({
  logger: new Proxy({}, { get: () => () => {} }),
}));

import { useLazyRows } from '@/components/ui/super-table/hooks/useLazyRows';
import {
  broadcastsKey,
  useBroadcasts,
  useCreateBroadcast,
  useDeleteBroadcast,
  useDuplicateBroadcast,
  useUpdateBroadcast,
} from '@/lib/hooks/useBroadcasts';
import { createListRefresher } from '@/lib/hooks/useListRefresh';

const PAGE_SIZE = 3;
const LATENCY = 300;

// ─── Fake backend ──────────────────────────────────────────────────────────
type Row = { id: string; name: string; status: string };
type Stored = Row & { seq: number };

function fakeBackend(count: number) {
  const db: Stored[] = [];
  let seq = 0;
  const add = (name: string, status = 'Draft') => {
    const row = { id: `b${seq + 1}`, name, status, seq: ++seq };
    db.push(row);
    return row;
  };
  for (let i = 1; i <= count; i++) add(`Broadcast ${i}`);

  const sorted = (status: string | null, order: string) =>
    db
      .filter((b) => !status || b.status === status)
      .sort((a, b) => (order === 'desc' ? b.seq - a.seq : a.seq - b.seq));

  const failures: { method: string; path: RegExp; status: number; body: unknown }[] = [];
  const calls: string[] = [];

  // Applied when the request ARRIVES; the answer comes back LATENCY later.
  const handle = (method: string, url: string, body: any): [number, unknown] => {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/api\/v1/, '');
    calls.push(`${method} ${path}`);
    const f = failures.findIndex((x) => x.method === method && x.path.test(path));
    if (f >= 0) {
      const [hit] = failures.splice(f, 1);
      return [hit.status, hit.body];
    }
    if (method === 'GET' && path === '/broadcasts') {
      const p = u.searchParams;
      const rows = sorted(p.get('status'), p.get('sort_order') ?? 'desc');
      const page = Number(p.get('page'));
      const limit = Number(p.get('limit'));
      return [200, {
        success: true,
        data: {
          broadcasts: rows.slice((page - 1) * limit, page * limit).map(({ seq: _s, ...r }) => ({ ...r })),
          total: rows.length,
          page,
          limit,
          total_pages: Math.ceil(rows.length / limit),
        },
      }];
    }
    if (method === 'POST' && path === '/broadcasts') {
      const row = add(body.name, body.action === 'send' ? 'In Queue' : 'Draft');
      return [201, { success: true, data: row }];
    }
    if (method === 'POST' && path === '/broadcasts/duplicate') {
      const made = (body.broadcast_ids as string[]).map((id) => add(`${db.find((b) => b.id === id)!.name} (duplicate)`));
      return [201, { success: true, data: { total: made.length } }];
    }
    const one = path.match(/^\/broadcasts\/([^/]+)$/);
    if (one && method === 'PUT') {
      const row = db.find((b) => b.id === one[1])!;
      row.name = body.name;
      if (body.action === 'send') row.status = 'In Queue';
      return [200, { success: true, data: row }];
    }
    if (one && method === 'DELETE') {
      db.splice(db.findIndex((b) => b.id === one[1]), 1);
      return [200, { success: true, data: { id: one[1], deleted: true } }];
    }
    return [404, { detail: 'Not Found' }];
  };

  return {
    calls,
    failures,
    handle,
    /** What batch 1 should show right now. */
    firstBatch: (status: string | null = null, order = 'desc') =>
      sorted(status, order).slice(0, PAGE_SIZE).map(({ id, name, status: s }) => ({ id, name, status: s })),
    total: (status: string | null = null) => sorted(status, 'desc').length,
    find: (name: string) => db.find((b) => b.name === name),
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
type ListResponse = { data?: { broadcasts?: Row[]; total?: number } };
type AnyMutation = MutationObserverOptions<unknown, Error, unknown>;

const getRowId = (row: Row) => row.id;

async function openBroadcastsPage(opts: { status?: string; sortOrder?: 'asc' | 'desc' } = {}) {
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
  const sortOrder = opts.sortOrder ?? 'desc';

  // BroadcastingWAClient's state, and SuperTable's own copy of the page index.
  const state = { clientPageIndex: 0, tablePageIndex: 0, listVersion: 0, writesInFlight: 0 };
  let appliedResetKey = 0;

  // Options as useBaseQuery prepares them: defaulted, with optimistic results
  // on - a query about to fetch already reads as loading on that render.
  const optionsFor = (pageIndex: number) => ({
    ...client.defaultQueryOptions(
      // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
      useBroadcasts(pageIndex + 1, PAGE_SIZE, '', opts.status, 'created_at', sortOrder) as unknown as QueryObserverOptions
    ),
    _optimisticResults: 'optimistic' as const,
  });
  const list = new QueryObserver(client, optionsFor(0));

  // What useBaseQuery does on every render: read the query state right now.
  runner.mount();
  const frames: Frame[] = [];
  const renderOnce = () => {
    const result = list.getOptimisticResult(optionsFor(state.clientPageIndex));
    const resp = result.data as ListResponse | undefined;
    const isLoading = result.isLoading || state.writesInFlight > 0;
    const lazy = runner.render(() =>
      useLazyRows<Row>({
        enabled: true,
        data: resp?.data?.broadcasts || [],
        pageIndex: state.tablePageIndex,
        pageSize: PAGE_SIZE,
        rowCount: resp?.data?.total,
        isFetching: undefined,
        isLoading,
        getRowId,
        // SuperTable: the list identity, then "|" and restartKey.
        resetToken: `${JSON.stringify([opts.status ?? null, sortOrder])}|${state.listVersion}`,
      })
    );
    frames.push({
      ids: lazy.rows.map((r) => r.id),
      names: lazy.rows.map((r) => r.name),
      isLoading,
      loadedCount: lazy.loadedCount,
    });
  };

  // A React commit: render, then the effects that move state, re-rendering
  // after each - useTableState's restartKey effect, then onStateChange
  // reaching the page, then useBaseQuery's setOptions for the new key.
  const commit = () => {
    renderOnce();
    if (appliedResetKey !== state.listVersion) {
      appliedResetKey = state.listVersion;
      if (state.tablePageIndex !== 0) {
        state.tablePageIndex = 0;
        renderOnce();
      }
    }
    if (state.clientPageIndex !== state.tablePageIndex) {
      state.clientPageIndex = state.tablePageIndex;
      renderOnce();
      list.setOptions(optionsFor(state.clientPageIndex));
    }
  };
  // React batches every update made in the same task into one render.
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

  // ── BroadcastingWAClient, same steps in the same order ──
  // Its useListRefresh, minus React: the same code the page runs.
  const listRefresh = createListRefresher({
    queryClient: client,
    getBatchIndex: () => state.clientPageIndex,
    getFirstBatchKey: () => broadcastsKey(1, PAGE_SIZE, '', opts.status, 'created_at', sortOrder),
    onWriteCountChange: (delta) => setState((s) => { s.writesInFlight += delta; }),
    restart: () => setState((s) => { s.listVersion += 1; }),
  });

  /* eslint-disable react-hooks/rules-of-hooks -- mocked: return their options */
  const create = new MutationObserver(client, useCreateBroadcast() as unknown as AnyMutation);
  const update = new MutationObserver(client, useUpdateBroadcast() as unknown as AnyMutation);
  const duplicate = new MutationObserver(client, useDuplicateBroadcast() as unknown as AnyMutation);
  const remove = new MutationObserver(client, useDeleteBroadcast() as unknown as AnyMutation);
  /* eslint-enable react-hooks/rules-of-hooks */

  // Modal submit: mutate, close, and only on success tell the page.
  const submit = async (run: () => Promise<unknown>) => {
    try {
      await run();
      void listRefresh.refreshAfterSave();
      return 'saved';
    } catch {
      return 'error';
    }
  };

  const settle = () => vi.advanceTimersByTimeAsync(5_000);
  await settle(); // batch 1 lands

  return {
    state,
    frames,
    settle,
    /** Let an already-started action run to completion under fake timers. */
    async act<T>(started: Promise<T>) {
      await settle();
      return started;
    },
    screen: () => frames[frames.length - 1],
    async loadMore() {
      setState((s) => { s.tablePageIndex += 1; });
      await settle();
    },
    createBroadcast: (name: string, action: 'draft' | 'send' = 'draft') =>
      submit(() => create.mutate({ name, action })),
    editBroadcast: (id: string, name: string, action: 'draft' | 'send' = 'draft') =>
      submit(() => update.mutate({ id, data: { name, action } })),
    duplicate: (id: string) =>
      listRefresh.run(async () => {
        try {
          await duplicate.mutate([id]);
          await listRefresh.refresh();
        } catch {
          /* toast */
        }
      }),
    confirmDelete: (id: string) =>
      listRefresh.run(async () => {
        try {
          await remove.mutate(id);
        } catch {
          /* toast */
        }
        await listRefresh.refresh();
      }),
    // performBulkDelete: one DELETE per row, then one refresh.
    bulkDelete: (ids: string[]) =>
      listRefresh.run(async () => {
        for (const id of ids) {
          try {
            await remove.mutate(id);
          } catch {
            /* counted as failed */
          }
        }
        await listRefresh.refresh();
      }),
  };
}

/** No frame may show an empty, not-loading table while the server has rows. */
function expectNoEmptyStateFlash(frames: Frame[], from: number, serverHasRows: boolean) {
  if (!serverHasRows) return;
  const flashes = frames.slice(from).filter((f) => f.loadedCount === 0 && !f.isLoading);
  expect(flashes).toHaveLength(0);
}

const skeletonFrames = (frames: Frame[], from: number) =>
  frames.slice(from).filter((f) => f.loadedCount === 0 && f.isLoading).length;

// ─── Scenarios ─────────────────────────────────────────────────────────────
describe('Broadcasting WA: Create / Edit / Duplicate / Delete, end to end', () => {
  it('edit a name, one batch: the new name shows, no skeleton, no empty frame', async () => {
    backend = fakeBackend(3);
    const page = await openBroadcastsPage();
    const from = page.frames.length;

    expect(await page.act(page.editBroadcast('b2', 'Renamed'))).toBe('saved');
    await page.settle();

    expect(page.screen().names).toEqual(backend.firstBatch().map((b) => b.name));
    expect(page.screen().names).toContain('Renamed');
    expect(page.screen().isLoading).toBe(false);
    expect(skeletonFrames(page.frames, from)).toBe(0);
    expectNoEmptyStateFlash(page.frames, from, true);
  });

  it('edit + Send, one batch: the status change shows', async () => {
    backend = fakeBackend(3);
    const page = await openBroadcastsPage();

    await page.act(page.editBroadcast('b3', 'Go live', 'send'));
    await page.settle();

    const last = page.frames[page.frames.length - 1];
    expect(last.names).toContain('Go live');
    expect(backend.find('Go live')?.status).toBe('In Queue');
  });

  it('create, one batch: the new broadcast is the first row', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage();
    const from = page.frames.length;

    await page.act(page.createBroadcast('Fresh'));
    await page.settle();

    expect(page.screen().names[0]).toBe('Fresh');
    expect(page.screen().ids).toEqual(backend.firstBatch().map((b) => b.id));
    expectNoEmptyStateFlash(page.frames, from, true);
  });

  it('create after loading 2 batches: back to batch 1 with the new row on top, skeleton allowed, no empty frame', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage();
    await page.loadMore();
    expect(page.screen().ids).toHaveLength(5);
    const from = page.frames.length;

    await page.act(page.createBroadcast('Fresh'));
    await page.settle();

    expect(page.state.tablePageIndex).toBe(0);
    expect(page.screen().ids).toEqual(backend.firstBatch().map((b) => b.id));
    expect(page.screen().names[0]).toBe('Fresh');
    expectNoEmptyStateFlash(page.frames, from, true);
    console.info('[create, 2 batches] skeleton frames:', skeletonFrames(page.frames, from));
  });

  it('edit a row in batch 1 after loading 2 batches: the new name shows', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage();
    await page.loadMore();
    const from = page.frames.length;

    await page.act(page.editBroadcast('b5', 'Top renamed'));
    await page.settle();

    expect(page.screen().names).toEqual(backend.firstBatch().map((b) => b.name));
    expect(page.screen().names[0]).toBe('Top renamed');
    expectNoEmptyStateFlash(page.frames, from, true);
  });

  it('cancel (modal closed without saving): no request, no reload, nothing moves', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage();
    await page.loadMore();
    const callsBefore = backend.calls.length;
    const framesBefore = page.frames.length;

    // Cancel only runs onClose; onSaved is never called.
    await page.settle();

    expect(backend.calls.length).toBe(callsBefore);
    expect(page.frames.length).toBe(framesBefore);
    expect(page.state.listVersion).toBe(0);
    expect(page.state.tablePageIndex).toBe(1);
  });

  it('save fails (422): no reload, rows untouched, loading never switched on', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage();
    const before = page.screen();
    const from = page.frames.length;
    backend.failures.push({
      method: 'POST',
      path: /^\/broadcasts$/,
      status: 422,
      body: { success: false, error: { code: 'TEMPLATE_VARIABLES_INVALID', message: 'Invalid', details: {} } },
    });

    expect(await page.act(page.createBroadcast('Broken'))).toBe('error');
    await page.settle();

    expect(page.state.listVersion).toBe(0);
    expect(page.screen().ids).toEqual(before.ids);
    expect(page.frames.slice(from).every((f) => !f.isLoading)).toBe(true);
  });

  it('status filter "Draft" on, edit + Send: the broadcast leaves the filtered list', async () => {
    backend = fakeBackend(4);
    const page = await openBroadcastsPage({ status: 'Draft' });
    expect(page.screen().ids).toContain('b4');

    await page.act(page.editBroadcast('b4', 'Sent away', 'send'));
    await page.settle();

    expect(page.screen().ids).not.toContain('b4');
    expect(page.screen().ids).toEqual(backend.firstBatch('Draft').map((b) => b.id));
  });

  it('oldest-first sort, create after 2 batches: the list restarts and batch 1 is still the oldest rows', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage({ sortOrder: 'asc' });
    await page.loadMore();

    await page.act(page.createBroadcast('Newest'));
    await page.settle();

    expect(page.screen().ids).toEqual(backend.firstBatch(null, 'asc').map((b) => b.id));
    expect(page.screen().names).not.toContain('Newest'); // it sits at the end now
  });

  it('duplicate, one batch: the copy is the first row', async () => {
    backend = fakeBackend(3);
    const page = await openBroadcastsPage();

    await page.act(page.duplicate('b1'));
    await page.settle();

    expect(page.screen().names[0]).toBe('Broadcast 1 (duplicate)');
  });

  it('delete a batch-1 row after loading 2 batches: it is gone and nothing else is missing', async () => {
    backend = fakeBackend(5);
    const page = await openBroadcastsPage();
    await page.loadMore();
    const from = page.frames.length;

    await page.act(page.confirmDelete('b4'));
    await page.settle();

    expect(page.screen().ids).not.toContain('b4');
    expect(page.screen().ids).toEqual(backend.firstBatch().map((b) => b.id));
    expectNoEmptyStateFlash(page.frames, from, true);
  });

  describe('exactly one list request per action - batch 1 - however many batches were loaded', () => {
    type Page = Awaited<ReturnType<typeof openBroadcastsPage>>;
    const actions: [string, (p: Page) => Promise<unknown>][] = [
      ['duplicate', (p) => p.duplicate('b1')],
      ['delete', (p) => p.confirmDelete('b4')],
      ['bulk delete (3 rows)', (p) => p.bulkDelete(['b5', 'b4', 'b3'])],
      ['create (modal)', (p) => p.createBroadcast('New')],
      ['edit (modal)', (p) => p.editBroadcast('b5', 'Renamed')],
    ];
    for (const [label, act] of actions) {
      for (const batches of [1, 2]) {
        it(`${label}, ${batches} batch(es) loaded`, async () => {
          backend = fakeBackend(5);
          const page = await openBroadcastsPage();
          if (batches === 2) await page.loadMore();
          const before = backend.calls.length;

          await page.act(act(page));
          await page.settle();

          const listCalls = backend.calls.slice(before).filter((c) => c.startsWith('GET'));
          expect(listCalls).toEqual(['GET /broadcasts']);
          expect(page.screen().ids).toEqual(backend.firstBatch().map((b) => b.id));
          expect(page.screen().names).toEqual(backend.firstBatch().map((b) => b.name));
        });
      }
    }
  });

  it('edit and duplicate overlapping: both land, loading ends exactly once at the end', async () => {
    backend = fakeBackend(4);
    const page = await openBroadcastsPage();

    const edit = page.editBroadcast('b4', 'Edited');
    await vi.advanceTimersByTimeAsync(100);
    const dup = page.duplicate('b3');
    await page.settle();
    await Promise.all([edit, dup]);
    await page.settle();

    expect(page.state.writesInFlight).toBe(0);
    expect(page.screen().isLoading).toBe(false);
    expect(page.screen().names).toEqual(backend.firstBatch().map((b) => b.name));
    expect(page.screen().names).toEqual(expect.arrayContaining(['Broadcast 3 (duplicate)', 'Edited']));
  });
});
