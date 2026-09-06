// lib/api/units.ts
// Units (Phase 1, spec F): reads on `products`, `quotations` or
// `sales:config:manage` (the quotation form reads precision); writes on
// `sales:config:manage`. DELETE archives.

import type {
  Unit,
  UnitArchiveResponse,
  UnitCreate,
  UnitListParams,
  UnitListResponse,
  UnitUpdate,
} from "@/lib/types/Unit";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

export async function fetchUnits(token: string, params: UnitListParams = {}): Promise<UnitListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/units${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<UnitListResponse>(res, "Failed to load units");
  return json.data;
}

export async function createUnit(token: string, data: UnitCreate): Promise<Unit> {
  const res = await fetchWithTimeout(getFullUrl("/units"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<Unit>(res, "Failed to create unit");
  return json.data;
}

export async function updateUnit(token: string, id: string, data: UnitUpdate): Promise<Unit> {
  const res = await fetchWithTimeout(getFullUrl(`/units/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<Unit>(res, "Failed to update unit");
  return json.data;
}

/** DELETE archives (idempotent); stored quotation lines keep their label snapshot. */
export async function archiveUnit(token: string, id: string): Promise<UnitArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/units/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<UnitArchiveResponse>(res, "Failed to archive unit");
  return json.data;
}
