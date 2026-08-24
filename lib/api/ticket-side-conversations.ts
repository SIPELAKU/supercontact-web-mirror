// lib/api/ticket-side-conversations.ts
//
// Phase 5 / Inc 7 - ticket side conversations (a ticket sub-resource):
//   GET    /tickets/{ticketId}/side-conversations
//   POST   /tickets/{ticketId}/side-conversations                       { subject }
//   GET    /tickets/{ticketId}/side-conversations/{scId}
//   POST   /tickets/{ticketId}/side-conversations/{scId}/messages       { body }
//   POST   /tickets/{ticketId}/side-conversations/{scId}/close
//
// All endpoints return the standard ResponseModel `.data` envelope; these
// helpers unwrap it the same way lib/api/tickets.ts / ticket-collab.ts do.

import { fetchWithTimeout } from "./api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SideConversationState = "open" | "closed";

export interface SideConversationSummary {
    id: string;
    subject: string;
    state: SideConversationState;
    created_by_id: string;
    created_by_name: string | null;
    created_at: string;
    message_count: number;
}

export interface SideConversationMessage {
    id: string;
    body: string;
    sender_user_id: string | null;
    sender_name: string | null;
    created_at: string;
}

export interface SideConversationDetail {
    id: string;
    subject: string;
    state: SideConversationState;
    created_by_id: string;
    created_at: string;
    messages: SideConversationMessage[];
}

// ---------------------------------------------------------------------------
// Shared helpers (mirrors lib/api/tickets.ts)
// ---------------------------------------------------------------------------
function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return `${baseUrl}${path}`;
}

async function handleResponse(res: Response, errorMessage: string) {
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    let json: any;
    try {
        json = await res.json();
    } catch {
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }

    if (!res.ok || json?.success === false) {
        const errorMsg = json?.message || json?.error?.message || json?.error || errorMessage;
        throw new Error(errorMsg);
    }

    return json;
}

// The envelope is `{ data: [...] }`; be defensive against a nested
// `{ data: { data: [...] } }` shape too.
function unwrap(json: any): any {
    const raw = json?.data;
    if (raw && typeof raw === "object" && "data" in raw) return raw.data;
    return raw ?? json;
}

// ---------------------------------------------------------------------------
// Side conversations
// ---------------------------------------------------------------------------
export async function fetchSideConversations(
    token: string,
    ticketId: string
): Promise<SideConversationSummary[]> {
    const res = await fetchWithTimeout(
        getFullUrl(`/tickets/${ticketId}/side-conversations`),
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
    );
    const json = await handleResponse(res, "Failed to load side conversations");
    const raw = unwrap(json);
    return (Array.isArray(raw) ? raw : []) as SideConversationSummary[];
}

export async function createSideConversation(
    token: string,
    ticketId: string,
    subject: string
): Promise<SideConversationSummary> {
    const res = await fetchWithTimeout(
        getFullUrl(`/tickets/${ticketId}/side-conversations`),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ subject }),
        }
    );
    const json = await handleResponse(res, "Failed to create side conversation");
    return unwrap(json) as SideConversationSummary;
}

export async function fetchSideConversation(
    token: string,
    ticketId: string,
    scId: string
): Promise<SideConversationDetail> {
    const res = await fetchWithTimeout(
        getFullUrl(`/tickets/${ticketId}/side-conversations/${scId}`),
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
    );
    const json = await handleResponse(res, "Failed to load side conversation");
    return unwrap(json) as SideConversationDetail;
}

export async function postSideConversationMessage(
    token: string,
    ticketId: string,
    scId: string,
    body: string
): Promise<SideConversationMessage> {
    const res = await fetchWithTimeout(
        getFullUrl(`/tickets/${ticketId}/side-conversations/${scId}/messages`),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ body }),
        }
    );
    const json = await handleResponse(res, "Failed to send message");
    return unwrap(json) as SideConversationMessage;
}

export async function closeSideConversation(
    token: string,
    ticketId: string,
    scId: string
): Promise<{ id: string; state: SideConversationState }> {
    const res = await fetchWithTimeout(
        getFullUrl(`/tickets/${ticketId}/side-conversations/${scId}/close`),
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
    );
    const json = await handleResponse(res, "Failed to close side conversation");
    return unwrap(json) as { id: string; state: SideConversationState };
}
