// lib/types/Quotation.ts
//
// One Quotation shape, mirroring the API contract (Phase 0 spec, section D1).
// Money and quantities are Decimal on the server and arrive as JSON STRINGS
// ("1500000.00"); they are kept as strings here and formatted with
// `formatRupiah`. Nothing in the web recomputes a total - the server does.

import type { PriceListBrief } from './PriceList';

export type DiscountType = 'percent' | 'amount';

/** Snapshot of the product's billing period on a recurring line (spec A24). */
export type QuotationBillingPeriod = 'monthly' | 'yearly';

/** Canonical status vocabulary. Legacy `Pending`/`Accepted` never appear in a response. */
export type QuotationStatus =
  | 'draft'
  | 'pending_approval'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired';

export type QuotationAction = 'draft' | 'publish';

/** Live catalogue row attached to a line. NOT to be used for pricing on edit. */
export interface QuotationLineProduct {
  id: string;
  product_name: string;
  sku: string;
  price: string;
  /** Phase 1: the product's unit (precision drives the Qty step), category and LIVE attributes. */
  unit?: { id: string; code: string; name: string; precision: number } | null;
  category?: { id: string; code: string; name: string } | null;
  custom_fields?: Record<string, unknown>;
}

export interface QuotationItem {
  id: string | null;
  quotation_id: string;
  product_id: string;
  quantity: string;
  list_price: string;
  unit_price: string;
  /** Legacy integer percent: round-half-up of discount_value when percent, else 0. */
  discount: number;
  discount_type: DiscountType;
  discount_value: string;
  discount_amount: string;
  header_discount_share: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
  price_source: string;
  product_name_snapshot: string | null;
  sku_snapshot: string | null;
  unit_label_snapshot: string | null;
  override_reason: string | null;
  notes: string | null;
  product: QuotationLineProduct;
  /**
   * Phase 2. All optional: a row written by an older leg carries none of them,
   * and a tenant with no price list resolves every line to `base`.
   */
  /** Resolved at response time from the stored `price_source` code. */
  price_list?: PriceListBrief | null;
  /** What the customer would have paid without the manual override (spec A9). */
  resolved_unit_price?: string | null;
  /** The winning list's `allow_manual_override` - the ONLY gate for the control. */
  override_allowed?: boolean;
  tier_min_quantity?: string | null;
  billing_period?: QuotationBillingPeriod | null;
}

export interface LeadContact {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  /** The FREE-TEXT `contacts.company` string, not a CRM account. */
  company: string | null;
  /**
   * Phase 3 (spec D5 / 0.14). The quotation PDF's documented fallback prints
   * this when the quotation has no linked CRM company, or that company's
   * address is blank - and without this field the new address block would be
   * empty for every real quotation on day one: `npwp` and `address_line` are
   * NULL on 100% of the 206 `crm_companies` rows fleet-wide, while 1,052
   * PRODUCTION CONTACTS DO carry a free-text address.
   */
  address?: string | null;
}

/**
 * The linked CRM company as the quotation carries it (Phase 3, spec D5).
 * Every field optional: the column is nullable, and a quotation written by an
 * older leg has no `crm_company_id` at all.
 */
export interface QuotationCrmCompanyBrief {
  id: string;
  name: string | null;
  npwp?: string | null;
  address_line?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  postal_code?: string | null;
  location?: string | null;
}

export interface QuotationSalesChannelBrief {
  id: string;
  code: string;
  name: string;
  channel_type: string;
}

export interface QuotationSegmentBrief {
  id: string;
  code: string;
  name: string;
  priority: number;
}

export interface LeadUser {
  id: string;
  fullname: string;
  email: string;
}

export interface Lead {
  id: string;
  office_location: string;
  contact: LeadContact;
  user: LeadUser;
}

export interface Quotation {
  id: string;
  lead_id: string;
  quotation_number: string;
  quotation_title: string;
  expire_date: string;
  quotation_status: QuotationStatus;
  currency: string;
  subtotal: string;
  line_discount_total: string;
  discount_type: DiscountType;
  discount_value: string;
  /** Header discount in money. */
  discount_amount: string;
  discount_total: string;
  taxable_amount: string;
  tax_rate: string;
  tax_total: string;
  prices_include_tax: boolean;
  grand_total: string;
  terms: string | null;
  payment_terms: string | null;
  /** Header-level custom fields (Phase 1); strict against the tenant's `quotation` definitions. */
  custom_fields?: Record<string, unknown>;
  revision_of_id: string | null;
  revision_no: number;
  sent_at: string | null;
  accepted_at: string | null;
  public_code: string | null;
  /**
   * Phase 3 (spec D5). Snapshotted from the lead at create and re-snapshotted
   * ONLY on an update that carries `items` (spec A15), so the header and the
   * lines can never disagree about who the customer is. All optional and
   * defaulted, so every existing client stays valid.
   */
  contact_id?: string | null;
  crm_company_id?: string | null;
  sales_channel_id?: string | null;
  /**
   * The highest-priority MATCHING segment - NOT necessarily the segment whose
   * price list won a line (spec A11). The pricing segment is named separately
   * by the resolution explainer.
   */
  segment_id?: string | null;
  crm_company?: QuotationCrmCompanyBrief | null;
  sales_channel?: QuotationSalesChannelBrief | null;
  segment?: QuotationSegmentBrief | null;
  lead: Lead;
  items: QuotationItem[];
  created_at: string;
  updated_at: string;
}

