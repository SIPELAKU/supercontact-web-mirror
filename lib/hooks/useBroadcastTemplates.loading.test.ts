import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MutationObserver,
  QueryClient,
  QueryObserver,
  type MutationObserverOptions,
  type QueryObserverOptions,
} from '@tanstack/query-core';

import type {
  BroadcastTemplatesResponse,
  DuplicateBroadcastTemplatesData,
} from '@/lib/types/whatsapp-marketing';

// The hooks under test only assemble options for useQuery / useMutation. Hand
// those options back untouched so real TanStack observers can run them here,
// outside React: the real fetchers, the real fetchWithTimeout, the real engine.
const ctx = vi.hoisted(() => ({ client: null as unknown }));
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: (options: unknown) => options,
  useMutation: (options: unknown) => options,
  useQueryClient: () => ctx.client,
}));
vi.mock('js-cookie', () => ({ default: { get: () => 'test-token' } }));

import {
  broadcastTemplatesKey,
  useBroadcastTemplates,
  useBulkDeleteBroadcastTemplates,
  useDuplicateBroadcastTemplates,
} from './useBroadcastTemplates';
import { createListRefresher } from './useListRefresh';

// Same defaults as makeQueryClient() in lib/ReactQueryProvider.tsx, which is
// not exported. Keep the two in step.
const appQueryClient = () =>
  new QueryClient({
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

// ─── Fake backend ──────────────────────────────────────────────────────────
type Reply = (signal: AbortSignal) => Promise<Response>;

const abortError = () => new DOMException('aborted', 'AbortError');

const after =
  (ms: number, make: () => Response): Reply =>
  (signal) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(make()), ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(abortError());
      });
    });

/** Never answers; only fetchWithTimeout's abort ends it. */
const hang: Reply = (signal) =>
  new Promise((_, reject) => signal.addEventListener('abort', () => reject(abortError())));

const json = (body: unknown, status = 200) => () =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const gatewayHtml = (status: number) => () =>
  new Response('<html><body>Bad Gateway</body></html>', {
    status,
    headers: { 'Content-Type': 'text/html' },
  });

const listOf = (ids: string[]) =>
  json({
    success: true,
    data: { templates: ids.map((id) => ({ id })), total: ids.length, page: 1, limit: 10, total_pages: 1 },
  });

let server: {
  list: Reply[];
  duplicate: Reply[];
  /** Per-id DELETE replies; ids not listed answer 200 success. */
  remove: Record<string, Reply>;
  listCalls: number;
  duplicateCalls: number;
  deleteCalls: string[];
};

/** Replies are used in order; the last one repeats. */
const nextReply = (queue: Reply[]) => (queue.length > 1 ? queue.shift()! : queue[0]);

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
  server = { list: [], duplicate: [], remove: {}, listCalls: 0, duplicateCalls: 0, deleteCalls: [] };
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
        const path = new URL(url).pathname;
        server.deleteCalls.push(path);
        const id = path.match(/\/broadcast-templates\/([^/]+)$/)?.[1];
        // What the API does with DELETE on the collection: no such route.
        if (!id) return after(50, json({ detail: 'Method Not Allowed' }, 405))(init.signal!);
        const reply = server.remove[id] ?? after(200, json({ success: true, data: { id, deleted: true } }));
        return reply(init.signal!);
      }
      if (String(url).includes('/broadcast-templates/duplicate')) {
        server.duplicateCalls += 1;
        return nextReply(server.duplicate)(init.signal!);
      }
      server.listCalls += 1;
      return nextReply(server.list)(init.signal!);
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// ─── The page, minus React ─────────────────────────────────────────────────
type ListOptions = QueryObserverOptions<BroadcastTemplatesResponse>;
type DuplicateOptions = MutationObserverOptions<
  { success: boolean },
  Error,
  DuplicateBroadcastTemplatesData
>;

const FIRST_BATCH = { page: 1, limit: 10, account_id: 'acc-1' };

function observeList(client: QueryClient) {
  ctx.client = client;
  return new QueryObserver(
    client,
    // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
    useBroadcastTemplates(FIRST_BATCH, { enabled: true }) as unknown as ListOptions
  );
}

