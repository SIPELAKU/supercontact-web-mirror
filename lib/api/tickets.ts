// lib/api/tickets.ts
import { fetchWithTimeout } from "./api-client";
import { CreateTicketDTO, SingleTicketResponse, TicketResponse, UpdateTicketDTO } from "@/lib/types/Ticket";

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
    agentId?: string
): Promise<TicketResponse> {
    const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit)
    });

    if (search) queryParams.append("search", search);
    if (status && status !== "Select Status") queryParams.append("status", status);
    if (priority && priority !== "Select Priority") queryParams.append("priority", priority);
    if (agentId && agentId !== "Select Agent") queryParams.append("assigned_agent_id", agentId);

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
