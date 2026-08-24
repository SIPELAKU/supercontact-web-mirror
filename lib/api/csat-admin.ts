// lib/api/csat-admin.ts
//
// CSAT ADMIN API client (authed). Lets a tenant admin enable/disable CSAT
// surveys, set the per-subject cooldown, and read recent responses. Gated
// server-side by `support:csat:manage` (config write) and `support:csat:view`
// (responses read). Mirrors lib/api/help-center-admin.ts (Bearer token,
// `.data` envelope unwrap, status-carrying error).
//
// Base: /support/csat
//   GET /support/csat/config     -> current config
//   PUT /support/csat/config     -> updated config      (support:csat:manage)
//   GET /support/csat/responses  -> recent responses    (support:csat:view)

import { fetchWithTimeout } from "./api-client";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/support/csat`;

const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
});

// ---- Types -------------------------------------------------------------------

export interface CsatConfig {
  csat_enabled: boolean;
  csat_cooldown_days: number;
}

export type CsatConfigUpdate = CsatConfig;

export interface CsatResponse {
  id: string;
  rating: number;
  reason_code: string | null;
  comment: string | null;
  agent_id: string | null;
  agent_name: string | null;
  subject_type: string;
  subject_id: string;
  channel_type: string | null;
  answered_at: string;
}

export interface CsatResponsesPage {
  items: CsatResponse[];
  count: number;
  avg_rating: number;
}

export class CsatAdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CsatAdminError";
    this.status = status;
  }
}

// ---- Helpers -----------------------------------------------------------------

async function handle<T>(res: Response, failMessage: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new CsatAdminError("UNAUTHORIZED", 401);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || failMessage;
    throw new CsatAdminError(String(message), res.status);
  }
  return (json?.data ?? json) as T;
}

// ---- Endpoints ---------------------------------------------------------------

export async function fetchCsatConfig(token: string): Promise<CsatConfig> {
  const res = await fetchWithTimeout(`${API_BASE}/config`, {
    headers: jsonHeaders(token),
  });
  return handle<CsatConfig>(res, "Failed to load CSAT config");
}

export async function updateCsatConfig(
  token: string,
  body: CsatConfigUpdate
): Promise<CsatConfig> {
  const res = await fetchWithTimeout(`${API_BASE}/config`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  return handle<CsatConfig>(res, "Failed to save CSAT config");
}

export async function fetchCsatResponses(
  token: string,
  params: { limit?: number; offset?: number } = {}
): Promise<CsatResponsesPage> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetchWithTimeout(`${API_BASE}/responses${suffix}`, {
    headers: jsonHeaders(token),
  });
  return handle<CsatResponsesPage>(res, "Failed to load CSAT responses");
}
