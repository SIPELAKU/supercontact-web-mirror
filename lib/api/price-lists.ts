// lib/api/price-lists.ts
//
// Price lists, prices and assignments (Phase 2, spec F). Built on
// `lib/api/catalog-http.ts` like the Phase 1 catalogue managers - no axios and
// no `/api/proxy`: the token is already in hand.
//
// Permissions, as the router declares them:
//   READ   = products | quotations | sales:config:manage   (lists + prices)
//   MANAGE = sales:config:manage                           (every write)
//   ASSIGN = sales:config:manage                           (assignments)
//
// DELETE on a list ARCHIVES it and DELETE on a price CLOSES the row; only an
// assignment is physically deleted (spec A22).

import type {
  AssignmentTargetSearchParams,
  AssignmentTargetSearchResponse,
  BulkPriceUpdateRequest,
  BulkPriceUpdateResponse,
  PriceList,
  PriceListArchiveResponse,
  PriceListAssignment,
  PriceListAssignmentCreate,
  PriceListAssignmentDeleteResponse,
  PriceListAssignmentListParams,
  PriceListAssignmentListResponse,
  PriceListAssignmentUpdate,
  PriceListCreate,
  PriceListListParams,
  PriceListListResponse,
  PriceListResolution,
  PriceListResolutionParams,
  PriceListUpdate,
  ProductPrice,
  ProductPriceCloseResponse,
  ProductPriceCreate,
  ProductPriceListParams,
  ProductPriceListResponse,
} from "@/lib/types/PriceList";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

// ── Lists ─────────────────────────────────────────────────────────────────

export async function fetchPriceLists(
  token: string,
  params: PriceListListParams = {}
): Promise<PriceListListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<PriceListListResponse>(res, "Failed to load price lists");
  return json.data;
}

export async function fetchPriceList(token: string, id: string): Promise<PriceList> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<PriceList>(res, "Failed to load price list");
  return json.data;
}

export async function createPriceList(token: string, data: PriceListCreate): Promise<PriceList> {
  const res = await fetchWithTimeout(getFullUrl("/price-lists"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<PriceList>(res, "Failed to create price list");
  return json.data;
}

export async function updatePriceList(
  token: string,
  id: string,
  data: PriceListUpdate
): Promise<PriceList> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<PriceList>(res, "Failed to update price list");
  return json.data;
}

/** DELETE = archive, idempotent. Refused (400) while the list is the default. */
export async function archivePriceList(
  token: string,
  id: string
): Promise<PriceListArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<PriceListArchiveResponse>(res, "Failed to archive price list");
  return json.data;
}

// ── Prices ────────────────────────────────────────────────────────────────

export async function fetchPriceListPrices(
  token: string,
  priceListId: string,
  params: ProductPriceListParams = {}
): Promise<ProductPriceListResponse> {
  const res = await fetchWithTimeout(
    getFullUrl(`/price-lists/${priceListId}/prices${buildQuery(params)}`),
    { headers: authHeaders(token) }
  );
  const json = await handleResponse<ProductPriceListResponse>(res, "Failed to load prices");
  return json.data;
}

/**
 * Close-then-insert: an existing OPEN row for the same
 * (product, unit, min_quantity) is closed and a NEW row is written. A price is
 * never updated in place (spec A5), so history survives - including a same-day
 * re-price, which leaves the superseded row as an empty window (spec A6).
 */
export async function addPriceListPrice(
  token: string,
  priceListId: string,
  data: ProductPriceCreate
): Promise<ProductPrice> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${priceListId}/prices`), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ProductPrice>(res, "Failed to add price");
  return json.data;
}

/** Closes the row (idempotent). Nothing is deleted; the row stays readable. */
export async function closePriceListPrice(
  token: string,
  priceListId: string,
  priceId: string
): Promise<ProductPriceCloseResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${priceListId}/prices/${priceId}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<ProductPriceCloseResponse>(res, "Failed to close price");
  return json.data;
}

/**
 * Percentage copy from another list. With `dry_run: true` the server computes
 * and reports the same `{closed, inserted, skipped, sample}` while writing
 * nothing - that is the dialog's preview, so the ROUNDING RULE EXISTS IN
 * EXACTLY ONE PLACE (spec S3-10). Never re-implement it here.
 */
export async function bulkUpdatePrices(
  token: string,
  priceListId: string,
  data: BulkPriceUpdateRequest
): Promise<BulkPriceUpdateResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${priceListId}/prices/bulk`), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<BulkPriceUpdateResponse>(res, "Failed to update prices");
  return json.data;
}

// ── Assignments ───────────────────────────────────────────────────────────

export async function fetchAssignments(
  token: string,
  priceListId: string,
  params: PriceListAssignmentListParams = {}
): Promise<PriceListAssignmentListResponse> {
  const res = await fetchWithTimeout(
    getFullUrl(`/price-lists/${priceListId}/assignments${buildQuery(params)}`),
    { headers: authHeaders(token) }
  );
  const json = await handleResponse<PriceListAssignmentListResponse>(
    res,
    "Failed to load assignments"
  );
  return json.data;
}

export async function createAssignment(
  token: string,
  priceListId: string,
  data: PriceListAssignmentCreate
): Promise<PriceListAssignment> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/${priceListId}/assignments`), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<PriceListAssignment>(res, "Failed to assign price list");
  return json.data;
}

export async function updateAssignment(
  token: string,
  priceListId: string,
  assignmentId: string,
  data: PriceListAssignmentUpdate
): Promise<PriceListAssignment> {
  const res = await fetchWithTimeout(
    getFullUrl(`/price-lists/${priceListId}/assignments/${assignmentId}`),
    { method: "PATCH", headers: jsonHeaders(token), body: JSON.stringify(data) }
  );
  const json = await handleResponse<PriceListAssignment>(res, "Failed to update assignment");
  return json.data;
}

/** The one physical delete in Phase 2: an assignment is a pointer, not history. */
export async function deleteAssignment(
  token: string,
  priceListId: string,
  assignmentId: string
): Promise<PriceListAssignmentDeleteResponse> {
  const res = await fetchWithTimeout(
    getFullUrl(`/price-lists/${priceListId}/assignments/${assignmentId}`),
    { method: "DELETE", headers: authHeaders(token) }
  );
  const json = await handleResponse<PriceListAssignmentDeleteResponse>(
    res,
    "Failed to remove assignment"
  );
  return json.data;
}

// ── Explainers / pickers ──────────────────────────────────────────────────

/** "Which list applies to this customer, and why" - the ordered candidates. */
export async function fetchPriceListsForCustomer(
  token: string,
  params: PriceListResolutionParams
): Promise<PriceListResolution> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/for-customer${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<PriceListResolution>(res, "Failed to resolve price list");
  return json.data;
}

/**
 * The assignment picker's ONLY source. Deliberately not `GET /contacts` or
 * `GET /company-intelligence/my-target-companies`: a role holding
 * `sales:config:manage` alone would get two pickers that 403 (S3-9b).
 */
export async function searchAssignmentTargets(
  token: string,
  params: AssignmentTargetSearchParams
): Promise<AssignmentTargetSearchResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/price-lists/targets/search${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<AssignmentTargetSearchResponse>(res, "Failed to search targets");
  return json.data;
}
