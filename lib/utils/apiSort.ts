// lib/utils/apiSort.ts
//
// SuperTable's sorting state → the API's `sort_by` / `sort_order` pair.
// Every list endpoint takes one sort column, so only the first entry counts,
// and only when it is one of the keys that endpoint accepts: an unknown key
// is not an error there, it silently falls back to the default order. A sort
// restored from an old URL (`?…_sort=phone_number:asc`) is dropped here
// instead of being sent and quietly ignored.

export interface ApiSort<K extends string> {
  sortBy?: K;
  sortOrder?: 'asc' | 'desc';
}

export function toApiSort<K extends string>(
  sorting: { id: string; desc: boolean }[],
  allowedKeys: readonly K[]
): ApiSort<K> {
  const first = sorting[0];
  if (!first || !(allowedKeys as readonly string[]).includes(first.id)) return {};
  return { sortBy: first.id as K, sortOrder: first.desc ? 'desc' : 'asc' };
}
