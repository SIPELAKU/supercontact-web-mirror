import { useCallback, useMemo, useRef } from 'react';

/**
 * Remembers HOW FAR DOWN a lazy list you were, so opening a record and coming
 * back does not put you at the top again.
 *
 * `useListCursor` already remembers the list's URL - the search, sort and
 * filters. That was enough while tables had page numbers, because `?p=3` also
 * described the position. A lazy list deliberately writes no page number (a
 * link to "batch 7" alone would open a list starting at row 151), so with the
 * URL restored the reader still landed on the first batch. On the screens that
 * route to a record page rather than opening a modal - Tickets, Knowledge Base,
 * Companies - that is the difference between working through a list and
 * re-scrolling it every single time.
 *
 * sessionStorage, per tab, same as the cursor: this is "where I was a moment
 * ago", not a preference. It should not survive a browser restart, and two tabs
 * working different filters must not share it.
 */

const PREFIX = 'st:pos:';

export interface ListPosition {
  /** Batches that were loaded when the list was left. */
  batches: number;
  /** Scroll offset inside the table container. */
  scrollTop: number;
  /**
   * The query those batches belonged to. Restoring six batches of a DIFFERENT
   * search would be worse than not restoring at all, so a stored position is
   * only ever used when this still matches.
   */
  token: string;
}

function key(pathname: string, tableId: string) {
  return `${PREFIX}${pathname}::${tableId}`;
}

export function useListPosition({
  enabled,
  pathname,
  tableId,
}: {
  enabled: boolean;
  pathname: string;
  tableId: string;
}) {
  // Scroll fires continuously; writing to sessionStorage on every event would
  // be the most expensive thing on the page. The latest value is kept in a ref
  // and flushed on a timer.
  const pending = useRef<ListPosition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remember = useCallback(
    (position: ListPosition) => {
      if (!enabled || !pathname || !tableId) return;
      pending.current = position;
      if (timer.current) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        const value = pending.current;
        if (!value) return;
        try {
          window.sessionStorage.setItem(key(pathname, tableId), JSON.stringify(value));
        } catch {
          // Private mode or quota. Losing the position degrades to landing at
          // the top, which is exactly the old behaviour - not worth an error.
        }
      }, 250);
    },
    [enabled, pathname, tableId]
  );

  const recall = useCallback((): ListPosition | null => {
    if (!enabled || !pathname || !tableId) return null;
    try {
      const raw = window.sessionStorage.getItem(key(pathname, tableId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ListPosition;
      if (typeof parsed?.batches !== 'number' || typeof parsed?.token !== 'string') {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [enabled, pathname, tableId]);

  const forget = useCallback(() => {
    if (!pathname || !tableId) return;
    try {
      window.sessionStorage.removeItem(key(pathname, tableId));
    } catch {
      /* see remember() */
    }
  }, [pathname, tableId]);

  // Memoised: this object lands in the dependency array of the effect that
  // decides whether to restore, and a fresh object every render would re-run
  // that effect constantly.
  return useMemo(() => ({ remember, recall, forget }), [remember, recall, forget]);
}
