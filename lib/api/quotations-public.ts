// lib/api/quotations-public.ts
//
// Public quotation acceptance API client (route: /q/[code]). These endpoints
// are PUBLIC and UNAUTHENTICATED - the opaque 22-character `public_code` in the
// path is the SOLE authority, so NO Authorization header is ever attached.
// Modelled on lib/api/csat-public.ts, deliberately NOT on lib/utils/axiosClient
// (which attaches the tenant user's token and would make a customer's page
// depend on a session it does not have).
//
// Base: ${NEXT_PUBLIC_API_URL}/public/quotations/{code}
//   GET  /public/quotations/{code}          -> the minimal customer view
//   POST /public/quotations/{code}/accept   -> record the acceptance (single-use)
//
// The API answers a bad code and an expired one with the SAME flat 404 (spec
// A30: no existence oracle), and a second acceptance with 409. Both statuses
// are carried on the thrown error so the page can separate "this link is dead"
// from "this was already decided" without ever learning whether the tenant
// exists.
//
// NOTE ON `NEXT_PUBLIC_API_URL`: this client calls the API host directly and
// normally bypasses /api/proxy, which is what keeps `accepted_ip` a real
// visitor address (spec A31 / I8) rather than the Vercel egress IP.

import { fetchWithTimeout } from "./api-client";
import { logger } from "../utils/logger";

// ---- Types -------------------------------------------------------------------

/**
 * One printed line. This is the WHOLE line the customer sees: no product row,
 * no price list, no `unit_price`, no `cost_snapshot`, no internal ids (spec
 * D4). Reusing the authenticated QuotationResponse here would hand the full
 * lead and every line's live catalogue row to anyone holding the link.
 */
export interface PublicQuotationLine {
  name_snapshot: string;
  unit_label_snapshot?: string | null;
  /** Decimal-as-string, like every money and quantity value in this app. */
  quantity: string;
  line_total: string;
  /**
   * COMMERCIAL Phase 5 (spec D7). The acceptance page is a CUSTOMER-FACING
   * DOCUMENT and must be able to say what it charged, in what money, and WHAT
   * WAS IN THE BOX. All three optional, so a leg that predates the phase
   * answers without them.
   *
   * `bundle_components` carries no money, mirroring the stored snapshot: a
   * bundle is priced as one line (A5).
   */
  bundle_components?: PublicQuotationBundleComponent[] | null;
  unit_label?: string | null;
  promo_code_snapshot?: string | null;
}

/** Mirrors `QuotationBundleComponent` (D6): names, quantities, units, NO money. */
export interface PublicQuotationBundleComponent {
  product_id?: string | null;
  product_name: string;
  sku?: string | null;
  quantity: string;
  unit_label?: string | null;
}

export interface PublicQuotation {
  company_display_name: string;
  quotation_number: string;
  quotation_title?: string | null;
  expire_date?: string | null;
  currency: string;
  /**
   * COMMERCIAL Phase 5 (spec I10). The COMPANY's own currency - what the
   * exchange rate converts INTO. The page needs it to name the money on the
   * right of "Kurs 1 USD = Rp 16.250" and to print the same IDR equivalents
   * the PDF prints; without it the two documents one customer holds for one
   * quotation say different things. Optional so a leg that predates the field
   * still renders (the page falls back to the quotation's own currency and
   * simply prints no equivalents).
   */
  base_currency?: string | null;
  prices_include_tax: boolean;
  /** Canonical status value only - the label is decided on the client. */
  status: string;
  lines: PublicQuotationLine[];
  subtotal: string;
  discount_total: string;
  taxable_amount: string;
  tax_rate: string;
  tax_total: string;
  grand_total: string;
  pdf_url?: string | null;
  accepted_at?: string | null;
  accepted_by_name?: string | null;
  /**
   * COMMERCIAL Phase 5 (spec D7 / A16 / A26), beside the `currency` this
   * response has always carried and the page has always IGNORED - which is the
   * defect: a USD quotation printed rupiah symbols on the customer's own
   * acceptance page.
   *
   * `exchange_rate_used` is company-currency per ONE unit of `currency`;
   * `promo_discount_total` is ALREADY inside `subtotal` and is printed as a
   * caption, never as a third minus row (A26).
   */
  exchange_rate_used?: string | null;
  exchange_rate_date?: string | null;
  promo_discount_total?: string | null;
}

export interface PublicQuotationAcceptRequest {
  /** Hard cap of 120, checked by the API BEFORE any Redis or DB work. */
  name: string;
}

export interface PublicQuotationAcceptResponse {
  accepted: boolean;
  accepted_at: string;
  quotation_number: string;
}

/** The name cap the API enforces; mirrored so the input can stop at it. */
export const PUBLIC_ACCEPT_NAME_MAX = 120;

/**
 * Thrown by every helper on a non-2xx. `.status` is what lets the page tell
 * 404 (dead or unknown link) from 409 (already decided) from 429 (rate
 * limited) from a transient failure.
 */
export class QuotationPublicApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "QuotationPublicApiError";
    this.status = status;
  }
}

// ---- Helpers -----------------------------------------------------------------

function baseUrl(code: string): string {
  const root = process.env.NEXT_PUBLIC_API_URL;
  if (!root) {
    throw new QuotationPublicApiError("NEXT_PUBLIC_API_URL is not defined", 0);
  }
  return `${root}/public/quotations/${encodeURIComponent(code)}`;
}

/**
 * The customer-facing acceptance link for a code, on THIS origin.
 *
 * The server builds the same string from `CLIENT_BASE_URL` and returns it as
 * `acceptance_url`; that value always wins when present. This is the fallback
 * for a row that carries only `public_code` (an older leg, or a response that
 * predates the field), and the one place the `/q/` prefix is written down on
 * the client so a route rename cannot leave two spellings behind.
 */
export function publicQuotationUrl(code: string | null | undefined): string | null {
  if (!code) return null;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/q/${encodeURIComponent(code)}`;
}

async function readEnvelope(res: Response, fallback: string): Promise<any> {
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || fallback;
    throw new QuotationPublicApiError(String(message), res.status);
  }
  return json?.data ?? json;
}

// ---- Endpoints ---------------------------------------------------------------

/**
 * Public GET: NO auth header. Returns the quotation for ANY existing code -
 * including one already accepted or rejected - so the page can render
 * "already decided" rather than a dead end (spec E7.2).
 */
export async function getPublicQuotation(code: string): Promise<PublicQuotation> {
  const res = await fetchWithTimeout(baseUrl(code), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  // Logged WITHOUT the code: it is the sole credential for this quotation.
  if (!res.ok) logger.error(`Public quotation GET error: ${res.status}`, { status: res.status });
  return (await readEnvelope(res, "Quotation not available")) as PublicQuotation;
}

/**
 * Public POST: NO auth header. Single-use, enforced by an atomic conditional
 * UPDATE in the database (E7.3) - NOT by the rate limiter, which fails open by
 * design - so a second accept is a 409 and never a second write.
 */
export async function acceptPublicQuotation(
  code: string,
  body: PublicQuotationAcceptRequest
): Promise<PublicQuotationAcceptResponse> {
  const res = await fetchWithTimeout(`${baseUrl(code)}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name: body.name.slice(0, PUBLIC_ACCEPT_NAME_MAX) }),
  });
  return (await readEnvelope(res, "Failed to accept quotation")) as PublicQuotationAcceptResponse;
}
