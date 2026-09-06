// lib/helper/currency.ts
//
// The one money formatter for the app.
//
// The API sends money as Decimal strings with two places ("1500000.00") and
// never as floats. This formatter parses those strings, rounds half-up, and
// prints "Rp 1.234.568" - the way an Indonesian invoice reads.
//
// COMMERCIAL Phase 5 (spec I1) makes the CURRENCY a parameter.
//
// `formatRupiah` hard-coded the `'Rp '` literal and rounded to WHOLE rupiah by
// default, at 88 call sites across 20 files - including the customer-facing
// `QuotationPdfDocument` and the public acceptance page. A quotation issued in
// USD therefore printed a USD 3.20 line as "Rp 3": the wrong symbol AND the
// wrong number, on the two documents a customer actually reads.
//
// So `formatMoney(value, currency, opts)` is now the single implementation and
// `formatRupiah(v, opts)` is a one-line wrapper for `formatMoney(v, "IDR",
// opts)`. Every existing caller keeps compiling and keeps printing exactly what
// it printed before, byte for byte.
//
// Three rules, and they are separate on purpose:
//
//   1. SYMBOL comes from `CURRENCY_DISPLAY`; an unknown code prints as the CODE
//      itself ("XAU 1.234,50"), never as a guess and never as a bare number.
//   2. GROUPING stays `id-ID` whatever the money. An Indonesian tenant reads
//      Indonesian separators on their own screen; the currency decides the
//      SYMBOL, not the reader's locale.
//   3. DECIMALS are by currency: 0 for IDR, 2 for everything else (spec I1).
//      The old "round to whole rupiah at display" rule was universal; it is now
//      CONDITIONAL, because dropping the cents of a USD line is not a cosmetic
//      rounding, it is a different price.
//
// Rounding here is cosmetic: totals are computed server-side and the PDF prints
// the same rounded strings, so a summary never shows "Rp 1.234,5". Pass
// `{ decimals: 2 }` where the cents matter even in rupiah (an audit view, a
// genuinely fractional unit price).

export interface FormatRupiahOptions {
  /**
   * Overrides the currency's own default. `0` rounds half-up to a whole unit,
   * `2` keeps the minor unit. Omitted = the currency decides (spec I1).
   */
  decimals?: 0 | 2;
}

export type FormatMoneyOptions = FormatRupiahOptions;

/** The company currency every tenant is on today, and the wrapper's currency. */
export const DEFAULT_CURRENCY = "IDR";

interface CurrencyDisplay {
  /** Printed before the number, followed by one space. */
  symbol: string;
  /** How many decimals this currency shows when the caller does not say. */
  decimals: 0 | 2;
}

/**
 * The small display map (spec I1). Deliberately NOT an exhaustive ISO-4217
 * table: anything missing falls back to its own CODE, which is honest and
 * readable, so a tenant who adds an exchange rate for a currency nobody
 * anticipated still gets a correct-looking line instead of a bare number.
 *
 * DECIMALS: the spec fixes the rule as "0 for IDR, 2 otherwise". It is carried
 * per row rather than as an `=== "IDR"` test so a later decision about a
 * genuinely zero-decimal currency (JPY, KRW, VND) is a one-line data change
 * here and not a rewrite of the formatter. See the open item in the Phase 5 web
 * report: those three are listed at 2 because the spec says 2, not because ¥
 * has cents.
 */
export const CURRENCY_DISPLAY: Record<string, CurrencyDisplay> = {
  IDR: { symbol: "Rp", decimals: 0 },
  USD: { symbol: "$", decimals: 2 },
  EUR: { symbol: "€", decimals: 2 },
  GBP: { symbol: "£", decimals: 2 },
  SGD: { symbol: "S$", decimals: 2 },
  MYR: { symbol: "RM", decimals: 2 },
  AUD: { symbol: "A$", decimals: 2 },
  JPY: { symbol: "¥", decimals: 2 },
  CNY: { symbol: "CN¥", decimals: 2 },
  HKD: { symbol: "HK$", decimals: 2 },
  THB: { symbol: "฿", decimals: 2 },
  PHP: { symbol: "₱", decimals: 2 },
  VND: { symbol: "₫", decimals: 2 },
  KRW: { symbol: "₩", decimals: 2 },
  INR: { symbol: "₹", decimals: 2 },
  AED: { symbol: "AED", decimals: 2 },
  SAR: { symbol: "SAR", decimals: 2 },
};

