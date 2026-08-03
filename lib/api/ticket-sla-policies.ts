import { fetchWithTimeout } from "./api-client";
import { TicketSlaPolicy, TicketSlaPriority } from "@/lib/types/TicketSettings";

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

export interface CreateTicketSlaPolicyDTO {
    name: string;
    priority?: TicketSlaPriority | null;
    category_id?: string | null;
    first_response_target_minutes: number;
    resolution_target_minutes: number;
    business_hours_calendar_id?: string | null;
}

export type UpdateTicketSlaPolicyDTO = Partial<CreateTicketSlaPolicyDTO> & { is_active?: boolean };

export async function fetchTicketSlaPolicies(
    token: string,
    activeOnly: boolean = true
): Promise<{ data: { data: TicketSlaPolicy[] } }> {
    const url = getFullUrl(`/ticket-sla-policies?active_only=${activeOnly}`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load SLA policies");
}

export async function createTicketSlaPolicy(
    token: string,
    data: CreateTicketSlaPolicyDTO
): Promise<{ data: TicketSlaPolicy }> {
    const url = getFullUrl("/ticket-sla-policies");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create SLA policy");
}

export async function updateTicketSlaPolicy(
    token: string,
    id: string,
    data: UpdateTicketSlaPolicyDTO
): Promise<{ data: TicketSlaPolicy }> {
    const url = getFullUrl(`/ticket-sla-policies/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update SLA policy");
}

export async function deleteTicketSlaPolicy(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/ticket-sla-policies/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete SLA policy");
}
