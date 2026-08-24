// lib/api/qa.ts
//
// Phase 8D - QA scorecards + reviews (internal, authed):
//   GET    /support/qa/scorecards
//   POST   /support/qa/scorecards            { name, is_active?, criteria }   (409 dup name)
//   PATCH  /support/qa/scorecards/{id}
//   DELETE /support/qa/scorecards/{id}
//   POST   /support/qa/reviews               { scorecard_id, subject_type, subject_id, ... }
//   PATCH  /support/qa/reviews/{id}
//   GET    /support/qa/reviews?agent_id=&subject_type=&limit=&offset=
//   GET    /support/qa/reviews/{id}          (detail incl. scores + criteria snapshot)
//   GET    /support/qa/summary?agent_id=
//
// Permissions (enforced server-side, mirrored in the UI):
//   scorecard admin  -> support:qa:manage
//   create/edit rev  -> support:qa:review
//   view             -> support:qa:view
//
// All endpoints answer the standard ResponseModel `.data` envelope.

import { fetchWithTimeout } from "./api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface QaCriterion {
    key: string;
    label: string;
    max_points: number;
    /** Optional grouping label rendered as a section heading. */
    section?: string | null;
}

export interface QaScorecard {
    id: string;
    name: string;
    is_active: boolean;
    criteria: QaCriterion[];
    created_at: string;
}

export interface CreateQaScorecardDTO {
    name: string;
    is_active?: boolean;
    criteria: QaCriterion[];
}

export interface UpdateQaScorecardDTO {
    name?: string;
    is_active?: boolean;
    criteria?: QaCriterion[];
}

export type QaSubjectType = "ticket" | "conversation";
export type QaReviewStatus = "draft" | "published";

export interface CreateQaReviewDTO {
    scorecard_id: string;
    subject_type: QaSubjectType;
    subject_id: string;
    reviewed_agent_id?: string;
    scores?: Record<string, number>;
    overall_comment?: string;
    status?: QaReviewStatus;
}

export interface UpdateQaReviewDTO {
    reviewed_agent_id?: string;
    scores?: Record<string, number>;
    overall_comment?: string;
    status?: QaReviewStatus;
}

export interface QaReviewListItem {
    id: string;
    scorecard_id: string;
    scorecard_name: string;
    subject_type: QaSubjectType;
    subject_id: string;
    reviewed_agent_id: string | null;
    reviewed_agent_name: string | null;
    reviewer_id: string;
    reviewer_name: string | null;
    total_score: number;
    max_score: number;
    status: QaReviewStatus;
    created_at: string;
}

/** Detail = list row + the recorded per-criterion scores and the criteria
 *  snapshot taken at review time (so old reviews render even after the
 *  scorecard is edited or deleted). */
export interface QaReviewDetail extends QaReviewListItem {
    scores: Record<string, number>;
    criteria: QaCriterion[];
    overall_comment?: string | null;
}

export interface QaReviewListResult {
    items: QaReviewListItem[];
    total: number;
}

export interface QaReviewListParams {
    agent_id?: string;
    subject_type?: QaSubjectType;
    limit?: number;
    offset?: number;
}

export interface QaAgentSummary {
    agent_id: string;
    agent_name: string | null;
    review_count: number;
    /** Average score across published reviews, as a 0-100 percentage. */
    avg_pct: number;
}

// ---------------------------------------------------------------------------
// Shared helpers (mirrors lib/api/ticket-forms.ts)
// ---------------------------------------------------------------------------
function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return `${baseUrl}${path}`;
}

async function handleResponse(res: Response, errorMessage: string, dupMessage?: string) {
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    // 409 = duplicate name. Surface a friendly, specific message.
    if (res.status === 409 && dupMessage) {
        throw new Error(dupMessage);
    }

    let json: any;
    try {
        json = await res.json();
    } catch {
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }

    if (!res.ok || json?.success === false) {
        const errorMsg = json?.message || json?.error?.message || json?.error || errorMessage;
        throw new Error(typeof errorMsg === "string" ? errorMsg : errorMessage);
    }

    return json;
}

function unwrap(json: any): any {
    const raw = json?.data;
    if (raw && typeof raw === "object" && !Array.isArray(raw) && "data" in raw) return raw.data;
    return raw ?? json;
}