async function openTemplatesPage() {
  const client = appQueryClient();
  const list = observeList(client);
  const duplicate = new MutationObserver(
    client,
    // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
    useDuplicateBroadcastTemplates() as unknown as DuplicateOptions
  );

  // What BroadcastTemplatesClient passes to the table as `isFetching`.
  let writesInFlight = 0;
  const busy = () => writesInFlight > 0;

  // Sampled on every change - the moments React would render.
  const timeline: { at: number; busy: boolean }[] = [];
  let t0 = Date.now();
  const record = () => {
    const value = busy();
    if (timeline[timeline.length - 1]?.busy !== value) {
      timeline.push({ at: Date.now() - t0, busy: value });
    }
  };
  const unsubscribe = [list.subscribe(record), duplicate.subscribe(record)];

  await vi.advanceTimersByTimeAsync(1_000); // the first page lands

  // The page's useListRefresh, minus React. One batch on screen, so a
  // Duplicate never restarts the list - it only refreshes batch 1.
  const listRefresh = createListRefresher({
    queryClient: client,
    getBatchIndex: () => 0,
    getFirstBatchKey: () => broadcastTemplatesKey(FIRST_BATCH),
    onWriteCountChange: (delta) => {
      writesInFlight += delta;
      record();
    },
    restart: () => {},
  });

  const toasts: string[] = [];
  return {
    client,
    list,
    busy,
    toasts,
    timeline,
    rows: () => list.getCurrentResult().data?.data.templates.map((t) => t.id) ?? [],
    startTimeline() {
      timeline.length = 0;
      t0 = Date.now();
    },
    // Same steps, in the same order, as BroadcastTemplatesClient.handleDuplicate.
    clickDuplicate: (ids: string[]) =>
      listRefresh.run(async () => {
        try {
          await duplicate.mutate({ template_ids: ids });
          toasts.push('success');
          await listRefresh.refresh();
        } catch (err) {
          toasts.push(`error: ${(err as Error).message}`);
        }
      }),
    leave: () => unsubscribe.forEach((off) => off()),
  };
}

