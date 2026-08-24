// lib/api/help-center-admin.ts
//
// Phase 7C Help Center ADMIN config API client (authed). Lets a tenant admin
// enable the public portal, claim a public slug, and set its branding. Gated
// server-side by the reused `knowledge:manage` permission. Mirrors the
// fetch-client style of lib/api/knowledge.ts (Bearer token, `.data` unwrap).
//
// Base: /help-center
//   GET /help-center/config  -> current config (defaults if never saved)
//   PUT /help-center/config  -> updated config; 409 on slug collision,
//                               4xx on reserved / invalid slug.

import { fetchWithTimeout } from "./api-client";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/help-center`;

const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
});

// ---- Types -------------------------------------------------------------------

export interface HelpCenterAdminConfig {
  is_enabled: boolean;
  public_slug: string | null;
  display_name: string;
  logo_url: string | null;
  brand_color: string | null;
  accent_color: string | null;
  welcome_headline: string | null;
  welcome_subtext: string | null;
  favicon_url: string | null;
  support_contact_url: string | null;
  default_locale: string;
}

// PUT accepts the same shape it returns.
export type HelpCenterConfigUpdate = HelpCenterAdminConfig;

// Carries the HTTP status so the settings form can surface a 409 (slug taken)
// or a 4xx (reserved / invalid slug) inline next to the slug field.
export class HelpCenterAdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HelpCenterAdminError";
    this.status = status;
  }
}

// ---- Helpers -----------------------------------------------------------------

async function handle<T>(res: Response, failMessage: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new HelpCenterAdminError("UNAUTHORIZED", 401);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || failMessage;
    throw new HelpCenterAdminError(String(message), res.status);
  }
  return (json?.data ?? json) as T;
}

// ---- Endpoints ---------------------------------------------------------------

export async function fetchHelpCenterAdminConfig(
  token: string
): Promise<HelpCenterAdminConfig> {
  const res = await fetchWithTimeout(`${API_BASE}/config`, {
    headers: jsonHeaders(token),
  });
  return handle<HelpCenterAdminConfig>(res, "Failed to load help center config");
}

export async function updateHelpCenterAdminConfig(
  token: string,
  body: HelpCenterConfigUpdate
): Promise<HelpCenterAdminConfig> {
  const res = await fetchWithTimeout(`${API_BASE}/config`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  return handle<HelpCenterAdminConfig>(res, "Failed to save help center config");
}
