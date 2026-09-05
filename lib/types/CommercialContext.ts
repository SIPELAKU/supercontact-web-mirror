// lib/types/CommercialContext.ts
//
// Commercial context (Phase 3, spec sections D1-D3): customer types, customer
// segments, sales channels and regions - the four master tables the pricing
// chain resolves through, plus the region importer's request/response shapes.
//
// One shape per API schema, 1:1 with D1/D2/D3. Nothing here is computed in the
// browser: segment membership is evaluated server-side at quote time and is
// never persisted (spec A12), so there is no membership shape to model.
//
// Statuses are `active` / `archived` throughout: DELETE archives, nothing is
// physically deleted (spec A26).

/** Archive, never delete - the same contract as a price list. */
export type CommercialStatus = "active" | "archived";

// ── Customer types ────────────────────────────────────────────────────────

export interface CustomerTypeBrief {
  id: string;
  code: string;
  name: string;
}

export interface CustomerType {
  id: string;
  company_id: string;
  /** Immutable after create; exact, case-sensitive uniqueness per tenant. */
  code: string;
  name: string;
  /** At most one per tenant (partial unique index `uq_customer_types_company_default`). */
  is_default: boolean;
  sort_order: number;
  status: CommercialStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerTypeCreate {
  code: string;
  name: string;
  is_default?: boolean;
  sort_order?: number;
}

/** `code` is immutable - sending it is a 422 unknown key (`extra="forbid"`). */
export interface CustomerTypeUpdate {
  name?: string;
  is_default?: boolean;
  sort_order?: number;
  status?: CommercialStatus;
}

export type CustomerTypeSortBy = "sort_order" | "code" | "name" | "created_at";

export interface CustomerTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_total?: boolean;
  include_inactive?: boolean;
  sort_by?: CustomerTypeSortBy;
  sort_order?: "asc" | "desc";
}

export interface CustomerTypeListResponse {
  items: CustomerType[];
  page: number;
  limit: number;
  total: number | null;
  total_pages: number | null;
}

// ── Customer segments ─────────────────────────────────────────────────────

/**
 * The seven closed criteria fields. This union is the tsc tripwire behind
 * `SEGMENT_FIELD_OPTIONS` / `SEGMENT_FIELD_OPS`: adding a member is a compile
 * error until both `Record<>`s carry it (spec 0.18).
 *
 * `tags` means the contact's OWN `contact_tags` names, matched
 * case-insensitively and existentially over the set (spec A0.2 - A13's
 * "read leads.tag" fallback was withdrawn by the owner on 2026-09-05, and the
 * tags are real rows now: `lib/types/ContactTag.ts`). `lead_status` keeps its
 * A13 meaning: the SET of distinct `leads.lead_status` values across the
 * contact's leads.
 */
export type SegmentBaseField =
  | "customer_type"
  | "tags"
  | "region"
  | "sales_channel"
  | "lead_status"
  | "accepted_quotations_count_365d"
  | "accepted_quotations_amount_365d";

/**
 * A clause may also name one of the tenant's `contact` custom fields. A
 * template-literal member cannot sit in an exhaustive `Record<>`, which is
 * exactly why the base union above is kept separate (spec 0.18).
 */
export type SegmentClauseField = SegmentBaseField | `custom_fields.${string}`;

export type SegmentClauseOperator = "eq" | "in" | "gte" | "lte" | "contains";

/** `{field, operator, value}` - the API refuses any other key shape. */
export interface SegmentClause {
  field: SegmentClauseField;
  operator: SegmentClauseOperator;
  value: unknown;
}

/** An AND of 1..10 clauses. `{"all": []}` matches NOBODY (spec A14). */
export interface SegmentCriteria {
  all: SegmentClause[];
}

export interface CustomerSegmentBrief {
  id: string;
  code: string;
  name: string;
  priority: number;
}

export interface CustomerSegment {
  id: string;
  company_id: string;
  code: string;
  name: string;
  /** HIGHER wins - the price-list / assignment convention. */
  priority: number;
  criteria: SegmentCriteria;
  status: CommercialStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerSegmentCreate {
  code: string;
  name: string;
  priority?: number;
  criteria: SegmentCriteria;
}

export interface CustomerSegmentUpdate {
  name?: string;
  priority?: number;
  criteria?: SegmentCriteria;
  status?: CommercialStatus;
}

export type CustomerSegmentSortBy = "priority" | "code" | "name" | "created_at";

export interface CustomerSegmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_total?: boolean;
  include_inactive?: boolean;
  sort_by?: CustomerSegmentSortBy;
  sort_order?: "asc" | "desc";
}

export interface CustomerSegmentListResponse {
  items: CustomerSegment[];
  page: number;
  limit: number;
  total: number | null;
  total_pages: number | null;
}

/** POST /customer-segments/evaluate - the explainer, one contact or one lead. */
export interface SegmentEvaluateRequest {
  contact_id?: string;
  lead_id?: string;
}

export interface SegmentEvaluateResponse {
  contact_id: string | null;
  lead_id: string | null;
  /** The facts the server derived, as it derived them; shape is server-owned. */
  facts: Record<string, unknown>;
  /** Every matching segment, priority DESC then code ASC then id ASC (spec A10). */
  matched: CustomerSegmentBrief[];
  /**
   * `matched[0]`, i.e. what a quotation would store. It is the highest-priority
   * MATCHING segment, which may differ from the segment whose price list won
   * the line (spec A11).
   */
  winning_segment_id: string | null;
}

