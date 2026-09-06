// lib/api/exchange-rates.ts
//
// Exchange rates (COMMERCIAL Phase 5, spec D5 / F3) for the Settings > Sales >
// Kurs manager and the quotation form's currency picker.
//
// Same shape as `lib/api/price-lists.ts`: catalog-http helpers, the same error
// envelope, no axios and no `/api/proxy`.
//
// Permissions, as the router declares them (spec F3):
//   READ   = `products` | `quotations` | `sales:config:manage`
//   MANAGE = `sales:config:manage`
//
// READ includes `quotations` for one specific reason: the quotation form's
// currency picker is fed by `GET /exchange-rates/currencies`, so a currency
// with no rate is never offered and the A25 "no rate in force" refusal never
// reaches a seller as a save error.
//
// DIRECTION (A16): `rate` is company-currency per ONE unit of `currency`.
// Converting a company price INTO the quotation currency DIVIDES by it.
//
// A rate is genuinely DELETED (A27) - the one Phase 5 object that is. A rate
// typed on the wrong date is a typo, not history, and no quotation references
// the row: a quotation snapshots the NUMBER.

import type {
  ExchangeRate,
  ExchangeRateCreate,
  ExchangeRateCurrenciesResponse,
  ExchangeRateDeleteResponse,
  ExchangeRateListParams,
  ExchangeRateListResponse,
  ExchangeRateUpdate,
} from "@/lib/types/ExchangeRate";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

export async function fetchExchangeRates(
  token: string,
  params: ExchangeRateListParams = {}
): Promise<ExchangeRateListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/exchange-rates${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<any>(res, "Gagal memuat kurs");
  const data = json.data ?? {};
  const rows = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.rates)
      ? data.rates
      : [];
  return {
    total: typeof data.total === "number" ? data.total : null,
    items: rows as ExchangeRate[],
    // Never defaulted to "IDR" silently: the sentence "1 USD = Rp ..." is built
    // from THIS field, and inventing a base currency would print a wrong
    // sentence on the one screen whose job is making the direction unambiguous.
    base_currency: typeof data.base_currency === "string" ? data.base_currency : "",
  };
}

export async function createExchangeRate(
  token: string,
  data: ExchangeRateCreate
): Promise<ExchangeRate> {
  const res = await fetchWithTimeout(getFullUrl("/exchange-rates"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ExchangeRate>(res, "Gagal menyimpan kurs");
  return json.data;
}

/** `currency` and `valid_from` are the identity and are not updatable (A27). */
export async function updateExchangeRate(
  token: string,
  id: string,
  data: ExchangeRateUpdate
): Promise<ExchangeRate> {
  const res = await fetchWithTimeout(getFullUrl(`/exchange-rates/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ExchangeRate>(res, "Gagal mengubah kurs");
  return json.data;
}

/** A REAL delete - the one Phase 5 object that is not archived (A27). */
export async function deleteExchangeRate(
  token: string,
  id: string
): Promise<ExchangeRateDeleteResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/exchange-rates/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<ExchangeRateDeleteResponse>(res, "Gagal menghapus kurs");
  return json.data;
}

/**
 * What the quotation form's currency picker offers: the company's own currency
 * plus every currency this tenant actually holds a rate for.
 *
 * Declared as a STATIC segment before `/{rate_id}` server-side.
 */
export async function fetchExchangeRateCurrencies(
  token: string
): Promise<ExchangeRateCurrenciesResponse> {
  const res = await fetchWithTimeout(getFullUrl("/exchange-rates/currencies"), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<any>(res, "Gagal memuat daftar mata uang");
  const data = json.data ?? {};
  return {
    base_currency: typeof data.base_currency === "string" ? data.base_currency : "",
    currencies: Array.isArray(data.currencies)
      ? data.currencies.filter((code: unknown): code is string => typeof code === "string")
      : [],
  };
}