/** `"usd"` / `" USD "` / null -> `"USD"` / `"IDR"`. Never throws. */
export function normalizeCurrencyCode(currency: string | null | undefined): string {
  const code = (currency ?? "").trim().toUpperCase();
  return code || DEFAULT_CURRENCY;
}

/**
 * The prefix a currency prints: its symbol when known, else the CODE itself.
 * Exported because the quotation form's discount-type select shows it as an
 * option label ("%" vs "Rp"/"$"), and the PDF prints it in its header block.
 */
export function currencySymbol(currency: string | null | undefined): string {
  const code = normalizeCurrencyCode(currency);
  return CURRENCY_DISPLAY[code]?.symbol ?? code;
}

/** How many decimals this currency shows by default (spec I1). */
export function currencyDecimals(currency: string | null | undefined): 0 | 2 {
  const code = normalizeCurrencyCode(currency);
  return CURRENCY_DISPLAY[code]?.decimals ?? 2;
}

/**
 * Parse a money value back to a number.
 *
 * Accepts API decimal strings ("1234.50"), plain numbers, and the formatted
 * output of `formatMoney` ("Rp 1.234,50", "-$ 1.235", "XAU 12,50"). An API
 * string is recognised by its shape (digits, optional single dot, no
 * separators) so "1.234" from the API is 1.234 while "Rp 1.234" is one thousand
 * two hundred and thirty-four. Anything unparsable is NaN.
 *
 * `currency` is optional and only ever HELPS: when given, that currency's
 * symbol/code is stripped explicitly before the generic clean-up, so a symbol
 * that happens to contain a digit could never be read as part of the amount.
 * Omitting it keeps the exact Phase 0-4 behaviour, which is why every existing
 * call site is untouched.
 */
export function parseMoney(
  value: string | number | null | undefined,
  currency?: string | null
): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return NaN;
  let text = String(value).trim();
  if (text === '') return NaN;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (currency) {
    const code = normalizeCurrencyCode(currency);
    const prefix = CURRENCY_DISPLAY[code]?.symbol ?? code;
    // Both spellings: the symbol AND the raw code, because a value may have
    // been rendered by a leg whose map did not carry this currency yet.
    text = text.split(prefix).join(' ').split(code).join(' ');
  }
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

/**
 * Money in ONE currency (spec I1). The single implementation; `formatRupiah`
 * is the IDR wrapper.
 *
 * An unparsable value prints the currency's zero ("Rp 0", "$ 0,00") rather than
 * an empty cell, because a blank where a total belongs reads as "free".
 */
export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined = DEFAULT_CURRENCY,
  opts: FormatMoneyOptions = {}
): string {
  const code = normalizeCurrencyCode(currency);
  const prefix = CURRENCY_DISPLAY[code]?.symbol ?? code;
  const decimals = opts.decimals ?? currencyDecimals(code);
  const num = parseMoney(amount, code);

  const render = (value: number, sign: string) =>
    `${sign}${prefix} ${value.toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  if (!Number.isFinite(num)) return render(0, '');

  // Math.round is half-up for non-negative input; rounding the absolute value
  // and restoring the sign keeps -1234.5 at -1235 instead of JS's -1234.
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const rounded = decimals === 0 ? Math.round(abs) : Math.round(abs * 100) / 100;
  return render(rounded, sign);
}

/**
 * Money in the company's rupiah. KEPT as a one-line wrapper so all 20 importing
 * files keep compiling and every existing `Rp` assertion keeps passing verbatim
 * (spec I1).
 *
 * New code that prints a QUOTATION's money must call `formatMoney` with that
 * quotation's `currency`: a quotation may be issued in another currency at a
 * recorded rate, and this function would print its foreign amounts as rupiah.
 */
export function formatRupiah(
  amount: number | string | null | undefined,
  opts: FormatRupiahOptions = {}
): string {
  return formatMoney(amount, DEFAULT_CURRENCY, opts);
}
