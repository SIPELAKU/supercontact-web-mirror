// lib/api/help-center-public.ts
//
// Phase 7C Public Help Center portal API client. These endpoints are PUBLIC and
// UNAUTHENTICATED - the opaque `slug` in the path is the tenant authority, so NO
// Authorization header is ever attached (mirrors lib/api/smart-captures.ts's
// public form fetchers). Responses use the standard `{ success, data, error }`
// envelope; every helper unwraps `.data` before returning.
//
// Base: ${NEXT_PUBLIC_API_URL}/public/help/{slug}
//   GET  /config
//   GET  /categories
//   GET  /categories/{categorySlug}/sections
//   GET  /articles?section=
//   GET  /articles/{articleSlug}
//   GET  /search?q=
//   POST /articles/{articleSlug}/feedback   { helpful, comment? }
//
// A disabled or unknown portal (and a private / unpublished article) returns 404
// from the API. We surface that as an Error carrying `.status = 404` so the UI
// can render a clean "not found" state without leaking whether the tenant exists.

import { fetchWithTimeout } from "./api-client";
import { logger } from "../utils/logger";

// ---- Types -------------------------------------------------------------------

export interface HelpCenterPublicConfig {
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

export interface HelpCategory {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface HelpSection {
  slug: string;
  name: string;
  description: string | null;
}

export interface HelpArticleSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  category_slug: string | null;
  section_slug: string | null;
  locale: string;
  updated_at: string;
}

export interface HelpArticle {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category_slug: string | null;
  category_name: string | null;
  section_slug: string | null;
  section_name: string | null;
  locale: string;
  updated_at: string;
}

export interface HelpSearchHit {
  slug: string;
  title: string;
  excerpt: string | null;
  snippet: string;
}

export interface HelpFeedbackRequest {
  helpful: boolean;
  comment?: string;
}

// Error thrown by every helper on a non-2xx response. `.status` lets the UI tell
// a 404 (render a clean "not found") apart from a transient failure.
export class HelpApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HelpApiError";
    this.status = status;
  }
}

// ---- Helpers -----------------------------------------------------------------

function baseUrl(slug: string): string {
  const root = process.env.NEXT_PUBLIC_API_URL;
  if (!root) {
    throw new HelpApiError("NEXT_PUBLIC_API_URL is not defined", 0);
  }
  return `${root}/public/help/${encodeURIComponent(slug)}`;
}

// Public GET: NO auth header. Unwraps the `.data` envelope; throws HelpApiError
// (with the HTTP status) on any non-2xx so the caller can special-case 404.
async function publicGet<T>(url: string, failMessage: string): Promise<T> {
  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || failMessage;
    logger.error(`Help Center public API error: ${url}`, { status: res.status });
    throw new HelpApiError(String(message), res.status);
  }
  return (json?.data ?? json) as T;
}

async function publicGetList<T>(url: string, failMessage: string): Promise<T[]> {
  const data = await publicGet<T[] | null>(url, failMessage);
  return Array.isArray(data) ? data : [];
}

// ---- Endpoints ---------------------------------------------------------------

export function fetchHelpConfig(slug: string): Promise<HelpCenterPublicConfig> {
  return publicGet<HelpCenterPublicConfig>(
    `${baseUrl(slug)}/config`,
    "Help center not available"
  );
}

export function fetchHelpCategories(slug: string): Promise<HelpCategory[]> {
  return publicGetList<HelpCategory>(
    `${baseUrl(slug)}/categories`,
    "Failed to load categories"
  );
}

export function fetchHelpSections(
  slug: string,
  categorySlug: string
): Promise<HelpSection[]> {
  return publicGetList<HelpSection>(
    `${baseUrl(slug)}/categories/${encodeURIComponent(categorySlug)}/sections`,
    "Failed to load sections"
  );
}

export function fetchHelpArticles(
  slug: string,
  section?: string
): Promise<HelpArticleSummary[]> {
  const qs = section ? `?section=${encodeURIComponent(section)}` : "";
  return publicGetList<HelpArticleSummary>(
    `${baseUrl(slug)}/articles${qs}`,
    "Failed to load articles"
  );
}

export function fetchHelpArticle(
  slug: string,
  articleSlug: string
): Promise<HelpArticle> {
  return publicGet<HelpArticle>(
    `${baseUrl(slug)}/articles/${encodeURIComponent(articleSlug)}`,
    "Article not found"
  );
}

export function searchHelp(slug: string, q: string): Promise<HelpSearchHit[]> {
  return publicGetList<HelpSearchHit>(
    `${baseUrl(slug)}/search?q=${encodeURIComponent(q)}`,
    "Search failed"
  );
}

// Anonymous feedback POST (no auth). Backend tracks a visitor_identifier
// server-side; the client only sends the vote and an optional comment.
export async function postHelpFeedback(
  slug: string,
  articleSlug: string,
  body: HelpFeedbackRequest
): Promise<{ ok: true }> {
  const res = await fetchWithTimeout(
    `${baseUrl(slug)}/articles/${encodeURIComponent(articleSlug)}/feedback`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const message =
      json?.error?.message || json?.error || json?.message || "Failed to submit feedback";
    throw new HelpApiError(String(message), res.status);
  }
  return (json?.data ?? { ok: true }) as { ok: true };
}
