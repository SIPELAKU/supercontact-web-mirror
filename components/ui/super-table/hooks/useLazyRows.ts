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
 * THE ONE SUBTLE PART - RECOGNISING A PAGE THAT HAS NOT ARRIVED YET
 * When "load more" bumps the index to 3, `data` still holds page 2's rows
 * until the parent's request resolves. Filing those under slot 3 puts the same
 * rows in two places; dedupe hides it in the output, but the slot count - which
 * the auto-load brake and the "restore my position" walk both read - silently
 * over-counts, and each step lands one batch short.
 *
 * Reference identity cannot catch this. Most parents build a fresh array on
 * every render (`resp?.rows || []`, `.slice(...)`, `.map(...)`), so page 2's
 * rows arrive as a NEW array each time and look like new data. So each slot
 * carries a cheap fingerprint of its contents instead, and a page whose
 * fingerprint already exists in another slot is refused.
 */

/**
 * Cheap stand-in for "these are the same rows": length plus the first and last
 * id. Two different pages of the same query can only collide here by having the
 * same length AND the same first and last row - which means the same page.
 * An empty batch fingerprints as `0:` and so matches any other empty batch,
 * which is what stops `resp?.rows || []` re-filing on every render.
 */
function fingerprint<TData>(
  rows: TData[],
  getRowId: (row: TData, index: number) => string
): string {
  if (rows.length === 0) return '0:';
  return `${rows.length}:${getRowId(rows[0], 0)}:${getRowId(
    rows[rows.length - 1],
    rows.length - 1
  )}`;
}

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
  /**
   * The last total the server reported for THIS query, remembered.
   *
   * The total cannot change between batches of one query, so an endpoint is
   * free to send it only with the first batch and skip the `COUNT(*)` on the
   * rest - lazy loading turned one page view into ~10 requests, and the count
   * was being recomputed on every one of them. Remembering it here is what
   * makes that safe: without it, a batch that omits the total would blank the
   * footer and fall back to guessing `hasMore` from the page being full.
   */
  knownTotal?: number;
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
  const pagesRef = useRef(new Map<number, { rows: TData[]; fp: string }>());
  const knownTotalRef = useRef<number | undefined>(undefined);
  // Bumped on every commit so the flatten below re-runs. A ref, not state:
  // committing happens DURING render, so a setState would be both illegal
  // and unnecessary - this render already sees the new rows.
  const versionRef = useRef(0);

  // ─── Reset when the query itself changes ──────────────────────────────
  const prevToken = useRef(resetToken);
  if (prevToken.current !== resetToken) {
    prevToken.current = resetToken;
    pagesRef.current = new Map();
    // The remembered total belongs to the OLD query; keeping it would show
    // the previous result's count beside the new query's rows.
    knownTotalRef.current = undefined;
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
    // Pages arrive in order or not at all. Changing a filter clears the map
    // and resets pagination, but those are two separate state updates: in the
    // render between them the parent is still holding batch 3's rows while the
    // map is empty, and that batch would be filed under slot 2 - leaving the
    // list showing rows 1-25 and 51-75 with the middle missing, under a filter
    // that was supposed to start it over. A page whose predecessor is absent
    // is stale by definition.
    const outOfSequence = pageIndex > 0 && !pagesRef.current.has(pageIndex - 1);
    const fp = fingerprint(data, getRowId);
    const existing = pagesRef.current.get(pageIndex);
    if (!outOfSequence && existing?.fp !== fp) {
      // This exact run of rows is already filed under a DIFFERENT index: the
      // parent has not caught up with the new page yet, and committing would
      // file the previous batch under this one.
      let alreadyFiledElsewhere = false;
      for (const [index, page] of pagesRef.current) {
        if (index !== pageIndex && page.fp === fp) {
          alreadyFiledElsewhere = true;
          break;
        }
      }
      if (!alreadyFiledElsewhere) {
        pagesRef.current.set(pageIndex, { rows: data, fp });
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
      for (const row of pagesRef.current.get(index)?.rows ?? []) {
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

  if (typeof rowCount === 'number') {
    knownTotalRef.current = rowCount;
  }
  const knownTotal = knownTotalRef.current;

  // With a known total, "more" is arithmetic. Without one - a first batch that
  // has not landed yet, or an endpoint that reports no total at all - fall
  // back to the classic signal: a page that came back full probably has a
  // successor.
  const lastPage = pagesRef.current.get(pageIndex);
  const hasMore =
    typeof knownTotal === 'number'
      ? loadedCount < knownTotal
      : (lastPage?.rows.length ?? 0) >= pageSize;

  const isLoadingMore = Boolean((isFetching || isLoading) && pageIndex > 0);

  return {
    rows,
    loadedCount,
    knownTotal,
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
