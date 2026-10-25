import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryObserver, type QueryObserverOptions } from '@tanstack/query-core';

// The "Reload Data" button of the broadcast stats modal, minus the DOM: the
// real hooks' options and the real reloadBroadcastStats driven through the
// real TanStack engine with the app's defaults (lib/ReactQueryProvider.tsx).
// One observer whose options change is exactly what the modal does when the
// sort changes.

vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: (options: unknown) => options,
}));
vi.mock('js-cookie', () => ({ default: { get: () => 'test-token' } }));

const api = vi.hoisted(() => ({
  calls: [] as string[],
  /** Requests still waiting for their answer. */
  inFlight: 0,
  listLatency: 0,
  failDetail: false,
}));
const answer = async <T>(latency: number, body: T): Promise<T> => {
  api.inFlight++;
  await new Promise((r) => setTimeout(r, latency));
  api.inFlight--;
  return body;
};
vi.mock('../api/whatsapp-marketing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/whatsapp-marketing')>()),
  fetchBroadcastRecipients: async (
    _token: string,
    id: string,
    _page: number,
    _limit: number,
    _search?: string,
    _status?: string,
    sortBy?: string,
    sortOrder?: string
  ) => {
    api.calls.push(`${id} ${sortBy ?? '-'} ${sortOrder ?? '-'}`);
    return answer(0, { success: true, data: { recipients: [], total: 0 } });
  },
  fetchBroadcasts: async () => {
    api.calls.push('list');
    return answer(api.listLatency, { success: true, data: { broadcasts: [], total: 0 } });
  },
  fetchBroadcastDetail: async (_token: string, id: string) => {
    api.calls.push(`detail ${id}`);
    if (api.failDetail) {
      await answer(0, null);
      throw new Error('500');
    }
    return answer(0, { success: true, data: { id } });
  },
}));

import {
  broadcastRecipientsKey,
  reloadBroadcastStats,
  useBroadcastDetail,
  useBroadcastRecipients,
  useBroadcasts,
} from './useBroadcasts';

const makeClient = () =>
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
    },
  });

/* eslint-disable react-hooks/rules-of-hooks -- mocked: they return their options */
const recipientsOptions = (id: string, sortOrder?: 'asc' | 'desc') =>
  useBroadcastRecipients(id, 1, 5, '', undefined, sortOrder && 'status', sortOrder) as unknown as QueryObserverOptions;
const listOptions = () =>
  useBroadcasts(1, 25, '', undefined, 'created_at', 'desc') as unknown as QueryObserverOptions;
const detailOptions = (id: string) => useBroadcastDetail(id) as unknown as QueryObserverOptions;
/* eslint-enable react-hooks/rules-of-hooks */

const settle = (client: QueryClient) => vi.waitFor(() => expect(client.isFetching()).toBe(0));

const observe = (client: QueryClient, options: QueryObserverOptions) => {
  const observer = new QueryObserver(client, options);
  observer.subscribe(() => {});
  return observer;
};

/** The modal's recipients table: one observer, re-keyed on every sort change. */
async function openTable(client: QueryClient, id: string, sortOrder?: 'asc' | 'desc') {
  const observer = observe(client, recipientsOptions(id, sortOrder));
  await settle(client);
  return {
    observer,
    async sortBy(next?: 'asc' | 'desc') {
      observer.setOptions(recipientsOptions(id, next));
      await settle(client);
    },
  };
}

describe('broadcast stats modal - Reload Data', () => {
  let client: QueryClient;
  beforeEach(() => {
    Object.assign(api, { calls: [], inFlight: 0, listLatency: 0, failDetail: false });
    client = makeClient();
  });

  it('refetches the sort on screen and makes every other sort refetch when switched to', async () => {
    const table = await openTable(client, 'b1');
    await table.sortBy('asc');
    await table.sortBy('desc');
    expect(api.calls).toEqual(['b1 - -', 'b1 status asc', 'b1 status desc']);

    await reloadBroadcastStats(client, 'b1');
    expect(api.calls.at(-1)).toBe('b1 status desc'); // the one on screen, right away

    await table.sortBy('asc');
    await table.sortBy(undefined);
    // Both were fetched seconds ago, well inside staleTime, and still ask the API.
    expect(api.calls.slice(4)).toEqual(['b1 status asc', 'b1 - -']);
  });

  it('refetching only the sort on screen (the old reload) leaves the others on their cache', async () => {
    // Pins down the bug the reload fix closes: if this ever starts refetching,
    // the test above no longer proves anything.
    const table = await openTable(client, 'b1');
    await table.sortBy('asc');
    await table.sortBy('desc');

    await table.observer.refetch();
    await table.sortBy('asc');

    expect(api.calls).toEqual(['b1 - -', 'b1 status asc', 'b1 status desc', 'b1 status desc']);
  });

  it('resolves only after the slowest request it started - the list behind the modal - has answered', async () => {
    observe(client, listOptions());
    observe(client, detailOptions('b1'));
    await openTable(client, 'b1');
    api.calls = [];
    api.listLatency = 80; // the list is the slow one, as on dev

    let done = false;
    const reload = reloadBroadcastStats(client, 'b1').then(() => (done = true));

    // Stats and recipients answer at once; the button must still be busy.
    await vi.waitFor(() => expect(api.inFlight).toBe(1));
    expect(done).toBe(false);

    await reload;
    expect(api.inFlight).toBe(0);
    expect([...api.calls].sort()).toEqual(['b1 - -', 'detail b1', 'list']);
  });

  it('still resolves when one of the requests fails, so the button cannot stay stuck', async () => {
    client = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });
    observe(client, detailOptions('b1'));
    await openTable(client, 'b1');
    api.failDetail = true;

    await expect(reloadBroadcastStats(client, 'b1')).resolves.toBeUndefined();
    expect(client.getQueryState(detailOptions('b1').queryKey!)?.status).toBe('error');
  });

  it('leaves other broadcasts alone, including ids that share a prefix', async () => {
    await openTable(client, 'b1', 'asc');
    await client.prefetchQuery(recipientsOptions('b10', 'asc') as never);
    await client.prefetchQuery(recipientsOptions('b2', 'asc') as never);

    await reloadBroadcastStats(client, 'b1');

    const invalidated = (id: string) =>
      client.getQueryState(recipientsOptions(id, 'asc').queryKey!)?.isInvalidated;
    expect(invalidated('b10')).toBe(false);
    expect(invalidated('b2')).toBe(false);
  });

  it('the hook key starts with broadcastRecipientsKey, so the prefix cannot drift from it', () => {
    const key = recipientsOptions('b1', 'desc').queryKey as readonly unknown[];
    expect(key.slice(0, 2)).toEqual([...broadcastRecipientsKey('b1')]);
  });
});
