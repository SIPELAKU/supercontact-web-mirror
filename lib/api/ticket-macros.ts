import { fetchWithTimeout } from "./api-client";
import { TicketMacro } from "@/lib/types/TicketSettings";

function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");
    return `${baseUrl}${path}`;
}

async function handleResponse(res: Response, errorMessage: string) {
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    let json;
    try {
        json = await res.json();
    } catch {
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }
    if (!res.ok || json.success === false) {
        throw new Error(json.message || json.error?.message || json.error || errorMessage);
    }
    return json;
}

export interface CreateTicketMacroDTO {
    name: string;
    body_template: string;
    field_changes?: Record<string, any>;
}

export type UpdateTicketMacroDTO = Partial<CreateTicketMacroDTO> & { is_active?: boolean };

export async function fetchTicketMacros(
    token: string,
    activeOnly: boolean = true
): Promise<{ data: { data: TicketMacro[] } }> {
    const url = getFullUrl(`/ticket-macros?active_only=${activeOnly}`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load ticket macros");
}

export async function createTicketMacro(
    token: string,
    data: CreateTicketMacroDTO
): Promise<{ data: TicketMacro }> {
    const url = getFullUrl("/ticket-macros");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create ticket macro");
}

export async function updateTicketMacro(
    token: string,
    id: string,
    data: UpdateTicketMacroDTO
): Promise<{ data: TicketMacro }> {
    const url = getFullUrl(`/ticket-macros/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update ticket macro");
}

export async function deleteTicketMacro(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/ticket-macros/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete ticket macro");
}

export async function applyTicketMacro(
    token: string,
    ticketId: string,
    macroId: string
): Promise<any> {
    const url = getFullUrl(`/tickets/${ticketId}/apply-macro`);
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ macro_id: macroId }),
    });
    return handleResponse(res, "Failed to apply macro");
}
