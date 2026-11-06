// components/ui/super-table/hooks/columnVisibilityStorage.ts
//
// The columns a user hid or showed through the View options › Columns menu are
// kept in this browser, per table, so a reload doesn't bring every column back.
// On for every table with a `tableId` and that menu; a table can opt out with
// `features.rememberColumnVisibility: false`.

import type { MRT_VisibilityState } from "material-react-table";
import type { SuperTableFeatures } from "../types";

export function remembersColumns(
  features: Pick<SuperTableFeatures, "columnVisibility" | "rememberColumnVisibility"> | undefined,
  tableId: string | undefined,
): boolean {
  return Boolean(tableId) && features?.columnVisibility !== false && features?.rememberColumnVisibility !== false;
}

export function columnVisibilityKey(tableId: string): string {
  return `st_cv_${tableId}`;
}

// No choice (every column at its default) leaves no key behind, so a table
// nobody changed adds nothing to the browser's storage.
export function saveColumnVisibility(
  storage: Pick<Storage, "setItem" | "removeItem">,
  tableId: string,
  visibility: MRT_VisibilityState,
): void {
  const key = columnVisibilityKey(tableId);
  if (Object.keys(visibility).length === 0) storage.removeItem(key);
  else storage.setItem(key, JSON.stringify(visibility));
}

// What was stored, or {} for nothing / anything that isn't a column → boolean
// map (an older format, a hand edit). Non-boolean entries are dropped one by
// one rather than throwing the whole choice away.
export function readColumnVisibility(raw: string | null): MRT_VisibilityState {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: MRT_VisibilityState = {};
  for (const [column, visible] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof visible === "boolean") out[column] = visible;
  }
  return out;
}
