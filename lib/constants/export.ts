// lib/constants/export.ts
//
// One page size for every server-side table export.
//
// Each screen used to pick its own: subscribers pulled 50 rows at a time,
// mailing lists 100, campaigns 1000. A 10,000-row subscriber export therefore
// fired 200 sequential requests behind a disabled icon with no progress shown.
// 500 keeps each response small enough to stay well inside the proxy's body
// limits while cutting that same export to 20 round trips.
export const EXPORT_PAGE_SIZE = 500;

/** Safety valve so a runaway `total` can never loop forever. */
export const EXPORT_MAX_PAGES = 200;
