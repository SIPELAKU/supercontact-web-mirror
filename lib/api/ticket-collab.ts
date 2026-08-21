// lib/api/ticket-collab.ts
//
// Phase 5 / Inc 5 - ticket collaboration APIs:
//   - Followers / CC participants  (GET/POST/DELETE /tickets/{id}/participants)
//   - Agent reply signature        (GET/PUT /tickets/signature)
//   - Per-ticket, per-agent drafts (GET/PUT/DELETE /tickets/{id}/draft)
//
// All endpoints return the standard ResponseModel `.data` envelope; these
// helpers unwrap it the same way lib/api/tickets.ts does.

import { fetchWithTimeout } from "./api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TicketParticipantRole = "follower" | "cc";

export interface TicketParticipant {
    id: string;
    role: TicketParticipantRole;
    user_id: string | null;
    user_name: string | null;
    email: string | null;
    contact_id: string | null;
    contact_name: string | null;
}

export interface AddTicketParticipantPayload {
    role: TicketParticipantRole;
    user_id?: string;
    email?: string;
    contact_id?: string;
}

export interface AgentSignature {
    body: string;
    is_active: boolean;
}

export interface TicketDraft {
    body: string;
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

// DELETE endpoints may answer 204 (no body); tolerate both an empty response
// and a ResponseModel JSON envelope.
async function handleEmptyResponse(res: Response, errorMessage: string) {
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) {
        let json: any = null;
        try {
            json = await res.json();
        } catch {
            // no body
        }
        throw new Error(json?.message || json?.error?.message || json?.error || errorMessage);
    }
}

// ---------------------------------------------------------------------------
// Participants (followers / CC)
// ---------------------------------------------------------------------------
export async function fetchTicketParticipants(
    token: string,
    ticketId: string
): Promise<TicketParticipant[]> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/${ticketId}/participants`), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const json = await handleResponse(res, "Failed to load ticket participants");
    // Envelope is `{ data: [...] }`; be defensive against a nested `{ data: { data: [...] } }`.
    const raw = json?.data;
    return (Array.isArray(raw) ? raw : raw?.data ?? []) as TicketParticipant[];
}

export async function addTicketParticipant(
    token: string,
    ticketId: string,
    payload: AddTicketParticipantPayload
): Promise<TicketParticipant> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/${ticketId}/participants`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    // 409 = already a participant. Surface a friendly, specific message.
    if (res.status === 409) {
        throw new Error("This person is already a follower or CC on this ticket.");
    }

    const json = await handleResponse(res, "Failed to add participant");
    return (json?.data ?? json) as TicketParticipant;
}

export async function deleteTicketParticipant(
    token: string,
    ticketId: string,
    participantId: string
): Promise<void> {
    const res = await fetchWithTimeout(
        getFullUrl(`/tickets/${ticketId}/participants/${participantId}`),
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
    );
    await handleEmptyResponse(res, "Failed to remove participant");
}

// ---------------------------------------------------------------------------
// Agent signature (per current user)
// ---------------------------------------------------------------------------
export async function fetchTicketSignature(token: string): Promise<AgentSignature> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/signature`), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const json = await handleResponse(res, "Failed to load signature");
    const data = json?.data ?? json;
    return { body: data?.body ?? "", is_active: !!data?.is_active };
}

export async function saveTicketSignature(
    token: string,
    payload: AgentSignature
): Promise<AgentSignature> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/signature`), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    const json = await handleResponse(res, "Failed to save signature");
    const data = json?.data ?? json;
    return { body: data?.body ?? "", is_active: !!data?.is_active };
}

// ---------------------------------------------------------------------------
// Reply drafts (per-ticket, per-agent) - mirrors the conversation draft API.
// GET returns an empty body when none exists; PUT upserts; DELETE clears.
// ---------------------------------------------------------------------------
export async function fetchTicketDraft(token: string, ticketId: string): Promise<TicketDraft> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/${ticketId}/draft`), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const json = await handleResponse(res, "Failed to load draft");
    const data = json?.data ?? json;
    return { body: data?.body ?? "" };
}

export async function saveTicketDraft(
    token: string,
    ticketId: string,
    body: string
): Promise<TicketDraft> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/${ticketId}/draft`), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body }),
    });
    const json = await handleResponse(res, "Failed to save draft");
    const data = json?.data ?? json;
    return { body: data?.body ?? "" };
}

export async function deleteTicketDraft(token: string, ticketId: string): Promise<void> {
    const res = await fetchWithTimeout(getFullUrl(`/tickets/${ticketId}/draft`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    await handleEmptyResponse(res, "Failed to delete draft");
}