// ── Sales channels ────────────────────────────────────────────────────────

/** Seven values, mirrored from `SALES_CHANNEL_TYPES` in the API model. */
export type SalesChannelType =
  | "whatsapp"
  | "web_widget"
  | "email"
  | "marketplace"
  | "reseller"
  | "field_sales"
  | "direct";

/** The omnichannel account a channel may be linked to (spec D3). */
export interface OmnichannelAccountBrief {
  id: string;
  channel_type: string;
  display_name: string | null;
  channel_identifier: string | null;
  is_active: boolean;
}

export interface SalesChannelBrief {
  id: string;
  code: string;
  name: string;
  channel_type: SalesChannelType;
}

export interface SalesChannel {
  id: string;
  company_id: string;
  code: string;
  name: string;
  channel_type: SalesChannelType;
  /**
   * Only a `whatsapp` / `web_widget` / `email` channel may carry one, and only
   * an account of the MATCHING type: the two vocabularies overlap in exactly
   * three values (spec A25).
   */
  omnichannel_account_id: string | null;
  omnichannel_account: OmnichannelAccountBrief | null;
  status: CommercialStatus;
  created_at: string;
  updated_at: string;
}

export interface SalesChannelCreate {
  code: string;
  name: string;
  channel_type: SalesChannelType;
  omnichannel_account_id?: string | null;
}

export interface SalesChannelUpdate {
  name?: string;
  channel_type?: SalesChannelType;
  omnichannel_account_id?: string | null;
  status?: CommercialStatus;
}

export type SalesChannelSortBy = "code" | "name" | "channel_type" | "created_at";

export interface SalesChannelListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_total?: boolean;
  include_inactive?: boolean;
  channel_type?: SalesChannelType;
  sort_by?: SalesChannelSortBy;
  sort_order?: "asc" | "desc";
}

export interface SalesChannelListResponse {
  items: SalesChannel[];
  page: number;
  limit: number;
  total: number | null;
  total_pages: number | null;
}

// ── Regions ───────────────────────────────────────────────────────────────

/** Five levels, mirrored from `REGION_LEVELS` in the API model. */
export type RegionLevel = "country" | "province" | "kabupaten" | "kecamatan" | "custom";

export interface RegionBrief {
  id: string;
  code: string;
  name: string;
  level: RegionLevel;
}

export interface Region {
  id: string;
  company_id: string;
  code: string;
  name: string;
  level: RegionLevel;
  parent_id: string | null;
  /**
   * "Indonesia / Jawa Barat / Bandung". A flat OFFSET/LIMIT list cannot indent
   * (branches interleave), so the path column says where a row sits - the
   * ProductCategoriesTab rationale.
   */
  path: string;
  /** 0 = root. `MAX_REGION_DEPTH_INDEX` is 4, i.e. five levels. */
  depth: number;
  status: CommercialStatus;
  created_at: string;
  updated_at: string;
}

export interface RegionTreeNode {
  id: string;
  code: string;
  name: string;
  level: RegionLevel;
  depth: number;
  children: RegionTreeNode[];
}

export interface RegionCreate {
  code: string;
  name: string;
  level: RegionLevel;
  parent_id?: string | null;
}

export interface RegionUpdate {
  name?: string;
  level?: RegionLevel;
  parent_id?: string | null;
  status?: CommercialStatus;
}

export type RegionSortBy = "code" | "name" | "level" | "created_at";

export interface RegionListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_total?: boolean;
  include_inactive?: boolean;
  level?: RegionLevel;
  parent_id?: string;
  sort_by?: RegionSortBy;
  sort_order?: "asc" | "desc";
}

export interface RegionListResponse {
  items: Region[];
  page: number;
  limit: number;
  total: number | null;
  total_pages: number | null;
}

/**
 * POST /regions/import-reference - installs the shipped dataset (1 country +
 * 38 provinces with ISO 3166-2:ID codes), idempotently BY CODE. Running it is
 * what gives a tenant regions to match against; the CRM importer NEVER invents
 * one (spec A19, E6.3).
 */
export interface RegionReferenceImportResponse {
  created: number;
  skipped: number;
  /** Names of the regions this run created, in install order. */
  items: string[];
}

/**
 * POST /regions/import-from-crm. `location` matches at province level,
 * `kabupaten` at kabupaten level, `kecamatan` at kecamatan level - against the
 * regions that exist IN THE TENANT.
 */
export interface RegionCrmImportRequest {
  levels?: RegionLevel[];
  /** Returns the IDENTICAL report while writing nothing. */
  dry_run?: boolean;
}

export interface RegionCrmImportUnmatched {
  value: string;
  level: string;
  /** How many `crm_companies` rows carry this value - what to add first. */
  count: number;
}

export interface RegionCrmImportResponse {
  matched: number;
  updated: number;
  unmatched: RegionCrmImportUnmatched[];
  skipped: number;
  dry_run: boolean;
}

/**
 * PATCH /company-intelligence/my-target-companies/{id}/commercial - the ONLY
 * write path for a saved CRM company's reference columns and the five address
 * columns the quotation PDF prints (`extra="forbid"`, spec D7).
 */
export interface CrmCompanyCommercialUpdate {
  customer_type_id?: string | null;
  region_id?: string | null;
  npwp?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  kabupaten?: string | null;
  kecamatan?: string | null;
}
