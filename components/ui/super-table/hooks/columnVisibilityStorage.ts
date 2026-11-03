// components/ui/super-table/hooks/columnVisibilityStorage.ts
//
// `features.rememberColumnVisibility`: the columns a user hid or showed through
// the View options › Columns menu are kept in this browser, per table, so a
// reload doesn't bring every column back.

import type { MRT_VisibilityState } from "material-react-table";

export function columnVisibilityKey(tableId: string): string {
  return `st_cv_${tableId}`;
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
