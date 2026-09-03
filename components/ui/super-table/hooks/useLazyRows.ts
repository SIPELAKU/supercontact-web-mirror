import { useCallback, useMemo, useRef } from 'react';
import type React from 'react';

/**
 * Turns "the page hands me one page of rows at a time" into "the table holds
 * every row loaded so far".
 *
 * WHY IT LIVES HERE AND NOT IN EVERY PAGE
 * The 27 server-side tables already do exactly one thing: react to a state
 * change, fetch that page, and pass the result down as `data`. If lazy loading
 * were implemented per screen, all 27 fetch layers - three different ones,
 * react-query, zustand and hand-rolled useState - would have to be rewritten
 * to accumulate. Accumulating HERE means every one of those tables gets lazy
 * loading without its data layer being touched at all.
 *
 * HOW IT STAYS CORRECT
 * Pages are held in a Map keyed by page index, not appended to a list:
 *
 *   · a refetch of page 3 REPLACES slot 3 rather than duplicating it, so
 *     mutations and background refreshes stay visible instead of stacking;
 *   · rows are flattened in index order, so the list never scrambles when a
 *     later page resolves before an earlier one;
 *   · ids are deduped on the way out, because two adjacent offset pages can
 *     legitimately overlap when a row is inserted between two fetches.
 *
 * THE ONE SUBTLE PART - `isFetching`
 * When "load more" bumps the index to 3, `data` still holds page 2's rows
 * until the new request resolves. Committing then would file page 2's rows
 * under slot 3. So a commit only happens once the fetch has settled, and a
 * reference-identical array that is already stored elsewhere is ignored - the
 * guard that covers callers who never pass `isFetching` at all.
 */

interface UseLazyRowsParams<TData> {
  enabled: boolean;
  /** The page just delivered by the parent. */
  data: TData[];
  /** Which page index that data belongs to. */
  pageIndex: number;
  pageSize: number;
  /** Total rows the server says match the current query, when known. */
  rowCount?: number;
  isFetching?: boolean;
  isLoading?: boolean;
  getRowId: (row: TData, index: number) => string;
  /**
   * Changes whenever the QUERY changes (search, sort, filters, page size).
   * Accumulated rows describe the old query, so they are dropped.
   */
  resetToken: string;
}

export interface LazyRowsResult<TData> {
  /** Every row loaded so far, in order, deduped. */
  rows: TData[];
  loadedCount: number;
  hasMore: boolean;
  /** True while a page AFTER the first is in flight. */
  isLoadingMore: boolean;
  /** Batches loaded so far, for the auto-load safety brake. */
  batchesLoaded: number;
}

