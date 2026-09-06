// lib/types/PriceList.ts
//
// Price lists, per-product prices and customer assignments (Phase 2, spec
// section D). One shape per API schema, 1:1 with D1/D2/D3.
//
// Money and quantities are Decimal on the server and arrive as JSON STRINGS
// ("1500000.00"); they are kept as strings here and formatted for display.
// REQUEST bodies send them as numbers, the way `ProductPayload.price` does.
// Dates are `YYYY-MM-DD`.
//
// Nothing in the web computes a price. Resolution, rounding and the bulk
// percentage arithmetic all live on the server (spec S3-10) - the screens
// here read what it returns.

import type { UnitBrief } from "@/lib/types/Unit";

/** Archive, never delete: a list is `archived`, its price rows are closed. */
export type PriceListStatus = "active" | "archived";

/**
 * How a price the LIST produces is rounded (tier or cost-plus), never the
 * `base` catalogue fallback. ROUND_HALF_UP, server-side, and it never turns a
 * positive price into zero (spec A7).
 */
export type PriceListRounding = "none" | "unit" | "hundred" | "thousand";

/**
 * The six kinds a price list can be assigned to. Phase 3 widened the server
 * enum from two; `TARGET_TYPE_LABELS` in `lib/constants/price-list.ts` is a
 * `Record<>` over this union, so adding a member is a compile error until its
 * label lands (spec I3).
 */
export type AssignmentTargetType =
  | "contact"
  | "crm_company"
  | "customer_type"
  | "segment"
  | "sales_channel"
  | "region";

export const PRICE_LIST_CODE_MAX_LENGTH = 32;
export const PRICE_LIST_NAME_MAX_LENGTH = 100;
export const CONTRACT_REF_MAX_LENGTH = 64;

/** `^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$` - the server's PRICE_LIST_CODE_PATTERN. */
export const PRICE_LIST_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$/;

/** Embedded per quotation line, so a seller reads a NAME and not a code. */
export interface PriceListBrief {
  id: string;
  code: string;
  name: string;
}

export interface PriceList {
  id: string;
  company_id: string;
  /** Immutable after create; exact, case-sensitive uniqueness per tenant. */
  code: string;
  name: string;
  currency: string;
  /** HIGHER wins. */
  priority: number;
  /** At most one per tenant (partial unique index). */
  is_default: boolean;
  /** What permits a manual line price on a quotation. */
  allow_manual_override: boolean;
  /** NULL disables the cost-plus branch. */
  markup_percent: string | null;
  rounding: PriceListRounding;
  status: PriceListStatus;
  valid_from: string | null;
  valid_until: string | null;
  /** Filled on the list endpoint only. */
  price_count: number | null;
  assignment_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface PriceListCreate {
  code: string;
  name: string;
  /** Must equal the company's `default_currency` (spec A20). */
  currency?: string;
  priority?: number;
  is_default?: boolean;
  allow_manual_override?: boolean;
  markup_percent?: number | null;
  rounding?: PriceListRounding;
  valid_from?: string | null;
  valid_until?: string | null;
}

/** `code` is immutable - sending it is a 422 unknown key (`extra="forbid"`). */
export interface PriceListUpdate {
  name?: string;
  priority?: number;
  is_default?: boolean;
  allow_manual_override?: boolean;
  markup_percent?: number | null;
  rounding?: PriceListRounding;
  status?: PriceListStatus;
  valid_from?: string | null;
  valid_until?: string | null;
}

export type PriceListSortBy = "code" | "name" | "priority" | "status" | "created_at";

export interface PriceListListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PriceListStatus;
  is_default?: boolean;
  sort_by?: PriceListSortBy;
  sort_order?: "asc" | "desc";
  include_total?: boolean;
}

export interface PriceListListResponse {
  total: number | null;
  page: number;
  limit: number;
  total_pages: number | null;
  price_lists: PriceList[];
}

/** DELETE archives; nothing is physically deleted. */
export interface PriceListArchiveResponse {
  id: string;
  status: PriceListStatus;
  archived: boolean;
}