// ─── Scenarios ─────────────────────────────────────────────────────────────
describe('Template Broadcasting: loading bar around Duplicate', () => {
  it('happy path: on from the click until the new list lands, with no gap', async () => {
    server.list = [after(300, listOf(['t1'])), after(300, listOf(['t2', 't1']))];
    server.duplicate = [after(500, json({ success: true }))];
    const page = await openTemplatesPage();
    const listCallsBefore = server.listCalls;

    page.startTimeline();
    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(5_000);
    await click;

    expect(page.toasts).toEqual(['success']);
    expect(page.rows()).toEqual(['t2', 't1']);
    expect(page.busy()).toBe(false);
    expect(page.timeline.map((e) => e.busy)).toEqual([true, false]);
    // One list request per write: the hook only marks the list stale.
    expect(server.listCalls - listCallsBefore).toBe(1);
    console.info('[happy] bar on/off at', page.timeline);
  });

  it('duplicate fails with 500: error toast, bar stops, list not refetched', async () => {
    server.list = [after(300, listOf(['t1']))];
    server.duplicate = [after(300, json({ success: false, message: 'Internal error' }, 500))];
    const page = await openTemplatesPage();
    const listCallsBefore = server.listCalls;

    page.startTimeline();
    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(2_000);
    await click;

    expect(page.toasts).toEqual(['error: Internal error']);
    expect(page.busy()).toBe(false);
    expect(page.timeline.map((e) => e.busy)).toEqual([true, false]);
    expect(server.listCalls).toBe(listCallsBefore);
  });

  it('duplicate answers 200 with success:false: treated as a failure', async () => {
    server.list = [after(300, listOf(['t1']))];
    server.duplicate = [after(300, json({ success: false, message: 'Template not approved' }))];
    const page = await openTemplatesPage();

    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(2_000);
    await click;

    expect(page.toasts).toEqual(['error: Template not approved']);
    expect(page.busy()).toBe(false);
  });

  it('duplicate never answers: bar runs until the 45 s timeout, then stops', async () => {
    server.list = [after(300, listOf(['t1']))];
    server.duplicate = [hang];
    const page = await openTemplatesPage();

    page.startTimeline();
    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(44_000);
    expect(page.busy()).toBe(true);
    await vi.advanceTimersByTimeAsync(2_000);
    await click;

    expect(page.busy()).toBe(false);
    expect(page.toasts).toEqual(['error: Request timeout']);
    console.info('[duplicate hangs] bar on/off at', page.timeline);
  });

  it('gateway answers HTML (502): bar stops, but the toast is a raw JSON parse error', async () => {
    server.list = [after(300, listOf(['t1']))];
    server.duplicate = [after(300, gatewayHtml(502))];
    const page = await openTemplatesPage();

    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(2_000);
    await click;

    expect(page.busy()).toBe(false);
    expect(page.toasts[0]).toMatch(/JSON/);
    console.info('[502 html] toast shown to the user:', page.toasts[0]);
  });

  it('duplicate OK but the list refetch fails: bar stops after one retry, old rows stay, no error shown', async () => {
    server.list = [
      after(300, listOf(['t1'])),
      after(300, json({ success: false, message: 'boom' }, 500)),
    ];
    server.duplicate = [after(300, json({ success: true }))];
    const page = await openTemplatesPage();

    page.startTimeline();
    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(10_000);
    await click;

    expect(page.toasts).toEqual(['success']);
    expect(page.busy()).toBe(false);
    expect(page.list.getCurrentResult().isError).toBe(true);
    // SuperTable only renders its error state when there are NO rows, so the
    // stale list stays on screen with nothing saying it is out of date.
    expect(page.rows()).toEqual(['t1']);
    console.info('[refetch fails] bar on/off at', page.timeline);
  });

  it('duplicate OK but the list refetch hangs: bar runs ~91 s (timeout, retry, timeout), then stops', async () => {
    server.list = [after(300, listOf(['t1'])), hang];
    server.duplicate = [after(300, json({ success: true }))];
    const page = await openTemplatesPage();

    page.startTimeline();
    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(page.busy()).toBe(true);
    await vi.advanceTimersByTimeAsync(60_000);
    await click;

    expect(page.busy()).toBe(false);
    const off = page.timeline[page.timeline.length - 1];
    expect(off.busy).toBe(false);
    expect(off.at).toBeGreaterThan(90_000);
    expect(off.at).toBeLessThan(95_000);
    console.info('[refetch hangs] bar on/off at', page.timeline);
  });

  it('two quick duplicates: bar stays on until the slower one has finished', async () => {
    server.list = [after(300, listOf(['t1'])), after(300, listOf(['c2', 'c1', 't1']))];
    server.duplicate = [after(3_000, json({ success: true })), after(300, json({ success: true }))];
    const page = await openTemplatesPage();

    page.startTimeline();
    const first = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(100);
    const second = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(10_000);
    await Promise.all([first, second]);

    expect(page.toasts).toEqual(['success', 'success']);
    expect(page.busy()).toBe(false);
    // useMutation's isPending tracks only its latest call and would dip here;
    // the page counts writes instead.
    expect(page.timeline.map((e) => e.busy)).toEqual([true, false]);
    console.info('[two duplicates] bar on/off at', page.timeline);
  });

  it('a list request already in flight when the write lands is replaced, not reused', async () => {
    // The list endpoint syncs with Twilio and can be slow; a refetch started
    // BEFORE the duplicate finished would carry the pre-duplicate list.
    server.list = [
      after(300, listOf(['t1'])),
      after(3_000, listOf(['t1'])), // started early, answers with the old list
      after(300, listOf(['t2', 't1'])),
    ];
    server.duplicate = [after(500, json({ success: true }))];
    const page = await openTemplatesPage();

    void page.list.refetch(); // e.g. the stale-on-mount refetch, still running
    await vi.advanceTimersByTimeAsync(100);
    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(10_000);
    await click;

    expect(page.rows()).toEqual(['t2', 't1']);
    expect(page.busy()).toBe(false);
  });

  it('coming back after the cache went stale: TanStack refetches, the bar stays off, cached rows stay up', async () => {
    server.list = [after(300, listOf(['t1'])), after(2_000, listOf(['t2', 't1']))];
    const page = await openTemplatesPage();
    page.leave();
    await vi.advanceTimersByTimeAsync(31_000); // past staleTime

    const back = observeList(page.client);
    const off = back.subscribe(() => {});
    await vi.advanceTimersByTimeAsync(100);

    const result = back.getCurrentResult();
    expect(result.isFetching).toBe(true); // what used to be passed to the table
    expect(result.isLoading).toBe(false);
    expect(result.data?.data.templates.map((t) => t.id)).toEqual(['t1']);
    expect(page.busy()).toBe(false); // what is passed now
    off();
  });

  it('leaving mid-duplicate and coming back: the list is fresh and nothing stays busy', async () => {
    server.list = [after(300, listOf(['t1'])), after(300, listOf(['t2', 't1']))];
    server.duplicate = [after(1_000, json({ success: true }))];
    const page = await openTemplatesPage();

    const click = page.clickDuplicate(['t1']);
    await vi.advanceTimersByTimeAsync(200);
    page.leave();
    await vi.advanceTimersByTimeAsync(5_000);
    await click;

    const again = observeList(page.client);
    const off = again.subscribe(() => {});
    await vi.advanceTimersByTimeAsync(2_000);

    expect(again.getCurrentResult().isFetching).toBe(false);
    expect(again.getCurrentResult().data?.data.templates.map((t) => t.id)).toEqual(['t2', 't1']);
    off();
  });
});

