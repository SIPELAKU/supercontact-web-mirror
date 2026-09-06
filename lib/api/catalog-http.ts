// lib/api/catalog-http.ts
//
// Shared transport for the Phase 1 settings managers (product categories,
// units, custom-field definitions) and the product image upload: the
// `lib/api/pipeline-stages.ts` pattern - `fetchWithTimeout`, `getFullUrl`,
// `authHeaders`, `handleResponse` throwing `UNAUTHORIZED` on 401 - with one
// addition: a thrown error carries the API's `code`, `details` and `status`
// (as `lib/api/quotations.ts` does) so a form can route `details.field` and
// `details.errors[]` under the right control instead of only toasting.
//
// No axios and no `/api/proxy` here, deliberately (spec I, conventions).

import { fetchWithTimeout } from "./api-client";

export interface CatalogApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;
}

export function getFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  return `${baseUrl}${path}`;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

export function jsonHeaders(token: string): Record<string, string> {
  return { ...authHeaders(token), "Content-Type": "application/json" };
}

/**
 * Query string from a params object. `undefined`, `null` and `""` are
 * skipped (the server default applies); booleans become `true`/`false`.
 */
export function buildQuery(params: object | undefined): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries((params ?? {}) as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

function readMessage(json: unknown, fallback: string): string {
  const payload = (json ?? {}) as Record<string, unknown>;
  const error = payload.error;
  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof error === "string" && error.trim()) return error;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  return fallback;
}

/**
 * Parses the `ResponseModel {success, message, data, error}` envelope.
 * Returns the whole envelope; callers unwrap `.data`.
 */
export async function handleResponse<T = unknown>(
  res: Response,
  errorMessage: string
): Promise<{ success: boolean; message?: string; data: T; error?: unknown }> {
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`${errorMessage} (Invalid JSON response)`);
  }
  if (!res.ok || json?.success === false) {
    const err: CatalogApiError = new Error(readMessage(json, errorMessage));
    const error = json?.error;
    if (error && typeof error === "object") {
      if (typeof error.code === "string") err.code = error.code;
      err.details = error.details;
    }
    err.status = res.status;
    throw err;
  }
  return json;
}

/**
 * Field-level messages out of a thrown API error, for placing under the
 * matching control. Handles the three shapes the Phase 1 API emits:
 *
 *   details.field = "category_id" (+ the top-level message)
 *   details.errors = [{ field, message }]          (custom-field values)
 *   details = [{ loc: [..., "name"], msg }]        (pydantic 422)
 *
 * Field-less entries land under `"_"`.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const err = (error ?? {}) as { details?: unknown; message?: unknown };
  const message = typeof err.message === "string" ? err.message : "";
  const details = err.details;

  const put = (field: string, text: string) => {
    if (!text) return;
    out[field] = out[field] ? `${out[field]}; ${text}` : text;
  };

  if (Array.isArray(details)) {
    for (const item of details) {
      if (!item || typeof item !== "object") continue;
      const loc = Array.isArray((item as any).loc) ? (item as any).loc : [];
      const last = loc.length > 0 ? String(loc[loc.length - 1]) : "_";
      const msg = typeof (item as any).msg === "string" ? (item as any).msg : message;
      put(last, msg);
    }
    return out;
  }

  if (details && typeof details === "object") {
    const d = details as Record<string, unknown>;
    if (typeof d.field === "string" && d.field.trim()) {
      put(d.field, typeof d.message === "string" ? d.message : message);
    }
    if (Array.isArray(d.errors)) {
      for (const entry of d.errors) {
        if (!entry || typeof entry !== "object") continue;
        const field =
          typeof (entry as any).field === "string" && (entry as any).field.trim()
            ? (entry as any).field
            : "_";
        const text = typeof (entry as any).message === "string" ? (entry as any).message : message;
        put(field, text);
      }
    }
  }
  return out;
}
