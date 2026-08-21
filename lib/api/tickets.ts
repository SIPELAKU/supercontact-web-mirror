// lib/api/tickets.ts
import { fetchWithTimeout } from "./api-client";
import { CreateTicketDTO, SingleTicketResponse, TicketLink, TicketLinkType, TicketPriority, TicketResponse, TicketStatus, UpdateTicketDTO } from "@/lib/types/Ticket";

// Helper to construct full URL
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

    let json;
    try {
        json = await res.json();
    } catch (err) {
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }

    if (!res.ok || (json.success === false)) {
        const errorMsg = json.message || json.error?.message || json.error || errorMessage;
        throw new Error(errorMsg);
    }

    return json;
}

export async function fetchTickets(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    priority?: string,
    type?: string,
    agentId?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
): Promise<TicketResponse> {
    const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit)
    });

    if (search) queryParams.append("search", search);
    if (status && status !== "Select Status") queryParams.append("status", status);
    if (priority && priority !== "Select Priority") queryParams.append("priority", priority);
    if (type && type !== "Select Type") queryParams.append("type", type);
    if (agentId && agentId !== "Select Agent") queryParams.append("assigned_agent_id", agentId);
    if (sortBy) {
        queryParams.append("sort_by", sortBy);
        queryParams.append("sort_order", sortOrder ?? "asc");
    }

    const url = getFullUrl(`/tickets?${queryParams.toString()}`);

    const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        },
    });

    return await handleResponse(res, "Failed to load tickets");
}

export async function fetchTicket(token: string, id: string): Promise<SingleTicketResponse> {
    const url = getFullUrl(`/tickets/${id}`);
    const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        },
    });
    return await handleResponse(res, "Failed to load ticket details");
}

export async function createTicket(token: string, data: CreateTicketDTO): Promise<SingleTicketResponse> {
    const url = getFullUrl("/tickets");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return await handleResponse(res, "Failed to create ticket");
}

export async function updateTicket(token: string, id: string, data: UpdateTicketDTO): Promise<SingleTicketResponse> {
    const url = getFullUrl(`/tickets/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PUT", // Or PATCH depending on backend preference, request says PUT/PATCH
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return await handleResponse(res, "Failed to update ticket");
}

export async function deleteTicket(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/tickets/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "application/json"
        },
    });
    return await handleResponse(res, "Failed to delete ticket");
}

export interface TicketBulkActionResponse {
    succeeded: string[];
    failed: { id: string; reason: string }[];
}

export async function bulkDeleteTickets(token: string, ticketIds: string[]): Promise<{ data: TicketBulkActionResponse }> {
    const url = getFullUrl("/tickets/bulk-delete");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticket_ids: ticketIds }),
    });
    return handleResponse(res, "Failed to bulk delete tickets");
}

export async function bulkUpdateTickets(
    token: string,
    ticketIds: string[],
    data: { status?: TicketStatus; priority?: TicketPriority; category_id?: string | null }
): Promise<{ data: TicketBulkActionResponse }> {
    const url = getFullUrl("/tickets/bulk-update");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticket_ids: ticketIds, ...data }),
    });
    return handleResponse(res, "Failed to bulk update tickets");
}

export async function bulkAssignTickets(
    token: string,
    ticketIds: string[],
    assignedAgentId: string
): Promise<{ data: TicketBulkActionResponse }> {
    const url = getFullUrl("/tickets/bulk-assign");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticket_ids: ticketIds, assigned_agent_id: assignedAgentId }),
    });
    return handleResponse(res, "Failed to bulk assign tickets");
}

export interface TicketViewer {
    user: { id: string; fullname: string; email: string };
    last_seen_at: string;
}

export async function sendTicketViewerHeartbeat(token: string, ticketId: string): Promise<any> {
    const url = getFullUrl(`/tickets/${ticketId}/viewers/heartbeat`);
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to send ticket viewer heartbeat");
}

export async function fetchTicketViewers(token: string, ticketId: string): Promise<{ data: { data: TicketViewer[] } }> {
    const url = getFullUrl(`/tickets/${ticketId}/viewers`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load ticket viewers");
}

export async function mergeTicket(
    token: string,
    ticketId: string,
    duplicateTicketId: string
): Promise<SingleTicketResponse> {
    const url = getFullUrl(`/tickets/${ticketId}/merge`);
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duplicate_ticket_id: duplicateTicketId }),
    });
    return handleResponse(res, "Failed to merge ticket");
}

export async function createTicketLink(
    token: string,
    ticketId: string,
    linkedTicketId: string,
    linkType: TicketLinkType = "related"
): Promise<any> {
    const url = getFullUrl(`/tickets/${ticketId}/links`);
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linked_ticket_id: linkedTicketId, link_type: linkType }),
    });
    return handleResponse(res, "Failed to link ticket");
}

export async function fetchTicketLinks(
    token: string,
    ticketId: string
): Promise<{ data: { data: TicketLink[] } }> {
    const url = getFullUrl(`/tickets/${ticketId}/links`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load linked tickets");
}

export async function deleteTicketLink(token: string, ticketId: string, linkId: string): Promise<any> {
    const url = getFullUrl(`/tickets/${ticketId}/links/${linkId}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to remove ticket link");
}

export async function fetchAssignableAgents(token: string, search?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);

    const url = getFullUrl(`/tickets/assignable-agents?${queryParams.toString()}`);
    const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        },
    });

    return await handleResponse(res, "Failed to load assignable agents");
}
