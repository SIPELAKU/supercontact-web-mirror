// lib/api/ai-copilot.ts
//
// Phase 7A "Copilot" AI assist API client. Draft-only: every endpoint returns
// text for the agent to review and drop into the composer draft - the server
// NEVER sends. Mirrors the fetch-client style of lib/api/knowledge.ts:
// fetchWithTimeout, a 401 -> "UNAUTHORIZED" throw, and unwrapping the
// `{ success, data, error }` envelope via `json.data ?? json`.
//
// Base: /ai/copilot. All routes are authed (Bearer) and gated on copilot:use
// server-side. Responses live under `.data`:
//   POST /ai/copilot/summarize      { conversation_id }          -> { summary }
//   POST /ai/copilot/suggest-reply  { conversation_id, locale? } -> { reply, sources }
//   POST /ai/copilot/rewrite        { draft, tone }              -> { rewrite }

import { fetchWithTimeout } from "./api-client";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/ai/copilot`;

const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ---- Types -------------------------------------------------------------------

// A KB article the suggested reply is grounded in - the UI cites these as chips.
export interface CopilotSource {
  title: string;
  slug: string;
}

// The four rewrite tones the picker offers. Kept in sync with the drawer's UI.
export type CopilotTone = "friendly" | "formal" | "concise" | "empathetic";

// `summary` / `reply` / `rewrite` are nullable: a null value is the AI's
// "unavailable" signal (Groq unconfigured or the call failed server-side), which
// the backend degrades to gracefully. The UI renders an "AI unavailable" state.
export interface CopilotSummarizeResponse {
  summary: string | null;
}

export interface CopilotSuggestReplyResponse {
  reply: string | null;
  sources: CopilotSource[];
}

export interface CopilotRewriteResponse {
  rewrite: string | null;
}

// Shared response handling: 401 -> UNAUTHORIZED, non-2xx -> throw the parsed
// error body, else return the unwrapped `.data` (mirrors knowledge.ts::handle).
async function handle<T>(res: Response, failMessage: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw json || new Error(failMessage);
  return (json?.data ?? json) as T;
}

// ---- Endpoints ---------------------------------------------------------------

// Summarize an omnichannel conversation (transcript built server-side from the
// conversation id, ACL-enforced). Returns { summary: null } when AI is
// unavailable.
export async function copilotSummarize(
  token: string,
  conversationId: string
): Promise<CopilotSummarizeResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/summarize`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  return handle<CopilotSummarizeResponse>(res, "Failed to summarize conversation");
}

// Suggest a reply grounded in the company's published KB. `locale` optionally
// nudges the reply language. Returns { reply: null, sources: [] } when AI is
// unavailable, and an empty `sources` array when nothing relevant was found.
export async function copilotSuggestReply(
  token: string,
  conversationId: string,
  locale?: string
): Promise<CopilotSuggestReplyResponse> {
  const body: { conversation_id: string; locale?: string } = {
    conversation_id: conversationId,
  };
  if (locale) body.locale = locale;

  const res = await fetchWithTimeout(`${API_BASE}/suggest-reply`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  return handle<CopilotSuggestReplyResponse>(res, "Failed to suggest a reply");
}

// Rewrite the agent's current draft in the chosen tone. Needs only the draft
// text (no conversation), so it's the one action available in composers with no
// conversation in scope. Returns { rewrite: null } when AI is unavailable.
export async function copilotRewrite(
  token: string,
  draft: string,
  tone: CopilotTone
): Promise<CopilotRewriteResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/rewrite`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ draft, tone }),
  });
  return handle<CopilotRewriteResponse>(res, "Failed to rewrite the draft");
}
