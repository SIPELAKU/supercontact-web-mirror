// lib/api/support-workspace.ts
// Unified support workspace feed - a single cross-entity list that UNIONs
// tickets and omnichannel conversations (read-only). Mirrors the backend
// GET /support/workspace/feed endpoint (Increment 8), which returns the
// standard ResponseModel `.data` envelope.
import { fetchWithTimeout } from "./api-client";

function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return `${baseUrl}${path}`;
}

async function handleResponse<T>(res: Response, errorMessage: string): Promise<T> {
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    let json: any;
    try {
        json = await res.json();
    } catch (err) {
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }

    if (!res.ok || json.success === false) {
        const errorMsg = json.message || json.error?.message || json.error || errorMessage;
        throw new Error(errorMsg);
    }

    return json as T;
}

export type UnifiedFeedKind = "ticket" | "conversation";

// One row of the unified feed. Projected identically for both a ticket and an
// omnichannel conversation by the backend UNION, so the FE never has to know
// which underlying table a row came from beyond the `kind` discriminator.
export interface UnifiedFeedItem {
    id: string;
    kind: UnifiedFeedKind;
    title: string;
    status: string;
    priority: string;
    // Only conversations carry a channel (a ChannelType value: "whatsapp" |
    // "email" | "web_widget" | "sms" | "messenger"); null for tickets.
    channel_type: string | null;
    assignee_id: string | null;
    assignee_name: string | null;
    contact_id: string | null;
    contact_name: string | null;
    updated_at: string;
    // Only tickets carry a human-facing code; null for conversations.
    ticket_code: string | null;
}

export interface UnifiedFeedResult {
    items: UnifiedFeedItem[];
    total: number;
}

export interface UnifiedFeedParams {
    // Empty/undefined = both kinds.
    kind?: UnifiedFeedKind | "";
    status?: string;
    assignedToMe?: boolean;
    q?: string;
    limit?: number;
    offset?: number;
}

// Returns the unwrapped `.data` payload ({ items, total }).
export async function fetchUnifiedFeed(
    token: string,
    params: UnifiedFeedParams = {}
): Promise<UnifiedFeedResult> {
    const queryParams = new URLSearchParams();

    if (params.kind) queryParams.append("kind", params.kind);
    if (params.status) queryParams.append("status", params.status);
    if (params.assignedToMe) queryParams.append("assigned_to_me", "true");
    if (params.q) queryParams.append("q", params.q);
    if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
    if (params.offset !== undefined) queryParams.append("offset", String(params.offset));

    const url = getFullUrl(`/support/workspace/feed?${queryParams.toString()}`);

    const res = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    const json = await handleResponse<{ data: UnifiedFeedResult }>(res, "Failed to load workspace feed");
    return {
        items: json.data?.items ?? [],
        total: json.data?.total ?? 0,
    };
}
