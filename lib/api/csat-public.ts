// lib/api/csat-public.ts
//
// Public CSAT (customer satisfaction) survey API client. These endpoints are
// PUBLIC and UNAUTHENTICATED - the opaque per-survey `token` in the path is the
// sole authority, so NO Authorization header is ever attached (mirrors
// lib/api/help-center-public.ts). Responses use the standard
// `{ success, data, error }` envelope; every helper unwraps `.data`.
//
// Base: ${NEXT_PUBLIC_API_URL}/public/csat/{token}
//   GET  /public/csat/{token}   -> survey state (no PII beyond what's needed)
//   POST /public/csat/{token}   -> record a rating (single-use)
//
// An invalid / expired token returns 404 or 410 from the API; a re-submission of
// an already-answered survey returns 409. We surface the HTTP status on the
// thrown error so the UI can render a neutral "no longer valid" (404/410) or an
// "already responded" (409) state WITHOUT leaking whether the tenant exists.

import { fetchWithTimeout } from "./api-client";
import { logger } from "../utils/logger";

// ---- Types -------------------------------------------------------------------

export type CsatStatus = "pending" | "sent" | "answered" | "expired";

export interface CsatSurvey {
  status: CsatStatus;
  scale: number; // always 5 for now
  already_answered: boolean;
  company_display_name: string;
  agent_name: string | null;
}

export interface CsatSubmitRequest {
  rating: number; // 1..5
  reason_code?: string;
  comment?: string;
}

// Error thrown by every helper on a non-2xx response. `.status` lets the UI tell
// a 404/410 (link no longer valid) and a 409 (already answered) apart from a
// transient failure.
export class CsatApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CsatApiError";
    this.status = status;
  }
}

// ---- Helpers -----------------------------------------------------------------

function baseUrl(token: string): string {
  const root = process.env.NEXT_PUBLIC_API_URL;
  if (!root) {
    throw new CsatApiError("NEXT_PUBLIC_API_URL is not defined", 0);
  }
  return `${root}/public/csat/${encodeURIComponent(token)}`;
}

// ---- Endpoints ---------------------------------------------------------------

// Public GET: NO auth header. Unwraps the `.data` envelope; throws CsatApiError
// (carrying the HTTP status) on any non-2xx so the caller can special-case
// 404/410 (invalid/expired) without leaking tenant existence.
export async function getCsatSurvey(token: string): Promise<CsatSurvey> {
  const res = await fetchWithTimeout(baseUrl(token), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || "Survey not available";
    logger.error(`CSAT public GET error: ${res.status}`, { status: res.status });
    throw new CsatApiError(String(message), res.status);
  }
  return (json?.data ?? json) as CsatSurvey;
}

// Public POST: NO auth header. Records the rating. Single-use on the backend:
// 409 if already answered, 410/404 if the token is expired/invalid.
export async function submitCsatSurvey(
  token: string,
  body: CsatSubmitRequest
): Promise<{ ok: true }> {
  const res = await fetchWithTimeout(baseUrl(token), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || "Failed to submit response";
    throw new CsatApiError(String(message), res.status);
  }
  return (json?.data ?? { ok: true }) as { ok: true };
}
