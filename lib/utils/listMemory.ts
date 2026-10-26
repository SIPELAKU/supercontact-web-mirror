// lib/utils/listMemory.ts
//
// The "where was I" state SuperTable keeps per tab in sessionStorage: each
// list's last URL (useListCursor) and how far down it was scrolled
// (useListPosition). It lives here, with no React or MUI imports, so
// AuthContext - loaded on every page - can clear it without pulling the table
// into every bundle.

export const LIST_CURSOR_PREFIX = 'st:list:';
export const LIST_POSITION_PREFIX = 'st:pos:';

/**
 * Forgets every list's remembered URL and scroll depth in this tab.
 *
 * Called when a session ends and when one starts. sessionStorage outlives a
 * logout, so without this the next login in the same tab reopened each list
 * where the previous session left it - several batches deep, and with the
 * previous user's search terms in the breadcrumb links if someone else signed
 * in. Clearing on login as well covers a session that ended without logout
 * (an expired token).
 */
export function clearListMemory() {
  if (typeof window === 'undefined') return;
  try {
    const store = window.sessionStorage;
    // Backwards, because removing an item shifts the indexes after it.
    for (let i = store.length - 1; i >= 0; i--) {
      const key = store.key(i);
      if (key && (key.startsWith(LIST_CURSOR_PREFIX) || key.startsWith(LIST_POSITION_PREFIX))) {
        store.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable (private mode, blocked site data): nothing was
    // remembered either.
  }
}
