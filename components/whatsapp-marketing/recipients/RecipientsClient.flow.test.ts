import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MutationObserver,
  QueryClient,
  QueryObserver,
  type MutationObserverOptions,
  type QueryObserverOptions,
} from '@tanstack/query-core';

// End-to-end flow of the WA Recipients list, minus the DOM - the same harness
// as BroadcastingWAClient.flow.test.ts: real hooks and fetchers against a
// fake backend, the real TanStack engine, the real useLazyRows, and
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
  useBulkCreateWaRecipients,
  useBulkDeleteWaRecipients,
  useCreateWaRecipient,
  useDeleteAllWaRecipients,
  useDeleteWaRecipient,
  useDuplicateWaRecipients,
  useUpdateWaRecipient,
  useWaRecipients,
  waRecipientsKey,
} from '@/lib/hooks/useWaRecipients';
import { createListRefresher } from '@/lib/hooks/useListRefresh';
import type { WaRecipientsParams } from '@/lib/types/whatsapp-marketing';

const PAGE_SIZE = 3;
const LATENCY = 300;

// ─── Fake backend ──────────────────────────────────────────────────────────
type Row = { id: string; name: string };
type Stored = Row & { seq: number };

function fakeBackend(count: number) {
  let db: Stored[] = [];
  let seq = 0;
  const add = (name: string) => {
    const row = { id: `r${seq + 1}`, name, seq: ++seq };
    db.push(row);
    return row;
  };
  for (let i = 1; i <= count; i++) add(`Recipient ${i}`);
  // Newest first, as the API's default order puts new records.
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
    if (method === 'GET' && path === '/recipients') {
      const page = Number(u.searchParams.get('page'));
      const limit = Number(u.searchParams.get('limit'));
      const rows = sorted();
      return ok({
        recipients: rows.slice((page - 1) * limit, page * limit).map(({ id, name }) => ({ id, name })),
        total: rows.length,
        page,
        limit,
        total_pages: Math.ceil(rows.length / limit),
      });
    }
    if (method === 'POST' && path === '/recipients') return ok(add(body.new_contact.name));
    if (method === 'POST' && path === '/recipients/bulk') {
      (body.new_contacts as { name: string }[]).forEach((c) => add(c.name));
      return ok({ total: body.new_contacts.length });
    }
    if (method === 'POST' && path === '/recipients/duplicate') {
      (body.recipient_ids as string[]).forEach((id) => add(`${db.find((r) => r.id === id)!.name} (copy)`));
      return ok({ total: body.recipient_ids.length, created: true });
    }
    if (method === 'DELETE' && path === '/recipients/all') {
      db = [];
      return ok();
    }
    if (method === 'DELETE' && path === '/recipients') {
      db = db.filter((r) => !(body.recipient_ids as string[]).includes(r.id));
      return ok();
    }
    const one = path.match(/^\/recipients\/([^/]+)$/);
    if (one && method === 'PUT') {
      db.find((r) => r.id === one[1])!.name = body.name;
      return ok();
    }
    if (one && method === 'DELETE') {
      db = db.filter((r) => r.id !== one[1]);
      return ok();
    }
    return [404, { detail: 'Not Found' }];
  };

  return {
    calls,
    failures,
    handle,
    firstBatch: () => sorted().slice(0, PAGE_SIZE).map(({ id, name }) => ({ id, name })),
    total: () => db.length,
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
type ListResponse = { data?: { recipients?: Row[]; total?: number } };
type AnyMutation = MutationObserverOptions<unknown, Error, unknown>;

const getRowId = (row: Row) => row.id;

async function openRecipientsPage() {
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

  // RecipientsClient's state, and SuperTable's own page index.
  const state = { page: 1, tablePageIndex: 0, listVersion: 0, writesInFlight: 0 };
  let appliedRestartKey = 0;

  const listParams = (): WaRecipientsParams => ({
    recipient_type: 'whatsapp',
    page: state.page,
    limit: PAGE_SIZE,
    search: undefined,
    sort_by: undefined,
    sort_order: undefined,
  });
  // As useBaseQuery prepares them: defaulted, optimistic results on.
  const listOptions = () => ({
    ...client.defaultQueryOptions(
      // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
      useWaRecipients(listParams()) as unknown as QueryObserverOptions
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
        data: resp?.data?.recipients || [],
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

  // ── RecipientsClient, same steps in the same order ──
  // Its useListRefresh, minus React: the same code the page runs.
  const listRefresh = createListRefresher({
    queryClient: client,
    getBatchIndex: () => state.page - 1,
    getFirstBatchKey: () => waRecipientsKey({ ...listParams(), page: 1 }),
    onWriteCountChange: (delta) => setState((s) => { s.writesInFlight += delta; }),
    restart: () => setState((s) => { s.listVersion += 1; }),
  });

  /* eslint-disable react-hooks/rules-of-hooks -- mocked: return their options */
  const m = {
    create: new MutationObserver(client, useCreateWaRecipient() as unknown as AnyMutation),
    update: new MutationObserver(client, useUpdateWaRecipient() as unknown as AnyMutation),
    bulkCreate: new MutationObserver(client, useBulkCreateWaRecipients() as unknown as AnyMutation),
    remove: new MutationObserver(client, useDeleteWaRecipient() as unknown as AnyMutation),
    bulkRemove: new MutationObserver(client, useBulkDeleteWaRecipients() as unknown as AnyMutation),
    removeAll: new MutationObserver(client, useDeleteAllWaRecipients() as unknown as AnyMutation),
    duplicate: new MutationObserver(client, useDuplicateWaRecipients() as unknown as AnyMutation),
  };
  /* eslint-enable react-hooks/rules-of-hooks */

  // A modal (Add, Edit, Import): save, then onSuccess on success only.
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
    add: (name: string) =>
      modalSave(() => m.create.mutate({ target: 'recipient', type_request: 'manual', new_contact: { name } })),
    edit: (id: string, name: string) => modalSave(() => m.update.mutate({ id, data: { name } })),
    importRows: (names: string[]) =>
      modalSave(() => m.bulkCreate.mutate({ target: 'recipient', new_contacts: names.map((name) => ({ name })) })),
    duplicate: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          await m.duplicate.mutate({ ids, target: 'recipient' });
          toasts.push('success');
          await listRefresh.refresh();
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
        }
      }),
    confirmDelete: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          if (ids.length === 1) await m.remove.mutate(ids[0]);
          else await m.bulkRemove.mutate(ids);
          toasts.push('success');
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
        }
        await listRefresh.refresh();
      }),
    confirmDeleteAll: () =>
      listRefresh.run(async () => {
        try {
          await m.removeAll.mutate(undefined);
          toasts.push('success');
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
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
describe('WA Recipients: end to end', () => {
  describe('exactly one list request per action - batch 1 - and the screen matches the server', () => {
    type Page = Awaited<ReturnType<typeof openRecipientsPage>>;
    const actions: [string, (p: Page) => Promise<unknown>][] = [
      ['duplicate', (p) => p.duplicate(['r3'])],
      ['duplicate three (bulk)', (p) => p.duplicate(['r5', 'r4', 'r3'])],
      ['delete one', (p) => p.confirmDelete(['r5'])],
      ['delete three (bulk)', (p) => p.confirmDelete(['r5', 'r4', 'r3'])],
      ['add (modal)', (p) => p.add('New person')],
      ['edit (modal)', (p) => p.edit('r5', 'Renamed')],
      ['import (modal)', (p) => p.importRows(['Imported A', 'Imported B'])],
    ];
    for (const [label, act] of actions) {
      for (const batches of [1, 2]) {
        it(`${label}, ${batches} batch(es) loaded`, async () => {
          backend = fakeBackend(5);
          const page = await openRecipientsPage();
          if (batches === 2) await page.loadMore();
          const from = { calls: backend.calls.length, frames: page.frames.length };

          await page.act(act(page));
          await page.settle();

          expect(listGets(backend.calls, from.calls)).toEqual(['GET /recipients']);
          expect(page.screen().ids).toEqual(backend.firstBatch().map((r) => r.id));
          expect(page.screen().names).toEqual(backend.firstBatch().map((r) => r.name));
          expect(page.screen().isLoading).toBe(false);
          expect(emptyFlashes(page.frames, from.frames)).toBe(0);
        });
      }
    }
  });

  it('duplicate after loading 2 batches: the copy is the first row', async () => {
    backend = fakeBackend(5);
    const page = await openRecipientsPage();
    await page.loadMore();

    await page.act(page.duplicate(['r1']));
    await page.settle();

    expect(page.screen().names[0]).toBe('Recipient 1 (copy)');
    expect(page.state.tablePageIndex).toBe(0);
  });

  it('edit with one batch: the new name shows with no skeleton in between', async () => {
    backend = fakeBackend(3);
    const page = await openRecipientsPage();
    const from = page.frames.length;

    await page.act(page.edit('r2', 'Renamed'));
    await page.settle();

    expect(page.screen().names).toContain('Renamed');
    expect(skeletonFrames(page.frames, from)).toBe(0);
  });

  it('delete all: the list ends empty, from one request', async () => {
    backend = fakeBackend(5);
    const page = await openRecipientsPage();
    await page.loadMore();
    const from = backend.calls.length;

    await page.act(page.confirmDeleteAll());
    await page.settle();

    expect(listGets(backend.calls, from)).toEqual(['GET /recipients']);
    expect(page.screen().ids).toEqual([]);
    expect(page.screen().isLoading).toBe(false);
  });

  it('duplicate fails: error toast, no list request, rows untouched, loading off', async () => {
    backend = fakeBackend(5);
    const page = await openRecipientsPage();
    const before = page.screen().ids;
    const from = backend.calls.length;
    backend.failures.push({ method: 'POST', path: /duplicate$/, status: 422, body: { success: false, message: 'Invalid ids' } });

    await page.act(page.duplicate(['r5']));
    await page.settle();

    expect(page.toasts[0]).toMatch(/^error:/);
    expect(listGets(backend.calls, from)).toEqual([]);
    expect(page.screen().ids).toEqual(before);
    expect(page.screen().isLoading).toBe(false);
  });

  it('a modal save that fails: no reload, rows untouched', async () => {
    backend = fakeBackend(5);
    const page = await openRecipientsPage();
    const before = page.screen().ids;
    const from = backend.calls.length;
    backend.failures.push({ method: 'POST', path: /^\/recipients$/, status: 422, body: { success: false, message: 'Phone number taken' } });

    await page.act(page.add('Broken'));
    await page.settle();

    expect(listGets(backend.calls, from)).toEqual([]);
    expect(page.screen().ids).toEqual(before);
    expect(page.state.listVersion).toBe(0);
  });
});
