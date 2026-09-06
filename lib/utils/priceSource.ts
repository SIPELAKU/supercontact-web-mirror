// lib/utils/priceSource.ts
//
// `quotation_items.price_source` is a small grammar the server writes and the
// seller reads. This is the ONE place it is parsed and turned into Indonesian.
//
// The four grammars (spec A8):
//
//   base                       the catalogue price - no list priced this line
//   list:CODE tier:MIN         a price list's tier, MIN being the quantity floor
//   cost_plus:CODE             the list's markup on the product's cost
//   manual                     a seller typed the price, with a reason
//
// COMMERCIAL Phase 5 (spec I2 / A11) adds ONE optional suffix to the first
// three: ` promo:CODE`, when a company promotion was folded into the price.
//
//   list:UMUM tier:1 promo:LEBARAN
//   cost_plus:RETAIL promo:LEBARAN
//   base promo:LEBARAN
//
// It is NEVER appended to `manual` (A11): a manual override supersedes both the
// list price and the promotion, so an overridden line stores the bare literal
// `manual` and carries NULL promo columns. Five production `price_source ===
// "manual"` equality sites depend on that and are untouched.
//
// The suffix is split off FIRST and the remainder is matched by the existing
// END-ANCHORED patterns, unchanged. Without that split, `LIST_PATTERN` -
// `/^list:(\S+) tier:(\S+)$/` - simply fails on a promoted line, `kind`
// degrades to `"unknown"` and the chip renders the raw machine string on EVERY
// promoted line: a cosmetic regression no API test could ever have caught.
//
// Splitting first also fixes a live latent bug in the current partition: the
// `cost_plus` branch takes `text.slice(prefix.length)` wholesale, so
// `cost_plus:UMUM promo:X` would return the GLUED code `"UMUM promo:X"` and
// `price_list_codes_in` would resolve a list name that does not exist.
//
// Anything else is rendered VERBATIM and never throws: an old leg, a future
// grammar, or a hand-written row must not blank the cell or crash the form.
//
// This module does no arithmetic. It formats what the server decided.

import type { PriceListBrief } from "@/lib/types/PriceList";
import { parseMoney } from "@/lib/helper/currency";

export type PriceSourceKind = "base" | "list" | "cost_plus" | "manual" | "unknown";

export interface PriceSourceParts {
  kind: PriceSourceKind;
  /** The price list's CODE, for `list` and `cost_plus`. */
  code: string | null;
  /** The tier minimum as the server wrote it ("10", "10.5"), for `list`. */
  tier: string | null;
  /**
   * The promotion's CODE when one was folded into this price (COMMERCIAL
   * Phase 5, A11), else null. Never set on a `manual` line: the suffix is not
   * written there at all.
   */
  promoCode: string | null;
  /** Exactly what arrived, so an unknown value can be shown as-is. */
  raw: string;
}

const LIST_PATTERN = /^list:(\S+) tier:(\S+)$/;
const COST_PLUS_PATTERN = /^cost_plus:(\S+)$/;
/**
 * The promo suffix, split off before anything else (spec I2). The leading SPACE
 * is part of the marker, which is what keeps a bare `promo:X` - no grammar in
 * front of it - `unknown` exactly as it was before Phase 5.
 */
const PROMO_SUFFIX_PATTERN = /^(.*\S) promo:(\S+)$/;

export function parsePriceSource(value: string | null | undefined): PriceSourceParts {
  const raw = typeof value === "string" ? value.trim() : "";

  // 1. Split the optional ` promo:CODE` suffix FIRST (A11). `raw` keeps the
  //    WHOLE original string, so an unknown grammar still renders verbatim.
  const promo = PROMO_SUFFIX_PATTERN.exec(raw);
  const head = promo ? promo[1] : raw;
  const promoCode = promo ? promo[2] : null;

  // 2. Parse the remainder exactly as before.
  if (head === "base") return { kind: "base", code: null, tier: null, promoCode, raw };
  // A promoted `manual` cannot exist (A11); if a future leg ever wrote one, the
  // kind still reads `manual` so the five equality sites stay correct.
  if (head === "manual") return { kind: "manual", code: null, tier: null, promoCode, raw };

  const list = LIST_PATTERN.exec(head);
  if (list) return { kind: "list", code: list[1], tier: list[2], promoCode, raw };

  const costPlus = COST_PLUS_PATTERN.exec(head);
  if (costPlus) return { kind: "cost_plus", code: costPlus[1], tier: null, promoCode, raw };

  // An unrecognised head is unknown WITH NO promo code: a suffix split off a
  // grammar nobody can read is a guess, and `raw` already carries the truth.
  return { kind: "unknown", code: null, tier: null, promoCode: null, raw };
}

