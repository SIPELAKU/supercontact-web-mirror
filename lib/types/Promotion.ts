// lib/types/Promotion.ts
//
// Promotions (COMMERCIAL Phase 5, spec D4 / F2).
//
// THE URL SAYS `promotions`; THE TABLE SAYS `discount_rules`. Both names are
// deliberate and both appear here: the endpoints are `/promotions` because that
// is what a seller calls them, the types carry `DiscountRule` because that is
// what the commercial plan fixed the table to.
//
// A PROMOTION is not a discount POLICY. A policy is a ceiling on what the
// SELLER may give away; a promotion is a price the COMPANY gives, folded into
// the resolved unit price BEFORE the seller's discount and outside that ceiling
// (A7). The two screens sit side by side in Settings > Sales and each says so.
//
// Money and quantities are Decimal on the server and arrive as JSON STRINGS.

import type { PromotionDiscountType, PromotionScope } from "@/lib/constants/promotion";

export type DiscountRuleScope = PromotionScope;
export type DiscountRuleDiscountType = PromotionDiscountType;

/** The briefs the response resolves so a row reads without a second request. */
export interface PromotionProductBrief {
  id: string;
  product_name: string;
  sku: string;
}

export interface PromotionCategoryBrief {
  id: string;
  code?: string | null;
  name: string;
}

export interface PromotionSalesChannelBrief {
  id: string;
  code: string;
  name: string;
}

export interface DiscountRule {
  id: string;
  /** Uppercase `^[A-Z0-9_-]{2,32}$`. Lands VERBATIM inside `price_source` (A11). */
  code: string;
  name: string;
  scope: DiscountRuleScope;
  target_product_id?: string | null;
  target_category_id?: string | null;
  discount_type: DiscountRuleDiscountType;
  /** Decimal-as-string. Percent 0-100, or an amount in COMPANY money. */
  discount_value: string;
  /** ALWAYS in the product's own (base) unit (A14) - never the line's unit. */
  min_quantity: string;
  sales_channel_id?: string | null;
  valid_from: string;
  valid_until?: string | null;
  /**
   * FALSE by default and the walk stops at the first non-stackable winner
   * (A24). The control's copy has to say that, because "off" is the state that
   * changes the arithmetic.
   */
  stackable: boolean;
  priority: number;
  is_active: boolean;
  target_product?: PromotionProductBrief | null;
  target_category?: PromotionCategoryBrief | null;
  sales_channel?: PromotionSalesChannelBrief | null;
  created_at: string;
  updated_at: string;
}

export interface DiscountRuleListResponse {
  total?: number | null;
  page: number;
  limit: number;
  total_pages?: number | null;
  /**
   * The API's own key. Named `promotions` on the wire because the endpoint is
   * `/promotions`; the client normalises whichever key arrives so a leg that
   * ships `rules` instead does not blank the screen.
   */
  promotions: DiscountRule[];
}

export interface DiscountRuleListParams {
  page?: number;
  limit?: number;
  include_total?: boolean;
  /** Tri-state: `true` = live only, `false` = archived only, omitted = both. */
  is_active?: boolean;
  scope?: DiscountRuleScope;
  sales_channel_id?: string;
  /** Rules in force on this date (`valid_from <= date <= valid_until`). */
  on_date?: string;
  /** Token-AND over `code` and `name`, the house search idiom. */
  search?: string;
}

/** `code` is NOT updatable: it is snapshotted onto stored quotation lines. */
export interface DiscountRuleCreate {
  code: string;
  name: string;
  scope?: DiscountRuleScope;
  target_product_id?: string | null;
  target_category_id?: string | null;
  discount_type?: DiscountRuleDiscountType;
  discount_value: number;
  min_quantity?: number;
  sales_channel_id?: string | null;
  valid_from: string;
  valid_until?: string | null;
  stackable?: boolean;
  priority?: number;
}

export type DiscountRuleUpdate = Partial<Omit<DiscountRuleCreate, "code">> & {
  is_active?: boolean;
};

/**
 * `GET /promotions/preview` (spec D4). The ordered ELIGIBLE rules and which of
 * them actually apply under the non-stackable walk - explained through the same
 * code path that prices a quote, which is the only reason the drawer can be
 * trusted.
 */
export interface DiscountRulePreviewEntry {
  rule: DiscountRule;
  applied: boolean;
  reason?: string | null;
}

export interface DiscountRulePreviewResponse {
  product_id: string;
  quantity: string;
  /** quantity x unit factor - what `min_quantity` is compared against (A14). */
  base_quantity: string;
  on_date: string;
  sales_channel_id?: string | null;
  eligible: DiscountRulePreviewEntry[];
}

export interface DiscountRulePreviewParams {
  product_id: string;
  quantity?: number;
  unit_id?: string | null;
  on_date?: string;
  sales_channel_id?: string | null;
}
