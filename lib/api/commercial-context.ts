// lib/api/commercial-context.ts
//
// Customer types, customer segments, sales channels and regions (Phase 3,
// spec F). Built on `lib/api/catalog-http.ts` like the Phase 1/2 managers - no
// axios and no `/api/proxy`: the token is already in hand.
//
// Permissions, as the routers declare them (spec F):
//   customer_types / sales_channels / regions
//     READ   = contacts | companies | quotations | sales:config:manage
//     MANAGE = sales:config:manage
//   customer_segments
//     READ = MANAGE = sales:config:manage   (never picked by a user, only
//                                            evaluated, and they govern prices)
//
// DELETE ARCHIVES on all four entities - nothing is physically deleted
// (spec A26), which is why every client below returns an archive response
// rather than void.

import type {
  CrmCompanyCommercialUpdate,
  CustomerSegment,
  CustomerSegmentCreate,
  CustomerSegmentListParams,
  CustomerSegmentListResponse,
  CustomerSegmentUpdate,
  CustomerType,
  CustomerTypeCreate,
  CustomerTypeListParams,
  CustomerTypeListResponse,
  CustomerTypeUpdate,
  Region,
  RegionCreate,
  RegionCrmImportRequest,
  RegionCrmImportResponse,
  RegionListParams,
  RegionListResponse,
  RegionReferenceImportResponse,
  RegionTreeNode,
  RegionUpdate,
  SalesChannel,
  SalesChannelCreate,
  SalesChannelListParams,
  SalesChannelListResponse,
  SalesChannelUpdate,
  SegmentEvaluateRequest,
  SegmentEvaluateResponse,
} from "@/lib/types/CommercialContext";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

/** Every DELETE in this module archives; the id and its new status come back. */
export interface CommercialArchiveResponse {
  id: string;
  status: "archived";
  archived: boolean;
}

// ── Customer types ────────────────────────────────────────────────────────

export async function fetchCustomerTypes(
  token: string,
  params: CustomerTypeListParams = {}
): Promise<CustomerTypeListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-types${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<CustomerTypeListResponse>(res, "Failed to load customer types");
  return json.data;
}

export async function fetchCustomerType(token: string, id: string): Promise<CustomerType> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-types/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<CustomerType>(res, "Failed to load customer type");
  return json.data;
}

export async function createCustomerType(
  token: string,
  data: CustomerTypeCreate
): Promise<CustomerType> {
  const res = await fetchWithTimeout(getFullUrl("/customer-types"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<CustomerType>(res, "Failed to create customer type");
  return json.data;
}

export async function updateCustomerType(
  token: string,
  id: string,
  data: CustomerTypeUpdate
): Promise<CustomerType> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-types/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<CustomerType>(res, "Failed to update customer type");
  return json.data;
}

/** Archive, idempotent, 200. Refused (400) while the type is the default. */
export async function archiveCustomerType(
  token: string,
  id: string
): Promise<CommercialArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-types/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<CommercialArchiveResponse>(res, "Failed to archive customer type");
  return json.data;
}

// ── Customer segments ─────────────────────────────────────────────────────

export async function fetchCustomerSegments(
  token: string,
  params: CustomerSegmentListParams = {}
): Promise<CustomerSegmentListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-segments${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<CustomerSegmentListResponse>(res, "Failed to load segments");
  return json.data;
}

export async function fetchCustomerSegment(token: string, id: string): Promise<CustomerSegment> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-segments/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<CustomerSegment>(res, "Failed to load segment");
  return json.data;
}

export async function createCustomerSegment(
  token: string,
  data: CustomerSegmentCreate
): Promise<CustomerSegment> {
  const res = await fetchWithTimeout(getFullUrl("/customer-segments"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<CustomerSegment>(res, "Failed to create segment");
  return json.data;
}

export async function updateCustomerSegment(
  token: string,
  id: string,
  data: CustomerSegmentUpdate
): Promise<CustomerSegment> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-segments/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<CustomerSegment>(res, "Failed to update segment");
  return json.data;
}

export async function archiveCustomerSegment(
  token: string,
  id: string
): Promise<CommercialArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/customer-segments/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<CommercialArchiveResponse>(res, "Failed to archive segment");
  return json.data;
}

/**
 * The explainer: which segments a contact (or a lead's contact) matches right
 * now, and which one a quotation would store. `winning_segment_id` is the
 * highest-priority MATCHING segment, which may differ from the segment whose
 * price list won a line (spec A11). Nothing is written and nothing is cached
 * server-side - membership is never persisted (spec A12).
 */
