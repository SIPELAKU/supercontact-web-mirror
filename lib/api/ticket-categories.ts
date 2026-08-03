import { fetchWithTimeout } from "./api-client";
import { TicketCategory } from "@/lib/types/TicketSettings";

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

export async function fetchTicketCategories(
    token: string,
    activeOnly: boolean = true
): Promise<{ data: { data: TicketCategory[] } }> {
    const url = getFullUrl(`/ticket-categories?active_only=${activeOnly}`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load ticket categories");
}

export async function createTicketCategory(
    token: string,
    data: { name: string; display_order?: number }
): Promise<{ data: TicketCategory }> {
    const url = getFullUrl("/ticket-categories");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create ticket category");
}

export async function updateTicketCategory(
    token: string,
    id: string,
    data: { name?: string; display_order?: number; is_active?: boolean }
): Promise<{ data: TicketCategory }> {
    const url = getFullUrl(`/ticket-categories/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update ticket category");
}

export async function deleteTicketCategory(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/ticket-categories/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete ticket category");
}