export function useLazyRows<TData extends object>({
  enabled,
  data,
  pageIndex,
  pageSize,
  rowCount,
  isFetching,
  isLoading,
  getRowId,
  resetToken,
}: UseLazyRowsParams<TData>): LazyRowsResult<TData> {
  const pagesRef = useRef(new Map<number, TData[]>());
  // Bumped on every commit so the flatten below re-runs. A ref, not state:
  // committing happens DURING render, so a setState would be both illegal
  // and unnecessary - this render already sees the new rows.
  const versionRef = useRef(0);

  // ─── Reset when the query itself changes ──────────────────────────────
  const prevToken = useRef(resetToken);
  if (prevToken.current !== resetToken) {
    prevToken.current = resetToken;
    pagesRef.current = new Map();
    versionRef.current += 1;
  }

  // ─── Commit the delivered page into its slot ──────────────────────────
  //
  // In render, NOT in an effect. Effects run after paint, so filing the rows
  // there meant the very first render of every lazy table had an empty page
  // map: zero rows, "Menampilkan 0 dari 137", and - because `isLoading` is
  // false by then - MRT's "no records found" panel, all shown for one frame
  // before the effect filled it in. It also rendered nothing at all during
  // SSR, where effects never run.
  //
  // Writing to a ref cache keyed by the inputs is idempotent, so StrictMode's
  // double render files the same array under the same index and the second
  // pass exits at the identity check below without bumping the version.
  if (enabled && !isFetching && !isLoading && Array.isArray(data)) {
    const existing = pagesRef.current.get(pageIndex);
    // `data={resp?.rows || []}` builds a fresh empty array on every render
    // while a request is in flight, which would re-file and re-flatten on each
    // one for no change at all. Two empties are the same empty.
    const bothEmpty = existing?.length === 0 && data.length === 0;
    if (existing !== data && !bothEmpty) {
      // The array we were handed is byte-for-byte the one sitting in a
      // DIFFERENT slot: the parent has not refetched yet and we would be
      // filing the previous page's rows under the new index.
      let alreadyFiledElsewhere = false;
      for (const [index, rows] of pagesRef.current) {
        if (index !== pageIndex && rows === data) {
          alreadyFiledElsewhere = true;
          break;
        }
      }
      if (!alreadyFiledElsewhere) {
        pagesRef.current.set(pageIndex, data);
        versionRef.current += 1;
      }
    }
  }

  const version = versionRef.current;

  // ─── Flatten ──────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    if (!enabled) return data;
    const seen = new Set<string>();
    const out: TData[] = [];
    for (const index of [...pagesRef.current.keys()].sort((a, b) => a - b)) {
      for (const row of pagesRef.current.get(index) ?? []) {
        const id = getRowId(row, out.length);
        if (seen.has(id)) continue;
        seen.add(id);
        out.push(row);
      }
    }
    return out;
    // `version` is the dependency that matters - the Map is mutated in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, version, data, getRowId]);

  const loadedCount = rows.length;
  const batchesLoaded = pagesRef.current.size;

  // With a known total, "more" is arithmetic. Without one, fall back to the
  // classic signal: a page that came back full probably has a successor.
  const lastPage = pagesRef.current.get(pageIndex);
  const hasMore =
    typeof rowCount === 'number'
      ? loadedCount < rowCount
      : (lastPage?.length ?? 0) >= pageSize;

  const isLoadingMore = Boolean((isFetching || isLoading) && pageIndex > 0);

  return {
    rows,
    loadedCount,
    hasMore,
    isLoadingMore,
    batchesLoaded,
  };
}

/**
 * Fires `onNearEnd` when the table's own scroll container is within
 * `threshold` pixels of the bottom.
 *
 * This started life as an IntersectionObserver on a sentinel in the footer,
 * which was wrong in a way only a real browser showed: the footer sits OUTSIDE
 * the scrolling container, so the sentinel was permanently on screen and the
 * table auto-loaded a second batch the instant it mounted - a 25-row table
 * rendered 50 rows before anyone touched it, and would have kept going to the
 * auto-load brake.
 *
 * The rows scroll inside `MuiTableContainer` (bounded by `features.maxHeight`,
 * 70vh by default), so that element's scroll position is the honest signal for
 * "the reader has reached the end of what is loaded".
 *
 * `threshold` is generous so the next batch is already in flight by the time
 * the last row is reached, which is what makes the list feel continuous rather
 * than stuttering at every boundary.
 */
export function useNearEndOfScroll({
  enabled,
  onNearEnd,
  threshold = 300,
}: {
  enabled: boolean;
  onNearEnd: () => void;
  threshold?: number;
}) {
  // Held in a ref so re-creating the callback each render does not detach and
  // re-attach the listener.
  const handler = useRef(onNearEnd);
  handler.current = onNearEnd;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  return useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!enabledRef.current) return;
      const el = event.currentTarget;
      // Nothing to scroll means nothing to reach the end of. Without this, a
      // container shorter than its content threshold would count as "at the
      // bottom" from the very first paint.
      if (el.scrollHeight <= el.clientHeight) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight > threshold) return;
      handler.current();
    },
    [threshold]
  );
}
