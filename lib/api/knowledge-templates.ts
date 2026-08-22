// lib/api/knowledge-templates.ts
//
// KB Industry Template Packs ("Starter Packs") API client. Mirrors the
// fetch-client style of lib/api/knowledge.ts: fetchWithTimeout, a 401 ->
// "UNAUTHORIZED" throw, and unwrapping the `{ success, data, error }`
// envelope via `json.data ?? json`.
//
// Contracts (both gated by knowledge:manage on the backend):
//   GET  /knowledge/templates
//   POST /knowledge/templates/{packId}/install   (install_as=published
//        additionally requires knowledge:publish -> 403)

import { fetchWithTimeout } from "./api-client";
import type {
  KbTemplatePack,
  KbTemplatePreviewCategory,
  InstallKbTemplateRequest,
  KbTemplateInstallResult,
} from "../types/knowledge";

export type {
  KbTemplatePack,
  KbTemplatePreviewCategory,
  InstallKbTemplateRequest,
  KbTemplateInstallResult,
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/knowledge`;

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });
const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// Shared response handling, matching lib/api/knowledge.ts — with one addition:
// the HTTP status is stapled onto the thrown error body so callers can tell a
// permission denial (403, e.g. install_as=published without knowledge:publish)
// apart from other failures.
async function handle<T>(res: Response, failMessage: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const err: any = json ?? new Error(failMessage);
    if (err && typeof err === "object") {
      try {
        err.status = res.status;
      } catch {
        // frozen body — status tagging is best-effort only
      }
    }
    throw err;
  }
  return (json?.data ?? json) as T;
}

// The backend keys `counts` and `preview` BY LOCALE ({"id": {...}}); pick the
// "id" locale when present, else the first available one.
function pickLocale<T>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw as T;
  const map = raw as Record<string, T>;
  if ("id" in map) return map["id"];
  const first = Object.keys(map)[0];
  return first ? map[first] : undefined;
}

// Preview categories arrive as [{name, is_public, sections:[{name, articles:[titles]}]}];
// the gallery only shows category -> section NAMES. Be tolerant of simpler
// serializations too (section as plain string, or a {categoryName: [names]} map).
function normalizePreview(raw: unknown): KbTemplatePreviewCategory[] {
  const sectionName = (s: unknown): string =>
    s && typeof s === "object" ? String((s as any).name ?? "") : String(s ?? "");
  if (Array.isArray(raw)) {
    return raw
      .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
      .map((c) => ({
        name: String(c.name ?? ""),
        sections: Array.isArray(c.sections)
          ? c.sections.map(sectionName).filter((n) => n.length > 0)
          : [],
      }))
      .filter((c) => c.name.length > 0);
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>).map(([name, sections]) => ({
      name,
      sections: Array.isArray(sections)
        ? sections.map(sectionName).filter((n) => n.length > 0)
        : [],
    }));
  }
  return [];
}

function normalizePack(raw: any): KbTemplatePack {
  // counts is locale-keyed ({"id": {categories,...}}) but tolerate a flat shape.
  const countsRaw =
    raw?.counts && typeof raw.counts.categories === "number"
      ? raw.counts
      : pickLocale<any>(raw?.counts) ?? {};
  // preview is locale-keyed ({"id": [...]}), tolerate the direct-array shape.
  const previewRaw = Array.isArray(raw?.preview)
    ? raw.preview
    : pickLocale<unknown>(raw?.preview);
  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? ""),
    description: raw?.description ?? null,
    industry: String(raw?.industry ?? ""),
    version: raw?.version ?? "1",
    variables: Array.isArray(raw?.variables)
      ? raw.variables.map((v: any) => ({
          key: String(v?.key ?? ""),
          label: String(v?.label ?? v?.key ?? ""),
          example: v?.example ?? null,
        }))
      : [],
    locales: Array.isArray(raw?.locales) ? raw.locales.map(String) : [],
    counts: {
      categories: Number(countsRaw?.categories ?? 0),
      sections: Number(countsRaw?.sections ?? 0),
      articles: Number(countsRaw?.articles ?? 0),
    },
    preview: normalizePreview(previewRaw),
  };
}

// ---- Endpoints ---------------------------------------------------------------

export async function fetchKbTemplates(token: string): Promise<KbTemplatePack[]> {
  const res = await fetchWithTimeout(`${API_BASE}/templates`, {
    headers: authHeaders(token),
  });
  const data = await handle<unknown>(res, "Failed to fetch template packs");
  return Array.isArray(data) ? data.map(normalizePack) : [];
}

export async function installKbTemplate(
  token: string,
  packId: string,
  data: InstallKbTemplateRequest
): Promise<KbTemplateInstallResult> {
  const res = await fetchWithTimeout(
    `${API_BASE}/templates/${encodeURIComponent(packId)}/install`,
    {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(data),
    }
  );
  const result = await handle<KbTemplateInstallResult>(res, "Failed to install template pack");
  // Defensive defaults so the result screen never explodes on a sparse body.
  return {
    created: {
      categories: Number(result?.created?.categories ?? 0),
      sections: Number(result?.created?.sections ?? 0),
      articles: Number(result?.created?.articles ?? 0),
    },
    skipped: {
      categories: Number(result?.skipped?.categories ?? 0),
      sections: Number(result?.skipped?.sections ?? 0),
      articles: Number(result?.skipped?.articles ?? 0),
    },
    unsubstituted_variables: Array.isArray(result?.unsubstituted_variables)
      ? result.unsubstituted_variables.map(String)
      : [],
  };
}
