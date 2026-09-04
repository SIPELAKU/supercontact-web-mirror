// lib/types/Quotation.ts
//
// One Quotation shape, mirroring the API contract (Phase 0 spec, section D1).
// Money and quantities are Decimal on the server and arrive as JSON STRINGS
// ("1500000.00"); they are kept as strings here and formatted with
// `formatRupiah`. Nothing in the web recomputes a total - the server does.

export type DiscountType = 'percent' | 'amount';

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
}

export interface LeadContact {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  company: string | null;
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
}

export interface QuotationPreviewRequest {
  items: QuotationItemPayload[];
  discount_type: DiscountType;
  discount_value: number;
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
}
