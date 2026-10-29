// lib/hooks/useListRefresh.ts
"use client";

// Keeping a lazy SuperTable list correct after a write - create, edit,
// duplicate, delete - on the page that shows it.
//
// A lazy list keeps every batch it has loaded (useLazyRows), but a refetch
// only refreshes the batch the table asked for last. So after a write:
//   - with more than one batch loaded, the earlier ones are stale: a new or
//     copied row, which lands in batch 1, never shows, and a deleted one stays;
//   - even with one batch, an edit is dropped: the table only notices that a
//     batch changed when its row count or its first or last row id does.
// The cure is the same on every page: refetch batch 1 and start the list over
// from it (SuperTable's `restartKey`). And because the page does that, the
// mutation hooks must not refetch the active batch as well - with several
// batches loaded that was a second, wasted request - hence markListsStale.
//
// A list that polls (Import History) has the same problem on every tick: the
// rows change in place, so a plain refetch never shows them. `reload` is the
// polling version of the same cure.

import { useMemo, useRef, useState } from 'react';
import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query';

/**
 * For a mutation hook's `onSuccess`: marks every cached list under `queryKey`
 * stale without refetching any. The page showing the list refetches what it
 * needs itself (useListRefresh); a stale list anywhere else refetches the next
 * time it is shown.
 */
export function markListsStale(queryClient: QueryClient, queryKey: QueryKey) {
  return queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
}

export interface ListRefresherOptions {
  queryClient: QueryClient;
  /** The batch the table asked for last, 0 for the first. Read when a refresh runs. */
  getBatchIndex: () => number;
  /** Query key of batch 1 of the list as it is now - same search, sort and filters. */
  getFirstBatchKey: () => QueryKey;
  /** +1 when a write starts, -1 once it has settled, however it ended. */
  onWriteCountChange: (delta: 1 | -1) => void;
  /** Starts the list over from batch 1: bumps the table's `restartKey`. */
  restart: () => void;
}

/**
 * The framework-free core of useListRefresh, so the flow tests drive the same
 * code the pages run.
 */
export function createListRefresher({
  queryClient,
  getBatchIndex,
  getFirstBatchKey,
  onWriteCountChange,
  restart: restartList,
}: ListRefresherOptions) {
  /**
   * Wraps a write from the click until the refreshed list has landed; the
   * table shows as loading meanwhile. Counted rather than flagged, so one
   * write finishing cannot clear the loading state under another.
   */
  const run = async (work: () => Promise<void>) => {
    onWriteCountChange(1);
    try {
      await work();
    } finally {
      onWriteCountChange(-1);
    }
  };

  /**
   * Refetches batch 1 and, when needed, starts the list over from it. This is
   * the only list request a write makes. A request already in flight from
   * before the write is replaced (TanStack's default `cancelRefetch`), never
   * reused: it would carry the list as it was.
   *
   * `restart` forces the start-over with a single batch loaded too, which an
   * edit needs (see the top of this file).
   */
  const refresh = async ({ restart = false } = {}) => {
    // Several batches: restart first, so the table shows a skeleton while it
    // moves back to batch 1 - and joins this request when it gets there.
    const restartFirst = getBatchIndex() > 0;
    if (restartFirst) restartList();
    await queryClient.refetchQueries({ queryKey: getFirstBatchKey(), exact: true });
    // One batch: restart after, in the same render as loading ends, so the
    // old rows give way straight to the new ones with no skeleton between.
    if (restart && !restartFirst) restartList();
  };

  /** For a modal that saved on its own (create, edit, import) and reports success. */
  const refreshAfterSave = () => run(() => refresh({ restart: true }));

  /**
   * For a list that polls, and its Refresh button: back to batch 1 with fresh
   * rows, every time. With one batch loaded it is silent - the rows change
   * once the new batch 1 has landed, with no skeleton. Scrolled further, the
   * table moves back to batch 1 first and shows its skeleton until that batch
   * arrives; the batches below it would only have gone stale.
   */
  const reload = () =>
    getBatchIndex() > 0 ? run(() => refresh({ restart: true })) : refresh({ restart: true });

  return { run, refresh, refreshAfterSave, reload };
}

/**
 * Wires createListRefresher into a page. Usage:
 *
 *   const listRefresh = useListRefresh({
 *     batchIndex: page - 1,
 *     firstBatchKey: waRecipientsKey({ ...listParams, page: 1 }),
 *   });
 *
 *   <Table isLoading={isLoading || listRefresh.isRefreshing} restartKey={listRefresh.restartKey} />
 *
 *   const handleDuplicate = (ids) =>
 *     listRefresh.run(async () => {
 *       await duplicateMutation.mutateAsync(ids);
 *       await listRefresh.refresh();
 *     });
 *
 *   // a modal's onSuccess
 *   const handleSaved = () => listRefresh.refreshAfterSave();
 *
 *   // a polled list (see usePolling)
 *   usePolling(listRefresh.reload, intervalMs);
 */
export function useListRefresh({
  batchIndex,
  firstBatchKey,
}: {
  batchIndex: number;
  firstBatchKey: QueryKey;
}) {
  const queryClient = useQueryClient();
  const [writes, setWrites] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  // Read when a refresh runs - after the write - rather than when the handler
  // that started it was created.
  const latest = useRef({ batchIndex, firstBatchKey });
  latest.current = { batchIndex, firstBatchKey };

  const refresher = useMemo(
    () =>
      createListRefresher({
        queryClient,
        getBatchIndex: () => latest.current.batchIndex,
        getFirstBatchKey: () => latest.current.firstBatchKey,
        onWriteCountChange: (delta) => setWrites((n) => n + delta),
        restart: () => setRestartKey((k) => k + 1),
      }),
    [queryClient]
  );

  return {
    ...refresher,
    /** Add to the table's `isLoading`. */
    isRefreshing: writes > 0,
    /** Pass to the table as `restartKey`. */
    restartKey,
  };
}
