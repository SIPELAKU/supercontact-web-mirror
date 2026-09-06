// lib/api/discount-policies.ts
//
// Discount policy CRUD (Phase 4, spec D2 / F4) for the Settings > Sales >
// Kebijakan Diskon manager. Built on lib/api/catalog-http.ts like the Phase
// 1/2/3 managers - `fetchWithTimeout`, `getFullUrl`, `authHeaders`,
// `handleResponse` - so a refusal arrives carrying `code`, `details` and
// `status`, and `extractFieldErrors` can place it under the right control.
//
// Permissions, as the router declares them (spec F4):
//   READ   = `sales:config:manage` | `quotations`
//   MANAGE = `sales:config:manage`
//
// THE COMPANY-SCOPED ROW IS A FIXTURE, NOT A CRUD ROW (spec A10). It is
// created only by the server's `ensure_company_default`, it is edited through
// PUT, its `is_active` is forced true, it can never be archived, and DELETE on
// it is a 400. `POST` with `applies_to: "company"` answers `409
// POLICY_COMPANY_ROW_EXISTS` when one already exists. This is not UI
// squeamishness: `uq_discount_policies_company_default` is
// `UNIQUE(company_id) WHERE applies_to='company'` with NO `is_active`
// predicate, so archiving that row is a one-way door that 500s the next
// `ensure_company_default`.

import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

// ---- Types (mirroring spec D2) -----------------------------------------------

/** Most specific wins: `user` > `role` > `company` (spec A26 / E2.2). */
export type DiscountPolicyScope = "company" | "role" | "user";

export interface DiscountPolicy {
  id: string;
  applies_to: DiscountPolicyScope;
  /** NULL for the company row; a role id or a user id otherwise. */
  target_id?: string | null;
  /** Resolved at response time - a role_name or a user's fullname. */
  target_name?: string | null;
  /** "Perusahaan" | "Peran: Manager" | "Pengguna: Budi". */
  effective_scope_label: string;
  /** Decimal-as-string. A refusal band: above this the save is a hard 400. */
  max_discount_percent: string;
  /** Every limit below is NULLABLE, and NULL means NO LIMIT - which is what
   *  keeps the 22 seeded 25.00 company rows behaving exactly as they do
   *  today. Never default one of these to 0 in a form. */
  max_discount_amount?: string | null;
  min_margin_percent?: string | null;
  /** The APPROVAL band: above this and still within max_discount_percent, the
   *  publish is routed to `pending_approval` instead of being refused (A1). */
  approval_above_percent?: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountPolicyListResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  policies: DiscountPolicy[];
}

/**
 * The REAL contract of `GET /discount-policies` (spec F4), not a hopeful one.
 * `buildQuery` emits every non-empty value, and FastAPI silently DISCARDS a
 * query parameter the route does not declare - so a key that only exists here
 * is a control that quietly does nothing. `include_inactive` was exactly that:
 * the endpoint takes `is_active`, and with it unset the repository applies no
 * predicate at all, so archived policies were listed whatever the toggle said.
 */
export interface DiscountPolicyListParams {
  page?: number;
  limit?: number;
  /** Matches the ROLE or USER a policy targets, by name. The company-scoped
   *  baseline row has no target and therefore never matches. */
  search?: string;
  applies_to?: DiscountPolicyScope;
  /** Tri-state on purpose: `true` = only live, `false` = only archived,
   *  omitted = both. The screen's "Tampilkan yang diarsipkan" toggle sends
   *  `true` when it is OFF and omits the key when it is ON. */
  is_active?: boolean;
  /** `applies_to` | `priority` | `max_discount_percent` | `is_active` |
   *  `created_at`. Omitted keeps the RESOLUTION order (user > role > company,
   *  then priority, then newest), which is the list's whole point. */
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/** `applies_to: "company"` is refused by the API (A10); the form never offers
 *  it as a create option, and the type keeps that decision visible. */
export interface DiscountPolicyCreate {
  applies_to: Exclude<DiscountPolicyScope, "company">;
  target_id: string;
  max_discount_percent: number;
  max_discount_amount?: number | null;
  min_margin_percent?: number | null;
  approval_above_percent?: number | null;
  priority?: number;
  is_active?: boolean;
}

/** `applies_to` and `target_id` are IMMUTABLE - moving a policy between scopes
 *  would silently re-target every quotation it governs. */
export interface DiscountPolicyUpdate {
  max_discount_percent?: number;
  max_discount_amount?: number | null;
  min_margin_percent?: number | null;
  approval_above_percent?: number | null;
  priority?: number;
  is_active?: boolean;
}

// ---- Endpoints ---------------------------------------------------------------

export async function fetchDiscountPolicies(
  token: string,
  params: DiscountPolicyListParams = {}
): Promise<DiscountPolicyListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/discount-policies${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<DiscountPolicyListResponse>(
    res,
    "Failed to load discount policies"
  );
  return json.data;
}

export async function fetchDiscountPolicy(token: string, id: string): Promise<DiscountPolicy> {
  const res = await fetchWithTimeout(getFullUrl(`/discount-policies/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<DiscountPolicy>(res, "Failed to load discount policy");
  return json.data;
}

export async function createDiscountPolicy(
  token: string,
  data: DiscountPolicyCreate
): Promise<DiscountPolicy> {
  const res = await fetchWithTimeout(getFullUrl("/discount-policies"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<DiscountPolicy>(res, "Failed to create discount policy");
  return json.data;
}

export async function updateDiscountPolicy(
  token: string,
  id: string,
  data: DiscountPolicyUpdate
): Promise<DiscountPolicy> {
  const res = await fetchWithTimeout(getFullUrl(`/discount-policies/${id}`), {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<DiscountPolicy>(res, "Failed to update discount policy");
  return json.data;
}

/**
 * ARCHIVES (`is_active = false`); nothing is physically deleted (A24).
 * A 400 here is the company-scoped row refusing to be archived (A10) - the
 * message the API returns says so and is shown verbatim.
 */
export async function archiveDiscountPolicy(
  token: string,
  id: string
): Promise<{ id: string; is_active: boolean }> {
  const res = await fetchWithTimeout(getFullUrl(`/discount-policies/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<{ id: string; is_active: boolean }>(
    res,
    "Failed to archive discount policy"
  );
  return json.data;
}