function authHeaders(token: string, withBody = false): Record<string, string> {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    };
    if (withBody) headers["Content-Type"] = "application/json";
    return headers;
}

// ---------------------------------------------------------------------------
// Scorecards
// ---------------------------------------------------------------------------
const DUP_SCORECARD = "A scorecard with this name already exists.";

export async function fetchQaScorecards(token: string): Promise<QaScorecard[]> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/scorecards`), {
        method: "GET",
        headers: authHeaders(token),
    });
    const json = await handleResponse(res, "Failed to load QA scorecards");
    const raw = unwrap(json);
    return (Array.isArray(raw) ? raw : []) as QaScorecard[];
}

export async function createQaScorecard(
    token: string,
    data: CreateQaScorecardDTO
): Promise<QaScorecard> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/scorecards`), {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify(data),
    });
    const json = await handleResponse(res, "Failed to create QA scorecard", DUP_SCORECARD);
    return unwrap(json) as QaScorecard;
}

export async function updateQaScorecard(
    token: string,
    id: string,
    data: UpdateQaScorecardDTO
): Promise<QaScorecard> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/scorecards/${id}`), {
        method: "PATCH",
        headers: authHeaders(token, true),
        body: JSON.stringify(data),
    });
    const json = await handleResponse(res, "Failed to update QA scorecard", DUP_SCORECARD);
    return unwrap(json) as QaScorecard;
}

export async function deleteQaScorecard(token: string, id: string): Promise<any> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/scorecards/${id}`), {
        method: "DELETE",
        headers: authHeaders(token),
    });
    return handleResponse(res, "Failed to delete QA scorecard");
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function fetchQaReviews(
    token: string,
    params: QaReviewListParams = {}
): Promise<QaReviewListResult> {
    const qs = new URLSearchParams();
    if (params.agent_id) qs.append("agent_id", params.agent_id);
    if (params.subject_type) qs.append("subject_type", params.subject_type);
    if (params.limit !== undefined) qs.append("limit", String(params.limit));
    if (params.offset !== undefined) qs.append("offset", String(params.offset));

    const query = qs.toString();
    const res = await fetchWithTimeout(
        getFullUrl(`/support/qa/reviews${query ? `?${query}` : ""}`),
        { method: "GET", headers: authHeaders(token) }
    );
    const json = await handleResponse(res, "Failed to load QA reviews");
    const raw = unwrap(json);
    return {
        items: Array.isArray(raw?.items) ? raw.items : [],
        total: typeof raw?.total === "number" ? raw.total : 0,
    };
}

export async function fetchQaReview(token: string, id: string): Promise<QaReviewDetail> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/reviews/${id}`), {
        method: "GET",
        headers: authHeaders(token),
    });
    const json = await handleResponse(res, "Failed to load QA review");
    return unwrap(json) as QaReviewDetail;
}

export async function createQaReview(
    token: string,
    data: CreateQaReviewDTO
): Promise<QaReviewDetail> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/reviews`), {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify(data),
    });
    const json = await handleResponse(res, "Failed to create QA review");
    return unwrap(json) as QaReviewDetail;
}

export async function updateQaReview(
    token: string,
    id: string,
    data: UpdateQaReviewDTO
): Promise<QaReviewDetail> {
    const res = await fetchWithTimeout(getFullUrl(`/support/qa/reviews/${id}`), {
        method: "PATCH",
        headers: authHeaders(token, true),
        body: JSON.stringify(data),
    });
    const json = await handleResponse(res, "Failed to update QA review");
    return unwrap(json) as QaReviewDetail;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
export async function fetchQaSummary(token: string, agentId?: string): Promise<QaAgentSummary[]> {
    const qs = new URLSearchParams();
    if (agentId) qs.append("agent_id", agentId);
    const query = qs.toString();

    const res = await fetchWithTimeout(
        getFullUrl(`/support/qa/summary${query ? `?${query}` : ""}`),
        { method: "GET", headers: authHeaders(token) }
    );
    const json = await handleResponse(res, "Failed to load QA summary");
    const raw = unwrap(json);
    return (Array.isArray(raw) ? raw : []) as QaAgentSummary[];
}