/** GET /quotations/{id}: the row plus Proposal-stage suggestions. */
export interface QuotationDetail extends Quotation {
  item_others: QuotationItem[];
}

export interface QuotationLineTotals {
  index: number;
  product_id: string;
  quantity: string;
  list_price: string;
  unit_price: string;
  gross: string;
  discount_type: DiscountType;
  discount_value: string;
  discount_amount: string;
  header_discount_share: string;
  taxable_amount: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
  price_source: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  effective_discount_percent: string;
  /** Phase 1: the unit the line is counted in, and how many decimals it allows (2 when no unit). */
  unit_label_snapshot?: string | null;
  unit_precision?: number;
  /** Phase 2 (spec D4). Optional so an older API build still validates. */
  price_list?: PriceListBrief | null;
  resolved_unit_price?: string | null;
  /**
   * Whether the winning price list permits a manual price on THIS line.
   * Server-supplied, so the form needs no second request and never re-derives
   * which list won (spec S3-1).
   */
  override_allowed?: boolean;
  override_reason?: string | null;
  tier_min_quantity?: string | null;
  billing_period?: QuotationBillingPeriod | null;
}

/** POST /quotations/preview response: every number the summary shows. */
export interface QuotationTotals {
  currency: string;
  tax_rate: string;
  prices_include_tax: boolean;
  subtotal: string;
  line_discount_total: string;
  discount_type: DiscountType;
  discount_value: string;
  discount_amount: string;
  discount_total: string;
  taxable_amount: string;
  tax_total: string;
  grand_total: string;
  lines: QuotationLineTotals[];
  /**
   * `lead` = priced with the customer's assignments; `none` = priced as if the
   * customer had none, which is what a preview without `lead_id` gets and is
   * the same context the server validates an override against (spec A14).
   */
  price_context?: 'lead' | 'none';
}

/** GET /quotations/defaults: the company's snapshot basis for a new quotation. */
export interface QuotationDefaults {
  currency: string;
  tax_rate: string;
  prices_include_tax: boolean;
  terms: string | null;
  payment_terms: string | null;
  max_discount_percent: string;
}

/** One line as the API accepts it (QuotationItemRequest, `extra="forbid"`). No `price`. */
export interface QuotationItemPayload {
  product_id: string;
  quantity: number;
  notes?: string | null;
  /** Legacy integer percent: the rounded value when type is percent, else 0. */
  discount: number;
  discount_type: DiscountType;
  discount_value: number;
  /**
   * Manual override (spec A11). Sent ONLY when the seller set one. The server
   * always resolves the price itself and refuses this key with an indexed 400
   * unless the winning list allows an override - it is not a return of the
   * Phase 0 client-computed `price`, which is still an unknown key.
   */
  unit_price?: number | null;
  /** Mandatory whenever `unit_price` is sent, and refused without it. */
  override_reason?: string | null;
}

export interface QuotationPreviewRequest {
  items: QuotationItemPayload[];
  discount_type: DiscountType;
  discount_value: number;
  /**
   * The customer context to price against. Without it the server prices with
   * the company default list only and answers `price_context: "none"`.
   */
  lead_id?: string | null;
  /**
   * Phase 3 (spec D5). The sales channel is a RESOLUTION LEVEL, so it must be
   * carried by the preview as well as the save - otherwise the previous
   * channel's prices stay on screen after the picker changes.
   */
  sales_channel_id?: string | null;
}

export interface QuotationStatusTransition {
  status: 'accepted' | 'rejected';
  reason?: string | null;
}

/** One editable row of the quotation form. */
export interface ItemRow {
  product_id: string;
  title: string;
  sku: string;
  desc: string;
  qty: number;
  /** Stored unit price on edit, catalogue price on a fresh pick. */
  unitPrice: number;
  listPrice: number;
  discountType: DiscountType;
  discountValue: number;
  /** Unit name shown beside Qty; the stored snapshot on edit, the catalogue unit on a pick. */
  unitLabel: string | null;
  /** Decimals the unit allows - a HINT for the input step (default 2, the no-unit rule). */
  unitPrecision: number;
  /** The product's live attributes, shown read-only under its name; never priced. */
  attributes: Record<string, unknown>;
  /**
   * Manual override, owned by the row because the seller types it. `null`
   * means "no override" and nothing is sent for this line.
   */
  overridePrice: number | null;
  overrideReason: string;
  /**
   * Seeded from a STORED line so a read-only view can render the source and
   * the control state before any preview runs. While the form is editable the
   * preview's own line wins - it is the fresher answer, and it is the one the
   * server will validate the override against.
   */
  overrideAllowed: boolean;
  priceList: PriceListBrief | null;
  billingPeriod: QuotationBillingPeriod | null;
}