describe('Template Broadcasting: bulk delete', () => {
  type BulkOptions = MutationObserverOptions<{ success: boolean }, Error, string[]>;

  async function bulkDelete(ids: string[]) {
    const client = appQueryClient();
    const list = observeList(client);
    const off = list.subscribe(() => {});
    await vi.advanceTimersByTimeAsync(1_000);
    const listCallsBefore = server.listCalls;

    const bulk = new MutationObserver(
      client,
      // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked: returns its options
      useBulkDeleteBroadcastTemplates() as unknown as BulkOptions
    );
    let error: string | null = null;
    const run = bulk.mutate(ids).catch((err: Error) => {
      error = err.message;
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await run;
    off();
    return {
      error,
      // The hook marks the list stale and leaves the refetch to the page.
      listMarkedStale: client.getQueryState(broadcastTemplatesKey(FIRST_BATCH))?.isInvalidated === true,
      listRefetchedByHook: server.listCalls > listCallsBefore,
    };
  }

  it('deletes each id on its own route - never DELETE on the collection, which the API does not have', async () => {
    server.list = [after(300, listOf(['a', 'b', 'c']))];
    const result = await bulkDelete(['a', 'b', 'c']);

    expect(result.error).toBeNull();
    expect(server.deleteCalls).toEqual([
      '/broadcast-templates/a',
      '/broadcast-templates/b',
      '/broadcast-templates/c',
    ]);
    expect(result.listMarkedStale).toBe(true);
    expect(result.listRefetchedByHook).toBe(false);
  });

  it('one failure: the rest are still deleted, the error says how many failed, the list is still marked stale', async () => {
    server.list = [after(300, listOf(['a', 'b', 'c']))];
    server.remove = { b: after(200, json({ success: false, message: 'Twilio error' }, 500)) };
    const result = await bulkDelete(['a', 'b', 'c']);

    expect(server.deleteCalls).toHaveLength(3);
    expect(result.error).toBe('1 of 3 template(s) could not be deleted.');
    expect(result.listMarkedStale).toBe(true);
    expect(result.listRefetchedByHook).toBe(false);
  });

  it('session expired: stops at the first 401 instead of trying the rest', async () => {
    server.list = [after(300, listOf(['a', 'b', 'c']))];
    server.remove = { a: after(200, json({ detail: 'Not authenticated' }, 401)) };
    const result = await bulkDelete(['a', 'b', 'c']);

    expect(server.deleteCalls).toEqual(['/broadcast-templates/a']);
    expect(result.error).toBe('UNAUTHORIZED');
  });
});
