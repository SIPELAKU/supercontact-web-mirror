// lib/utils/filterParams.ts
//
// A server-side table's filters (SuperTable's `state.filters`, keyed by the
// filter `id`) as query params, so a new filter is one entry in the table's
// `filters` array plus the API's support: no new hook or API parameter.
// The filter `id` must be the API's query param name, e.g. `status`.

export type FilterValues = Record<string, unknown>;

type Primitive = string | number | boolean;
const isPrimitive = (value: unknown): value is Primitive =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean";

/**
 * The filters that are set, as the text each one is sent as, keys sorted (a
 * stable query key: the same filters in another order are the same request).
 * Empty strings, null/undefined and empty lists are not filters; a list
 * (multiselect) is sent comma-joined. Anything else (e.g. a date range object)
 * has no generic form and is left out: map it to the API's params first.
 */
export function activeFilters(filters: FilterValues = {}): Record<string, string> {
  const active: Record<string, string> = {};
  for (const key of Object.keys(filters).sort()) {
    const value = filters[key];
    if (isPrimitive(value)) {
      const text = String(value).trim();
      if (text) active[key] = text;
    } else if (Array.isArray(value)) {
      const items = value.filter(isPrimitive).map((item) => String(item).trim()).filter(Boolean);
      if (items.length > 0) active[key] = items.join(",");
    }
  }
  return active;
}

/** Adds every set filter to the request's query params. */
export function appendFilterParams(params: URLSearchParams, filters?: FilterValues): void {
  for (const [key, value] of Object.entries(activeFilters(filters))) params.append(key, value);
}