/**
 * A tier minimum as a human reads it: "10", "10,5". Falls back to the raw text
 * for anything that is not a number, so a future grammar still renders.
 */
export function formatTier(tier: string | null | undefined): string {
  if (tier === null || tier === undefined || tier === "") return "";
  const num = parseMoney(tier);
  if (!Number.isFinite(num)) return String(tier);
  return num.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

/**
 * The list's NAME when the response carried a brief, its CODE otherwise.
 *
 * A brief is resolved at response time from the stored code, so a list that
 * was archived, renamed or removed can legitimately be missing - and the code
 * is still more useful than nothing.
 */
function listLabel(parts: PriceSourceParts, priceList?: PriceListBrief | null): string {
  const name = priceList?.name?.trim();
  if (name) return name;
  return priceList?.code?.trim() || parts.code || "";
}

/**
 * One short Indonesian sentence for the chip under a line's unit price.
 * Returns "" when there is nothing to say (an empty `price_source`), so the
 * caller can skip the chip rather than render an empty box.
 */
export interface DescribePriceSourceOptions {
  /**
   * Append ", promo CODE" when the line carries one. TRUE by default, so every
   * existing caller - the read-only view, the PDF, the approval card - keeps
   * naming the promotion in the one string it prints.
   *
   * The quotation FORM passes `false`, and only the form: it renders a
   * dedicated promo chip immediately beside this one (spec I8), and two
   * adjacent chips both spelling "LEBARAN" reads as a rendering bug rather than
   * as two facts. The chip names the promotion; this string names the price's
   * ORIGIN.
   */
  includePromo?: boolean;
}

export function describePriceSource(
  value: string | null | undefined,
  priceList?: PriceListBrief | null,
  options: DescribePriceSourceOptions = {}
): string {
  const parts = parsePriceSource(value);
  // The promo fragment is appended, never substituted: a reader must still see
  // WHICH list priced the line, with the promotion named beside it (spec I2).
  const promo =
    parts.promoCode && options.includePromo !== false ? `, promo ${parts.promoCode}` : "";
  switch (parts.kind) {
    case "base":
      return `Harga dasar${promo}`;
    case "manual":
      // A promoted manual line cannot exist (A11), so there is no fragment here.
      return "Harga manual";
    case "list": {
      const label = listLabel(parts, priceList);
      const tier = formatTier(parts.tier);
      const head = label ? `Harga dari Daftar Harga ${label}` : "Harga dari daftar harga";
      return `${tier ? `${head}, tier ≥ ${tier}` : head}${promo}`;
    }
    case "cost_plus": {
      const label = listLabel(parts, priceList);
      return `${label ? `Harga cost-plus (Daftar Harga ${label})` : "Harga cost-plus"}${promo}`;
    }
    default:
      // A genuinely unknown grammar renders VERBATIM and never throws: an old
      // leg, a hand-written row or a future suffix must not blank the cell.
      return parts.raw;
  }
}

/** The tones `SOURCE_CHIP_CLASS` must carry a key for (spec I2, M-f). */
export type PriceSourceTone = "neutral" | "list" | "manual" | "promo";

/**
 * The chip's tone. `manual` is the one a reviewer must notice, and `promo` is
 * the one a READER must notice: a company promotion is not the seller's
 * discount and the two must never share a colour.
 *
 * The return type is WIDENED to include `"promo"` (spec I2 / M-f). Left as the
 * old three-member union it would fail `tsc` the moment `SOURCE_CHIP_CLASS`
 * gained a promo key. A promoted `manual` line cannot exist (A11), so `manual`
 * still wins outright.
 */
export function priceSourceTone(value: string | null | undefined): PriceSourceTone {
  const parts = parsePriceSource(value);
  if (parts.kind === "manual") return "manual";
  if (parts.promoCode) return "promo";
  if (parts.kind === "list" || parts.kind === "cost_plus") return "list";
  return "neutral";
}

/** The promotion code on a line, or null. One reader for the chip and the PDF. */
export function priceSourcePromoCode(value: string | null | undefined): string | null {
  return parsePriceSource(value).promoCode;
}

/**
 * A recurring line prints its period after the unit price (spec A24). The
 * snapshot is taken at build time, so a quote keeps saying "per bulan" after
 * the product is re-typed.
 */
export const BILLING_PERIOD_SUFFIX: Record<string, string> = {
  monthly: "/bulan",
  yearly: "/tahun",
};

export function billingPeriodSuffix(period: string | null | undefined): string {
  if (!period) return "";
  return BILLING_PERIOD_SUFFIX[period] ?? "";
}