// ── Per-product prices ────────────────────────────────────────────────────

/** The live catalogue row beside the list price, so the grid shows the delta. */
export interface ProductPriceProductBrief {
  id: string;
  product_name: string;
  sku: string;
  /** The catalogue base price, NOT the list price. */
  price: string;
}

export interface ProductPrice {
  id: string;
  company_id: string;
  price_list_id: string;
  product: ProductPriceProductBrief;
  /** NULL means "the product's own unit". */
  unit: UnitBrief | null;
  /** A tier MINIMUM: a row at 10 does not price a quantity of 5. */
  min_quantity: string;
  price: string;
  valid_from: string;
  valid_until: string | null;
  /** Derived server-side: `valid_until is None`. */
  is_open: boolean;
  /**
   * COMMERCIAL Phase 5 (A15): TRUE for a GRANDFATHERED row whose `unit` is
   * neither the product's own unit nor an ACTIVE conversion, so the quote path
   * can never resolve it. Surfaced on the product's "Konversi satuan" tab with
   * a one-click fix; never refused, never rewritten.
   */
  unit_conversion_missing?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPriceCreate {
  product_id: string;
  unit_id?: string | null;
  min_quantity?: number;
  price: number;
  /** Omitted = today in WIB, decided by the server. */
  valid_from?: string | null;
  valid_until?: string | null;
}

/** DELETE on a price CLOSES it: `valid_until` is set, nothing is removed. */
export interface ProductPriceCloseResponse {
  id: string;
  valid_until: string;
  closed: boolean;
}

export interface ProductPriceListParams {
  page?: number;
  limit?: number;
  product_id?: string;
  search?: string;
  only_open?: boolean;
  on_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  include_total?: boolean;
}

export interface ProductPriceListResponse {
  total: number | null;
  page: number;
  limit: number;
  total_pages: number | null;
  prices: ProductPrice[];
}

// ── Bulk percentage edit ──────────────────────────────────────────────────

export interface BulkPriceUpdateRequest {
  source_price_list_id: string;
  /** Negative lowers. -100..1000, two decimals. */
  percent: number;
  /** Defaults to the TARGET list's rounding. */
  rounding?: PriceListRounding | null;
  product_ids?: string[] | null;
  include_missing?: boolean;
  valid_from?: string | null;
  /** Computes and reports the same numbers while writing nothing. */
  dry_run?: boolean;
}

export interface BulkPriceSkipped {
  product_id: string;
  sku: string | null;
  reason: string;
}

export interface BulkPriceSample {
  product_id: string;
  sku: string | null;
  min_quantity: string;
  old_price: string | null;
  new_price: string;
}

export interface BulkPriceUpdateResponse {
  dry_run: boolean;
  closed: number;
  inserted: number;
  skipped: BulkPriceSkipped[];
  /** At most 5, deterministic order (product name, then min_quantity). */
  sample: BulkPriceSample[];
}

// ── Assignments ───────────────────────────────────────────────────────────

export interface PriceListAssignmentTargetBrief {
  id: string;
  label: string;
  target_type: AssignmentTargetType;
  /**
   * The same field name (and meaning) as `AssignmentTargetSearchItem.secondary`
   * so the web has ONE concept: email/phone for a contact, industry/city for a
   * CRM company, the code for a customer type or segment, the channel type for
   * a sales channel, the level for a region (spec 0.15 - there is no
   * `sublabel` anywhere).
   */
  secondary?: string | null;
}

export interface PriceListAssignment {
  id: string;
  company_id: string;
  price_list_id: string;
  target_type: AssignmentTargetType;
  target_id: string;
  target: PriceListAssignmentTargetBrief | null;
  /**
   * `target_id` carries no foreign key (spec A3) and contacts / CRM companies
   * are HARD-deleted, so an assignment can outlive its customer. Resolution
   * skips such a row, so an orphan can never price a quote - the screen shows
   * it so it can be removed.
   */
  target_exists: boolean;
  /** HIGHER wins, and it outranks the list's own priority. */
  priority: number;
  /** Metadata only; never affects resolution order. */
  is_contract: boolean;
  contract_ref: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceListAssignmentCreate {
  target_type: AssignmentTargetType;
  target_id: string;
  priority?: number;
  is_contract?: boolean;
  contract_ref?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

/** Target is immutable; remove and re-assign to point at another customer. */
export interface PriceListAssignmentUpdate {
  priority?: number;
  is_contract?: boolean;
  contract_ref?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

/** The one physical delete in Phase 2 (spec A22). */
export interface PriceListAssignmentDeleteResponse {
  id: string;
  deleted: boolean;
}

export interface PriceListAssignmentListParams {
  page?: number;
  limit?: number;
  target_type?: AssignmentTargetType;
  search?: string;
  only_open?: boolean;
  include_total?: boolean;
}

export interface PriceListAssignmentListResponse {
  total: number | null;
  page: number;
  limit: number;
  total_pages: number | null;
  assignments: PriceListAssignment[];
}

/**
 * GET /price-lists/targets/search - the ONLY picker source for assignments.
 * It exists so the screen needs no `contacts` / `companies` grant (S3-9b).
 */
export interface AssignmentTargetSearchItem {
  id: string;
  target_type: AssignmentTargetType;
  label: string;
  /**
   * email / phone for a contact, industry / city for a CRM company, the code
   * for a customer type or segment, the channel type for a sales channel, the
   * level for a region. One field for all six kinds (spec 0.15).
   */
  secondary: string | null;
}

export interface AssignmentTargetSearchParams {
  target_type: AssignmentTargetType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentTargetSearchResponse {
  items: AssignmentTargetSearchItem[];
  page: number;
  limit: number;
}

// ── "Which list applies to this customer" ─────────────────────────────────

/**
 * The seven levels the resolution chain walks, in plan section 5 order. The
 * three multi-valued ones (`segment`, `customer_type`, `region`) can each
 * contribute several candidates - one sub-level per target id, in the order the
 * server derived them, with the tie rule running unchanged inside each
 * (spec A9). `company_default` is deliberately NOT an assignment target type.
 */
export type PriceListCandidateLevel =
  | "contact"
  | "crm_company"
  | "segment"
  | "customer_type"
  | "sales_channel"
  | "region"
  | "company_default";

/** Why a candidate was dropped, when `is_candidate` is false. */
export type PriceListCandidateReason =
  | "archived"
  | "currency_mismatch"
  | "list_window"
  | "assignment_window"
  | "duplicate";

export interface PriceListCandidate {
  price_list: PriceListBrief;
  level: PriceListCandidateLevel;
  is_candidate: boolean;
  reason: PriceListCandidateReason | string | null;
  assignment_priority: number | null;
  list_priority: number;
  allow_manual_override: boolean;
  /** Phase 3: WHICH target of that level produced this candidate. */
  target_id?: string | null;
  /** The named target, so the explainer reads "via segmen Korporat", not "segment". */
  target?: PriceListAssignmentTargetBrief | null;
}

export interface PriceListResolutionParams {
  contact_id?: string;
  crm_company_id?: string;
  /**
   * Phase 3. The other three dimensions (customer type, segments, regions) are
   * DERIVED server-side from the same loader a quote uses and are deliberately
   * NOT accepted as parameters: a client-supplied dimension is the one shape
   * that could make the explainer disagree with what a customer is charged
   * (spec F1).
   */
  sales_channel_id?: string;
  on_date?: string;
}

export interface PriceListResolution {
  contact_id: string | null;
  crm_company_id: string | null;
  /** Echoed back, so the panel can say which channel it resolved for. */
  sales_channel_id?: string | null;
  /** What the server DERIVED, so the screen can say where a level came from. */
  segment_ids?: string[];
  customer_type_ids?: string[];
  region_ids?: string[];
  on_date: string;
  /** In resolution order. */
  candidates: PriceListCandidate[];
  winning_price_list: PriceListBrief | null;
  override_allowed: boolean;
}
