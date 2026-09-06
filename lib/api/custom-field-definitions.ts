// lib/api/custom-field-definitions.ts
// Generic custom-field definitions (Phase 1, spec F). Paginated - unlike the
// ticket module's `{data:[...]}` wrapper, which is untouched.

import type {
  CustomFieldDefinition,
  CustomFieldDefinitionCreate,
  CustomFieldDefinitionListParams,
  CustomFieldDefinitionListResponse,
  CustomFieldDefinitionUpdate,
  DeleteCustomFieldDefinitionResponse,
} from "@/lib/types/CustomFieldDefinition";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

/** The endpoint's `limit` ceiling == MAX_ACTIVE_DEFINITIONS_PER_ENTITY. */
export const CUSTOM_FIELD_DEFINITIONS_MAX_LIMIT = 100;

export async function fetchCustomFieldDefinitions(
  token: string,
  params: CustomFieldDefinitionListParams = {}
): Promise<CustomFieldDefinitionListResponse> {
  const limit =
    typeof params.limit === "number"
      ? Math.min(Math.max(1, params.limit), CUSTOM_FIELD_DEFINITIONS_MAX_LIMIT)
      : undefined;
  const res = await fetchWithTimeout(
    getFullUrl(`/custom-field-definitions${buildQuery({ ...params, limit })}`),
    { headers: authHeaders(token) }
  );
  const json = await handleResponse<CustomFieldDefinitionListResponse>(
    res,
    "Failed to load custom field definitions"
  );
  return json.data;
}

export async function createCustomFieldDefinition(
  token: string,
  data: CustomFieldDefinitionCreate
): Promise<CustomFieldDefinition> {
  const res = await fetchWithTimeout(getFullUrl("/custom-field-definitions"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<CustomFieldDefinition>(res, "Failed to create custom field");
  return json.data;
}

export async function updateCustomFieldDefinition(
  token: string,
  id: string,
  data: CustomFieldDefinitionUpdate
): Promise<CustomFieldDefinition> {
  const res = await fetchWithTimeout(getFullUrl(`/custom-field-definitions/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<CustomFieldDefinition>(res, "Failed to update custom field");
  return json.data;
}

/** Soft delete (`is_active=false`, idempotent). Stored values keep the key. */
export async function deleteCustomFieldDefinition(
  token: string,
  id: string
): Promise<DeleteCustomFieldDefinitionResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/custom-field-definitions/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<DeleteCustomFieldDefinitionResponse>(res, "Failed to delete custom field");
  return json.data;
}
