// lib/constants/promotion.ts
//
// COMMERCIAL Phase 5 (spec I2 / I6). The vocabulary of a PROMOTION, in one
// place, because two screens and two documents have to say the same thing
// about it: the promotions manager, the quotation form, the PDF and the public
// acceptance page.
//
// THE ONE DISTINCTION THIS FILE EXISTS TO KEEP (spec I6):
//
//   A discount POLICY is a CEILING on what the SELLER may give away.
//   A PROMOTION is a price the COMPANY itself gives, folded into the unit
//   price BEFORE the seller's discount and OUTSIDE that ceiling.
//
// They now sit side by side in Settings > Sales, which is exactly why each
// screen carries one sentence naming the other.
//
// The URL and the screens say "promosi"; the TABLE is `discount_rules`,
// because that is what the commercial plan fixed. Both names are used
// deliberately - the API paths are `/promotions`, the type names carry
// `DiscountRule`.

/** `discount_rules.scope`: what the rule bites on (spec D4). */
export type PromotionScope = "all" | "product" | "category";

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  all: "Semua produk",
  product: "Satu produk",
  category: "Satu kategori",
};

export const PROMOTION_SCOPE_OPTIONS: { value: PromotionScope; label: string }[] = [
  { value: "all", label: PROMOTION_SCOPE_LABELS.all },
  { value: "product", label: PROMOTION_SCOPE_LABELS.product },
  { value: "category", label: PROMOTION_SCOPE_LABELS.category },
];

/** `discount_rules.discount_type` - the same two words a line discount uses. */
export type PromotionDiscountType = "percent" | "amount";

export const PROMOTION_DISCOUNT_TYPE_OPTIONS: {
  value: PromotionDiscountType;
  label: string;
}[] = [
  { value: "percent", label: "%" },
  { value: "amount", label: "Nominal" },
];

/**
 * The `stackable` copy, verbatim (spec I6). Non-stackable is the DEFAULT and
 * the walk stops at the first non-stackable winner (A24), so the control has to
 * say what leaving it off means rather than only what turning it on does.
 */
export const PROMOTION_STACKABLE_HELP =
  "tidak digabung dengan promo lain kecuali dicentang";

/** A14: `min_quantity` never depends on the unit the seller happened to pick. */
export const PROMOTION_MIN_QUANTITY_HELP = "minimum dalam satuan dasar produk";

/** The one sentence the promotions screen prints about discount policies. */
export const PROMOTION_VS_POLICY_HELP =
  "Promosi adalah potongan yang DIBERIKAN PERUSAHAAN, sudah masuk ke harga satuan sebelum diskon penjual - berbeda dari Kebijakan Diskon, yang membatasi berapa banyak penjual boleh memberi diskon.";

/** The mirror sentence, for the discount-policies screen. */
export const POLICY_VS_PROMOTION_HELP =
  "Kebijakan diskon membatasi diskon yang DIBERIKAN PENJUAL. Potongan yang diberikan perusahaan sendiri diatur di Settings > Sales > Promosi dan tidak dibatasi oleh angka di sini.";

/**
 * The promo chip's tone key. It is its own tone rather than reusing `list`,
 * because a reader must be able to tell "this line is on a company promotion"
 * from "this line came off a price list" at a glance - they are different
 * facts with different owners (spec I8).
 */
export const PROMO_CHIP_TONE = "promo" as const;

/** `"Promo LEBARAN −10%"` for the chip beside the price-source chip (spec I8). */
export function promoChipLabel(
  code: string | null | undefined,
  discountType?: PromotionDiscountType | null,
  discountValue?: string | number | null
): string {
  const label = (code ?? "").trim();
  if (!label) return "";
  if (discountType === "percent" && discountValue !== null && discountValue !== undefined) {
    const value = Number(discountValue);
    if (Number.isFinite(value) && value > 0) {
      return `Promo ${label} −${value.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      })}%`;
    }
  }
  return `Promo ${label}`;
}

/** The API's `^[A-Z0-9_-]{2,32}$` (spec D4), mirrored so the form can refuse early. */
export const PROMO_CODE_PATTERN = /^[A-Z0-9_-]{2,32}$/;
export const PROMO_CODE_MAX_LENGTH = 32;
export const PROMOTION_NAME_MAX_LENGTH = 100;
