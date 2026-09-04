// lib/helper/currency.ts
//
// The one money formatter for the app.
//
// The API sends money as Decimal strings with two places ("1500000.00") and
// never as floats. This formatter parses those strings, rounds half-up to a
// whole rupiah for DISPLAY only (the stored values keep their cents), and
// prints "Rp 1.234.568" - the way an Indonesian invoice reads.
//
// Rounding here is cosmetic: totals are computed server-side and the PDF
// prints the same rounded strings, so a summary never shows "Rp 1.234,5".
// Pass `{ decimals: 2 }` where the cents matter (an audit view, a unit price
// that is genuinely fractional).

export interface FormatRupiahOptions {
  /** 0 (default) rounds half-up to whole rupiah; 2 keeps the cents. */
  decimals?: 0 | 2;
}

/**
 * Parse a money value back to a number.
 *
 * Accepts API decimal strings ("1234.50"), plain numbers, and the formatted
 * output of `formatRupiah` ("Rp 1.234,50", "-Rp 1.235"). An API string is
 * recognised by its shape (digits, optional single dot, no separators) so
 * "1.234" from the API is 1.234 while "Rp 1.234" is one thousand two hundred
 * and thirty-four. Anything unparsable is NaN.
 */
export function parseMoney(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return NaN;
  const text = String(value).trim();
  if (text === '') return NaN;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  const negative = text.includes('-');
  const cleaned = text.replace(/[^\d,]/g, '').replace(',', '.');
  if (cleaned === '' || cleaned === '.') return NaN;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return NaN;
  return negative ? -parsed : parsed;
}

/**
 * A rate for a label: "11.00" -> "11", "12.50" -> "12,5". Never pads, so the
 * summary reads "PPN 11%" and not "PPN 11.00%".
 */
export function formatPercent(value: number | string | null | undefined): string {
  const num = parseMoney(value);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

/** A quantity for a cell: "2.00" -> "2", "1.50" -> "1,5". */
export function formatQuantity(value: number | string | null | undefined): string {
  return formatPercent(value);
}

export function formatRupiah(
  amount: number | string | null | undefined,
  opts: FormatRupiahOptions = {}
): string {
  const decimals = opts.decimals ?? 0;
  const num = parseMoney(amount);
  if (!Number.isFinite(num)) return 'Rp 0';

  // Math.round is half-up for non-negative input; rounding the absolute value
  // and restoring the sign keeps -1234.5 at -1235 instead of JS's -1234.
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const rounded = decimals === 0 ? Math.round(abs) : Math.round(abs * 100) / 100;

  const text = rounded.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${sign}Rp ${text}`;
}
