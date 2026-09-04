// lib/helper/quantity.ts
//
// Quantities and the unit they are counted in. The unit's `precision` (0..2)
// is a HINT for the input's step and an upper bound for display; it is never
// used to clamp what the user typed - the server refuses a quantity that does
// not fit the unit and the refusal lands under the row (spec A12) - and never
// to round a stored quantity on a document (spec A3/A5).

import { parseMoney } from "./currency";

/** `step`/`min` for a quantity input: 1, 0.1 or 0.01. */
export function stepForPrecision(precision: number | null | undefined): 1 | 0.1 | 0.01 {
  if (precision === 1) return 0.1;
  if (precision === 2) return 0.01;
  if (typeof precision === "number" && precision > 2) return 0.01;
  return 1;
}

/** Fractional digits a quantity actually carries, capped at the column's scale (2). */
function decimalsOf(num: number): number {
  if (!Number.isFinite(num)) return 0;
  const fraction = Math.abs(num).toFixed(2).split(".")[1] ?? "";
  return fraction.replace(/0+$/, "").length;
}

/**
 * "2 porsi", "1,5 kg", or just "2" when the line has no unit. Never padded
 * ("2.00" -> "2") and NEVER rounded below the decimals the value itself
 * carries: a stored line is printed as stored (spec A3/A5), even when the
 * product's unit has since been lowered to fewer decimals or assigned for
 * the first time - `precision` can only widen the display, not narrow it.
 */
export function formatQuantityWithUnit(
  quantity: number | string | null | undefined,
  unitLabel: string | null | undefined,
  precision: number | null | undefined = 2
): string {
  const num = parseMoney(quantity);
  const hint = Math.min(2, Math.max(0, typeof precision === "number" ? Math.trunc(precision) : 2));
  const digits = Math.min(2, Math.max(hint, decimalsOf(num)));
  const text = Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: digits }) : "0";
  const label = typeof unitLabel === "string" ? unitLabel.trim() : "";
  return label ? `${text} ${label}` : text;
}
