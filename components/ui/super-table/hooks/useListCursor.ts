import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Remembers where a list was when you left it.
 *
 * Opening a record and pressing the breadcrumb back used to return you to
 * page 1 of an unfiltered list, because a breadcrumb href is a bare path.
 * Every table that syncs its state to the URL already knows the answer - this
 * just parks that URL under the list's own pathname so `PageHeader` can hand
 * it back.
 *
 * sessionStorage, not localStorage: this is "where I was a moment ago", and it
 * should not survive a browser restart or leak between tabs working on
 * different records. Per-tab is the honest scope. It also means a middle-click
 * into a new tab lands on a cursor-less record page, which is why the entry
 * point should be a real link carrying its own href rather than a row click
 * alone.
 */

const PREFIX = 'st:list:';

export function listCursorKey(pathname: string) {
  return `${PREFIX}${pathname}`;
}

/** The remembered URL for a list path, or the path itself when there is none. */
export function resolveListHref(href: string): string {
  if (typeof window === 'undefined') return href;
  // Only bare paths are resolved: an href that already carries a query is a
  // deliberate destination, not "wherever I was".
  if (href.includes('?')) return href;
  try {
    const stored = window.sessionStorage.getItem(listCursorKey(href));
    // Guard against a stored value from a different route shape.
    return stored && stored.startsWith(`${href}?`) ? stored : href;
  } catch {
    return href;
  }
}

interface UseListCursorParams {
  enabled: boolean;
}

export function useListCursor({ enabled }: UseListCursorParams) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled || !pathname) return;

    const query = searchParams.toString();
    try {
      if (query) {
        window.sessionStorage.setItem(listCursorKey(pathname), `${pathname}?${query}`);
      } else {
        // Back to a pristine list - forget, so the breadcrumb stops offering
        // a filter the user has just cleared.
        window.sessionStorage.removeItem(listCursorKey(pathname));
      }
    } catch {
      // Private mode / quota. Losing the cursor degrades to today's
      // behaviour, which is not worth an error.
    }
  }, [enabled, pathname, searchParams]);
}
