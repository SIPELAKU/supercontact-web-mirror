// lib/api/promotions.ts
//
// Promotions (COMMERCIAL Phase 5, spec D4 / F2) for the Settings > Sales >
// Promosi manager and the quotation form's preview drawer.
//
// Built on `lib/api/catalog-http.ts` like the Phase 1/2/3/4 managers -
// `fetchWithTimeout`, `getFullUrl`, `authHeaders`, `handleResponse` - so a
// refusal arrives carrying `code`, `details` and `status`, and
// `extractFieldErrors` can place it under the right control.
//
// Permissions, as the router declares them (spec F2):
//   READ   = `products` | `quotations` | `sales:config:manage`
//   MANAGE = `sales:config:manage`
//
// READ is the same trio `price_lists.py` uses, so a seller can read WHY a line
// was promoted without holding the config grant.
//
// The URL says `promotions`; the table says `discount_rules`. Both names are
// used on purpose - see lib/types/Promotion.ts.
//
// ARCHIVE, NEVER DELETE (A27): `POST /promotions/{id}/archive` sets
// `is_active = false`. A promotion that priced a stored quotation line is
// referenced by its snapshotted CODE, and deleting the row would leave that
// line unexplainable.

import type {
  DiscountRule,
  DiscountRuleCreate,
  DiscountRuleListParams,
  DiscountRuleListResponse,
  DiscountRulePreviewParams,
  DiscountRulePreviewResponse,
  DiscountRuleUpdate,
} from "@/lib/types/Promotion";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

/**
 * The list, with the response key normalised.
 *
 * The API answers `{ total, page, limit, total_pages, promotions: [...] }`.
 * A leg that spells the collection `rules` (the table's own name) would
 * otherwise render an empty screen with no error at all, which is the single
 * worst failure mode a settings list has - so both spellings are accepted and
 * the screen reads one field.
 */
export async function fetchPromotions(
  token: string,
  params: DiscountRuleListParams = {}
): Promise<DiscountRuleListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/promotions${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<any>(res, "Gagal memuat promosi");
  const data = json.data ?? {};
  const rows = Array.isArray(data.promotions)
    ? data.promotions
    : Array.isArray(data.rules)
      ? data.rules
      : Array.isArray(data.items)
        ? data.items
        : [];
  return {
    total: typeof data.total === "number" ? data.total : null,
    page: typeof data.page === "number" ? data.page : (params.page ?? 1),
    limit: typeof data.limit === "number" ? data.limit : (params.limit ?? 25),
    total_pages: typeof data.total_pages === "number" ? data.total_pages : null,
    promotions: rows as DiscountRule[],
  };
}

export async function fetchPromotion(token: string, id: string): Promise<DiscountRule> {
  const res = await fetchWithTimeout(getFullUrl(`/promotions/${id}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<DiscountRule>(res, "Gagal memuat promosi");
  return json.data;
}

export async function createPromotion(
  token: string,
  data: DiscountRuleCreate
): Promise<DiscountRule> {
  const res = await fetchWithTimeout(getFullUrl("/promotions"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<DiscountRule>(res, "Gagal menyimpan promosi");
  return json.data;
}

/** `code` is not in `DiscountRuleUpdate`: it is snapshotted onto stored lines. */
export async function updatePromotion(
  token: string,
  id: string,
  data: DiscountRuleUpdate
): Promise<DiscountRule> {
  const res = await fetchWithTimeout(getFullUrl(`/promotions/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<DiscountRule>(res, "Gagal mengubah promosi");
  return json.data;
}

/** ARCHIVES (`is_active = false`). Nothing here is ever physically deleted (A27). */
export async function archivePromotion(token: string, id: string): Promise<DiscountRule> {
  const res = await fetchWithTimeout(getFullUrl(`/promotions/${id}/archive`), {
    method: "POST",
    headers: authHeaders(token),
  });
  const json = await handleResponse<DiscountRule>(res, "Gagal mengarsipkan promosi");
  return json.data;
}

/** Un-archive: the same PATCH the discount-policies screen uses to restore. */
export async function restorePromotion(token: string, id: string): Promise<DiscountRule> {
  return updatePromotion(token, id, { is_active: true });
}

/**
 * `GET /promotions/preview` - which rules a product/quantity/date/channel would
 * actually get, THROUGH THE SAME CODE PATH THAT PRICES A QUOTE (spec I6). A
 * drawer that re-implemented the walk in the browser would be a second
 * implementation of A24's ordering and would drift on its first edit.
 *
 * The route is declared as a STATIC segment before `/{rule_id}` server-side.
 */
export async function previewPromotions(
  token: string,
  params: DiscountRulePreviewParams
): Promise<DiscountRulePreviewResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/promotions/preview${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<DiscountRulePreviewResponse>(
    res,
    "Gagal menghitung pratinjau promosi"
  );
  return json.data;
}
