// lib/api/knowledge.ts
//
// Phase 6 Help Center / Knowledge Base API client. Mirrors the fetch-client
// style of lib/api/omnichannel.ts: fetchWithTimeout, a 401 -> "UNAUTHORIZED"
// throw, and unwrapping the `{ success, data, error }` envelope via
// `json.data || json`.

import { fetchWithTimeout } from "./api-client";
import type {
  KbCategory,
  KbSection,
  KbArticle,
  KbArticleSummary,
  KbArticleVersion,
  KbSearchHit,
  KbFlag,
  CreateKbCategoryRequest,
  UpdateKbCategoryRequest,
  CreateKbSectionRequest,
  UpdateKbSectionRequest,
  CreateKbArticleRequest,
  UpdateKbArticleRequest,
  KbArticleListParams,
  KbFeedbackRequest,
  KbFlagRequest,
} from "../types/knowledge";

// Re-export types for convenience (mirrors omnichannel.ts).
export type {
  KbCategory,
  KbSection,
  KbArticle,
  KbArticleSummary,
  KbArticleVersion,
  KbSearchHit,
  KbFlag,
  CreateKbCategoryRequest,
  UpdateKbCategoryRequest,
  CreateKbSectionRequest,
  UpdateKbSectionRequest,
  CreateKbArticleRequest,
  UpdateKbArticleRequest,
  KbArticleListParams,
  KbFeedbackRequest,
  KbFlagRequest,
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/knowledge`;

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });
const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// Shared response handling: 401 -> UNAUTHORIZED, non-2xx -> throw the parsed
// error body, else return the unwrapped `.data`.
async function handle<T>(res: Response, failMessage: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw json || new Error(failMessage);
  return (json?.data ?? json) as T;
}

async function handleList<T>(res: Response, failMessage: string): Promise<T[]> {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw json || new Error(failMessage);
  const data = json?.data ?? json;
  return Array.isArray(data) ? (data as T[]) : [];
}

// ---- Categories --------------------------------------------------------------

export async function fetchKbCategories(token: string): Promise<KbCategory[]> {
  const res = await fetchWithTimeout(`${API_BASE}/categories`, { headers: authHeaders(token) });
  return handleList<KbCategory>(res, "Failed to fetch categories");
}

export async function createKbCategory(token: string, data: CreateKbCategoryRequest): Promise<KbCategory> {
  const res = await fetchWithTimeout(`${API_BASE}/categories`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbCategory>(res, "Failed to create category");
}

export async function updateKbCategory(token: string, id: string, data: UpdateKbCategoryRequest): Promise<KbCategory> {
  const res = await fetchWithTimeout(`${API_BASE}/categories/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbCategory>(res, "Failed to update category");
}

export async function deleteKbCategory(token: string, id: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handle<unknown>(res, "Failed to delete category");
}

// ---- Sections ----------------------------------------------------------------

// GET /knowledge/categories/{categoryId}/sections when scoped to a category,
// GET /knowledge/sections for the flat list.
export async function fetchKbSections(token: string, categoryId?: string): Promise<KbSection[]> {
  const url = categoryId
    ? `${API_BASE}/categories/${categoryId}/sections`
    : `${API_BASE}/sections`;
  const res = await fetchWithTimeout(url, { headers: authHeaders(token) });
  return handleList<KbSection>(res, "Failed to fetch sections");
}

export async function createKbSection(token: string, data: CreateKbSectionRequest): Promise<KbSection> {
  const res = await fetchWithTimeout(`${API_BASE}/sections`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbSection>(res, "Failed to create section");
}

export async function updateKbSection(token: string, id: string, data: UpdateKbSectionRequest): Promise<KbSection> {
  const res = await fetchWithTimeout(`${API_BASE}/sections/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbSection>(res, "Failed to update section");
}

export async function deleteKbSection(token: string, id: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/sections/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handle<unknown>(res, "Failed to delete section");
}

// ---- Articles ----------------------------------------------------------------

export async function fetchKbArticles(token: string, params: KbArticleListParams = {}): Promise<KbArticleSummary[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.append("status", params.status);
  if (params.section_id) qs.append("section_id", params.section_id);
  if (params.q) qs.append("q", params.q);
  if (params.locale) qs.append("locale", params.locale);
  if (params.limit != null) qs.append("limit", String(params.limit));
  if (params.offset != null) qs.append("offset", String(params.offset));

  const res = await fetchWithTimeout(`${API_BASE}/articles?${qs.toString()}`, {
    headers: authHeaders(token),
  });
  return handleList<KbArticleSummary>(res, "Failed to fetch articles");
}

export async function fetchKbArticle(token: string, id: string): Promise<KbArticle> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}`, { headers: authHeaders(token) });
  return handle<KbArticle>(res, "Failed to fetch article");
}

export async function createKbArticle(token: string, data: CreateKbArticleRequest): Promise<KbArticle> {
  const res = await fetchWithTimeout(`${API_BASE}/articles`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbArticle>(res, "Failed to create article");
}

export async function updateKbArticle(token: string, id: string, data: UpdateKbArticleRequest): Promise<KbArticle> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbArticle>(res, "Failed to update article");
}

export async function publishKbArticle(token: string, id: string): Promise<KbArticle> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handle<KbArticle>(res, "Failed to publish article");
}

export async function unpublishKbArticle(token: string, id: string): Promise<KbArticle> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}/unpublish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handle<KbArticle>(res, "Failed to unpublish article");
}

export async function archiveKbArticle(token: string, id: string): Promise<KbArticle> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}/archive`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handle<KbArticle>(res, "Failed to archive article");
}

export async function deleteKbArticle(token: string, id: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handle<unknown>(res, "Failed to delete article");
}

export async function fetchKbArticleVersions(token: string, id: string): Promise<KbArticleVersion[]> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}/versions`, {
    headers: authHeaders(token),
  });
  return handleList<KbArticleVersion>(res, "Failed to fetch article versions");
}

// ---- Search ------------------------------------------------------------------

export async function searchKb(
  token: string,
  q: string,
  locale?: string,
  limit?: number
): Promise<KbSearchHit[]> {
  const qs = new URLSearchParams();
  qs.append("q", q);
  if (locale) qs.append("locale", locale);
  if (limit != null) qs.append("limit", String(limit));

  const res = await fetchWithTimeout(`${API_BASE}/search?${qs.toString()}`, {
    headers: authHeaders(token),
  });
  return handleList<KbSearchHit>(res, "Failed to search knowledge base");
}

// ---- Feedback ----------------------------------------------------------------

export async function submitKbFeedback(token: string, id: string, data: KbFeedbackRequest): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}/feedback`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  await handle<unknown>(res, "Failed to submit feedback");
}

// ---- Flags -------------------------------------------------------------------

export async function flagKbArticle(token: string, id: string, data: KbFlagRequest): Promise<KbFlag> {
  const res = await fetchWithTimeout(`${API_BASE}/articles/${id}/flag`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<KbFlag>(res, "Failed to flag article");
}

export async function fetchKbFlags(token: string, status: string = "open"): Promise<KbFlag[]> {
  const qs = new URLSearchParams();
  if (status) qs.append("status", status);
  const res = await fetchWithTimeout(`${API_BASE}/flags?${qs.toString()}`, {
    headers: authHeaders(token),
  });
  return handleList<KbFlag>(res, "Failed to fetch flags");
}

export async function resolveKbFlag(token: string, id: string): Promise<KbFlag> {
  const res = await fetchWithTimeout(`${API_BASE}/flags/${id}/resolve`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handle<KbFlag>(res, "Failed to resolve flag");
}