export async function evaluateSegments(
  token: string,
  data: SegmentEvaluateRequest
): Promise<SegmentEvaluateResponse> {
  const res = await fetchWithTimeout(getFullUrl("/customer-segments/evaluate"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<SegmentEvaluateResponse>(res, "Failed to evaluate segments");
  return json.data;
}

// ── Sales channels ────────────────────────────────────────────────────────

export async function fetchSalesChannels(
  token: string,
  params: SalesChannelListParams = {}
): Promise<SalesChannelListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/sales-channels${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<SalesChannelListResponse>(res, "Failed to load sales channels");
  return json.data;
}

export async function fetchSalesChannel(token: string, id: string): Promise<SalesChannel> {
  const res = await fetchWithTimeout(getFullUrl(`/sales-channels/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<SalesChannel>(res, "Failed to load sales channel");
  return json.data;
}

export async function createSalesChannel(
  token: string,
  data: SalesChannelCreate
): Promise<SalesChannel> {
  const res = await fetchWithTimeout(getFullUrl("/sales-channels"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<SalesChannel>(res, "Failed to create sales channel");
  return json.data;
}

export async function updateSalesChannel(
  token: string,
  id: string,
  data: SalesChannelUpdate
): Promise<SalesChannel> {
  const res = await fetchWithTimeout(getFullUrl(`/sales-channels/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<SalesChannel>(res, "Failed to update sales channel");
  return json.data;
}

export async function archiveSalesChannel(
  token: string,
  id: string
): Promise<CommercialArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/sales-channels/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<CommercialArchiveResponse>(res, "Failed to archive sales channel");
  return json.data;
}

// ── Regions ───────────────────────────────────────────────────────────────

export async function fetchRegions(
  token: string,
  params: RegionListParams = {}
): Promise<RegionListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/regions${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<RegionListResponse>(res, "Failed to load regions");
  return json.data;
}

/**
 * The whole tenant's active tree in ONE query - the parent picker's source.
 *
 * `GET /regions/tree` answers `ResponseModel[RegionTreeResponse]`, so the body
 * is `{success, data: {items: [...]}}` - the same `{items}` envelope every
 * other list endpoint here uses. `handleResponse` returns the WHOLE envelope,
 * so `json.data` is the `{items}` object and `items` has to be unwrapped
 * before this ever reaches `flattenTree`/`findNode`/`descendantIds`, whose
 * `for...of` throws "is not iterable" on a plain object and would take the
 * whole contacts list page down. Mirrors `fetchProductCategoryTree`.
 */
export async function fetchRegionTree(token: string): Promise<RegionTreeNode[]> {
  const res = await fetchWithTimeout(getFullUrl("/regions/tree"), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<{ items: RegionTreeNode[] }>(
    res,
    "Failed to load region tree"
  );
  return Array.isArray(json.data?.items) ? json.data.items : [];
}

export async function fetchRegion(token: string, id: string): Promise<Region> {
  const res = await fetchWithTimeout(getFullUrl(`/regions/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<Region>(res, "Failed to load region");
  return json.data;
}

export async function createRegion(token: string, data: RegionCreate): Promise<Region> {
  const res = await fetchWithTimeout(getFullUrl("/regions"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<Region>(res, "Failed to create region");
  return json.data;
}

export async function updateRegion(token: string, id: string, data: RegionUpdate): Promise<Region> {
  const res = await fetchWithTimeout(getFullUrl(`/regions/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<Region>(res, "Failed to update region");
  return json.data;
}

export async function archiveRegion(token: string, id: string): Promise<CommercialArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/regions/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<CommercialArchiveResponse>(res, "Failed to archive region");
  return json.data;
}

/**
 * Installs the shipped reference dataset - 1 country + 38 provinces with ISO
 * 3166-2:ID codes - idempotently BY CODE. Running it twice creates nothing the
 * second time (`created: 0`). Only the province tier ships; kabupaten and
 * kecamatan matching works against regions the tenant creates (spec E6.3).
 */
export async function importReferenceRegions(
  token: string
): Promise<RegionReferenceImportResponse> {
  const res = await fetchWithTimeout(getFullUrl("/regions/import-reference"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({}),
  });
  const json = await handleResponse<RegionReferenceImportResponse>(
    res,
    "Failed to import reference regions"
  );
  return json.data;
}

/**
 * Matches `crm_companies.location` / `kabupaten` / `kecamatan` against the
 * regions THIS TENANT has and stamps `crm_companies.region_id` on exact
 * (normalised, case-insensitive) matches.
 *
 * It NEVER creates a region. With `dry_run: true` the server returns the
 * IDENTICAL report while writing nothing - that is the dialog's preview, and
 * the unmatched list with its row counts is how a tenant learns exactly which
 * regions to add first (spec A19, E6.3).
 */
export async function importRegionsFromCrm(
  token: string,
  data: RegionCrmImportRequest = {}
): Promise<RegionCrmImportResponse> {
  const res = await fetchWithTimeout(getFullUrl("/regions/import-from-crm"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<RegionCrmImportResponse>(res, "Failed to match regions from CRM");
  return json.data;
}

// ── Saved CRM company: the commercial card's write path ───────────────────

/**
 * PATCH /company-intelligence/my-target-companies/{id}/commercial
 * (permission `companies`, body `extra="forbid"`).
 *
 * This is the ONLY write path in the product for a saved CRM company's
 * `customer_type_id` / `region_id` and for the five columns the quotation PDF
 * prints (`npwp`, `address_line`, `kecamatan`, `kabupaten`, `postal_code`) -
 * before Phase 3 the only mutating route on a saved company was the
 * single-key custom-fields PATCH (spec F).
 *
 * The five address columns are FILL-IF-BLANK on the intelligence cache path
 * from here on (spec E8), so a value typed through this endpoint survives a
 * re-save of the company from its cache.
 */
export async function updateCrmCompanyCommercial(
  token: string,
  crmCompanyId: string,
  data: CrmCompanyCommercialUpdate
): Promise<Record<string, unknown>> {
  const res = await fetchWithTimeout(
    getFullUrl(`/company-intelligence/my-target-companies/${crmCompanyId}/commercial`),
    { method: "PATCH", headers: jsonHeaders(token), body: JSON.stringify(data) }
  );
  const json = await handleResponse<Record<string, unknown>>(
    res,
    "Failed to update company commercial details"
  );
  return json.data;
}
