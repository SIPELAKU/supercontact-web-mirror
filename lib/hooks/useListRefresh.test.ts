import { describe, expect, it } from 'vitest';
import { QueryClient, QueryObserver, type QueryKey } from '@tanstack/query-core';

import { createListRefresher, markListsStale } from './useListRefresh';

const FIRST = ['things', { page: 1 }] as const;
const SECOND = ['things', { page: 2 }] as const;

/** A client with two cached batches; every fetch is logged. */
async function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const log: string[] = [];
  const queryFnFor = (key: QueryKey) => async () => {
    log.push(`fetch ${JSON.stringify(key[1])}`);
    return { key };
  };
  await client.fetchQuery({ queryKey: FIRST, queryFn: queryFnFor(FIRST) });
  await client.fetchQuery({ queryKey: SECOND, queryFn: queryFnFor(SECOND) });
  log.length = 0;
  return { client, log, queryFnFor };
}

function refresherFor(client: QueryClient, log: string[], batchIndex: number) {
  let writes = 0;
  const refresher = createListRefresher({
    queryClient: client,
    getBatchIndex: () => batchIndex,
    getFirstBatchKey: () => FIRST,
    onWriteCountChange: (delta) => {
      writes += delta;
      log.push(`writes ${writes}`);
    },
    restart: () => log.push('restart'),
  });
  return { ...refresher, writes: () => writes };
}

describe('createListRefresher', () => {
  it('run: loading on for the whole write and off again, even when the write throws', async () => {
    const { client, log } = await setup();
    const r = refresherFor(client, log, 0);

    await r.run(async () => {
      log.push('work');
    });
    await expect(
      r.run(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(log).toEqual(['writes 1', 'work', 'writes 0', 'writes 1', 'writes 0']);
    expect(r.writes()).toBe(0);
  });

  it('refresh with one batch: refetches batch 1 only, and does not restart', async () => {
    const { client, log } = await setup();
    await refresherFor(client, log, 0).refresh();
    expect(log).toEqual(['fetch {"page":1}']);
  });

  it('refresh({ restart }) with one batch: restarts AFTER batch 1 has landed', async () => {
    const { client, log } = await setup();
    await refresherFor(client, log, 0).refresh({ restart: true });
    expect(log).toEqual(['fetch {"page":1}', 'restart']);
  });

  it('refresh with several batches: restarts BEFORE the refetch, once, with or without restart', async () => {
    for (const restart of [false, true]) {
      const { client, log } = await setup();
      await refresherFor(client, log, 1).refresh({ restart });
      expect(log).toEqual(['restart', 'fetch {"page":1}']);
    }
  });

  it('refreshAfterSave: the whole refresh inside one write', async () => {
    const { client, log } = await setup();
    await refresherFor(client, log, 0).refreshAfterSave();
    expect(log).toEqual(['writes 1', 'fetch {"page":1}', 'restart', 'writes 0']);
  });

  it('reload on batch 1 (a poll): silent - refetches batch 1, then restarts, never loading', async () => {
    const { client, log } = await setup();
    const r = refresherFor(client, log, 0);
    await r.reload();
    expect(log).toEqual(['fetch {"page":1}', 'restart']);
    expect(r.writes()).toBe(0);
  });

  it('reload from a later batch: back to batch 1 first, loading until it has landed, one request', async () => {
    for (const batchIndex of [1, 2]) {
      const { client, log } = await setup();
      const r = refresherFor(client, log, batchIndex);
      await r.reload();
      expect(log).toEqual(['writes 1', 'restart', 'fetch {"page":1}', 'writes 0']);
      expect(r.writes()).toBe(0);
    }
  });

  it('reload from a later batch: loading goes off again when the refetch fails', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let down = false;
    await client.fetchQuery({
      queryKey: FIRST,
      queryFn: async () => {
        if (down) throw new Error('down');
        return 'batch 1';
      },
    });
    down = true;
    const log: string[] = [];
    const r = refresherFor(client, log, 2);
    await r.reload();
    expect(log).toEqual(['writes 1', 'restart', 'writes 0']);
    expect(client.getQueryState(FIRST)?.status).toBe('error');
  });
});

describe('markListsStale', () => {
  it('marks every list under the key stale without fetching any - not even the one on screen', async () => {
    const { client, log, queryFnFor } = await setup();
    // Batch 1 is "on screen": an active observer, which a plain
    // invalidateQueries would refetch straight away.
    const onScreen = new QueryObserver(client, {
      queryKey: FIRST,
      queryFn: queryFnFor(FIRST),
      staleTime: Infinity,
    });
    const off = onScreen.subscribe(() => {});

    await markListsStale(client, ['things']);

    expect(log).toEqual([]);
    expect(client.getQueryState(FIRST)?.isInvalidated).toBe(true);
    expect(client.getQueryState(SECOND)?.isInvalidated).toBe(true);
    off();
  });
});
