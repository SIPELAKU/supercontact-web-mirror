// lib/utils/priceGrid.ts
//
// Pure helpers for the per-product price grid (spec I3). Everything here is
// DISPLAY logic over values the server already decided:
//
//   - a tier minimum as a label ("≥ 10")
//   - where a row's validity window sits relative to today
//   - the window as a readable range
//   - whether a list price sits below or above the catalogue price
//
// What is deliberately NOT here: any arithmetic that produces a price. The
// percentage edit is previewed by the server's own dry run precisely so the
// Decimal ROUND_HALF_UP rule exists in exactly one place (spec S3-10); a JS
// float re-implementation is the defect that rule was written against.
//
// Dates are the API's `YYYY-MM-DD` strings and are compared as strings, which
// is exact for that format and avoids a timezone round-trip through `Date`.

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Today in WIB, as `YYYY-MM-DD`.
 *
 * The server evaluates every validity window in Asia/Jakarta (spec E2), so a
 * browser in another timezone must not colour rows by its own midnight.
 * `en-CA` is the locale whose short date IS the ISO form.
 */
export function todayInJakarta(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "4 Sep 2026" - or "" when the value is not an ISO date. */
export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "";
  const match = ISO_DATE.exec(value.slice(0, 10));
  if (!match) return String(value);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return String(value);
  return `${Number(match[3])} ${MONTHS_ID[month - 1]} ${match[1]}`;
}

/**
 * `open`      valid today and still open-ended or ending in the future
 * `scheduled` starts after today
 * `closed`    ended before today
 * `empty`     `valid_until < valid_from`: a row superseded before it ever took
 *             effect (spec A6). It is valid on NO date, is never a resolution
 *             candidate, and is still readable as history - which is exactly
 *             what a same-day re-price leaves behind, so the grid must name it
 *             rather than show a nonsense range.
 */
export type PriceWindowState = "open" | "scheduled" | "closed" | "empty";

export interface PriceWindow {
  valid_from: string;
  valid_until: string | null;
}

export function priceWindowState(
  row: PriceWindow,
  today: string = todayInJakarta()
): PriceWindowState {
  const from = (row.valid_from ?? "").slice(0, 10);
  const until = row.valid_until ? row.valid_until.slice(0, 10) : null;

  if (until !== null && until < from) return "empty";
  if (until !== null && until < today) return "closed";
  if (from > today) return "scheduled";
  return "open";
}

export const PRICE_WINDOW_LABELS: Record<PriceWindowState, string> = {
  open: "Aktif",
  scheduled: "Terjadwal",
  closed: "Ditutup",
  empty: "Digantikan",
};

export function priceWindowLabel(state: PriceWindowState): string {
  return PRICE_WINDOW_LABELS[state];
}

/** "Sejak 4 Sep 2026", "4 Sep 2026 - 30 Sep 2026", "Digantikan 4 Sep 2026". */
export function formatValidityRange(
  row: PriceWindow,
  today: string = todayInJakarta()
): string {
  const from = formatDateShort(row.valid_from);
  if (!row.valid_until) return from ? `Sejak ${from}` : "";
  if (priceWindowState(row, today) === "empty") {
    return from ? `Digantikan ${from}` : "Digantikan";
  }
  const until = formatDateShort(row.valid_until);
  return from && until ? `${from} - ${until}` : from || until;
}

/**
 * A tier minimum as a label. The server writes the same number into
 * `price_source` ("tier:10"), so the two readings agree.
 */
export function formatMinQuantity(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

/** "≥ 10 kg", "≥ 1" - a tier is a MINIMUM, and the label has to say so. */
export function tierLabel(
  minQuantity: string | number | null | undefined,
  unitLabel?: string | null
): string {
  const quantity = formatMinQuantity(minQuantity);
  if (!quantity) return "";
  const unit = typeof unitLabel === "string" ? unitLabel.trim() : "";
  return unit ? `≥ ${quantity} ${unit}` : `≥ ${quantity}`;
}

/**
 * Where a list price sits against the live catalogue price. A COMPARISON, not
 * a computed delta: no money is produced here, so there is nothing to round
 * and nothing to disagree with the server about.
 */
export type BaseComparison = "below" | "above" | "same" | "unknown";

function asNumber(value: string | number | null | undefined): number {
  // `Number(null)` is 0 and `Number("")` is 0 - both would read as a real
  // price of nothing and colour a row that has no price at all.
  if (value === null || value === undefined) return NaN;
  if (typeof value === "number") return value;
  const text = value.trim();
  return text === "" ? NaN : Number(text);
}

export function compareToBasePrice(
  price: string | number | null | undefined,
  basePrice: string | number | null | undefined
): BaseComparison {
  const listed = asNumber(price);
  const base = asNumber(basePrice);
  if (!Number.isFinite(listed) || !Number.isFinite(base)) return "unknown";
  if (listed < base) return "below";
  if (listed > base) return "above";
  return "same";
}

export const BASE_COMPARISON_LABELS: Record<BaseComparison, string> = {
  below: "Di bawah harga dasar",
  above: "Di atas harga dasar",
  same: "Sama dengan harga dasar",
  unknown: "",
};
