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
  /** Exactly what arrived, so an unknown value can be shown as-is. */
  raw: string;
}

const LIST_PATTERN = /^list:(\S+) tier:(\S+)$/;
const COST_PLUS_PATTERN = /^cost_plus:(\S+)$/;

export function parsePriceSource(value: string | null | undefined): PriceSourceParts {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw === "base") return { kind: "base", code: null, tier: null, raw };
  if (raw === "manual") return { kind: "manual", code: null, tier: null, raw };

  const list = LIST_PATTERN.exec(raw);
  if (list) return { kind: "list", code: list[1], tier: list[2], raw };

  const costPlus = COST_PLUS_PATTERN.exec(raw);
  if (costPlus) return { kind: "cost_plus", code: costPlus[1], tier: null, raw };

  return { kind: "unknown", code: null, tier: null, raw };
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
export function describePriceSource(
  value: string | null | undefined,
  priceList?: PriceListBrief | null
): string {
  const parts = parsePriceSource(value);
  switch (parts.kind) {
    case "base":
      return "Harga dasar";
    case "manual":
      return "Harga manual";
    case "list": {
      const label = listLabel(parts, priceList);
      const tier = formatTier(parts.tier);
      const head = label ? `Harga dari Daftar Harga ${label}` : "Harga dari daftar harga";
      return tier ? `${head}, tier ≥ ${tier}` : head;
    }
    case "cost_plus": {
      const label = listLabel(parts, priceList);
      return label ? `Harga cost-plus (Daftar Harga ${label})` : "Harga cost-plus";
    }
    default:
      return parts.raw;
  }
}

/** The chip's tone. `manual` is the only one a reviewer must notice. */
export function priceSourceTone(
  value: string | null | undefined
): "neutral" | "list" | "manual" {
  const kind = parsePriceSource(value).kind;
  if (kind === "manual") return "manual";
  if (kind === "list" || kind === "cost_plus") return "list";
  return "neutral";
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
