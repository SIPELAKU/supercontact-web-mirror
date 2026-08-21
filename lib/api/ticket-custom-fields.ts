import { fetchWithTimeout } from "./api-client";
import {
    TicketCustomFieldDefinition,
    TicketCustomFieldType,
    TicketVisibilityCondition,
} from "@/lib/types/TicketSettings";

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

export interface CreateTicketCustomFieldDTO {
    field_key: string;
    label: string;
    field_type: TicketCustomFieldType;
    select_options?: string[];
    is_required?: boolean;
    display_order?: number;
    visibility_condition?: TicketVisibilityCondition | null;
}

export interface UpdateTicketCustomFieldDTO {
    label?: string;
    select_options?: string[];
    is_required?: boolean;
    is_active?: boolean;
    display_order?: number;
    visibility_condition?: TicketVisibilityCondition | null;
}

export async function fetchTicketCustomFields(
    token: string,
    activeOnly: boolean = true
): Promise<{ data: { data: TicketCustomFieldDefinition[] } }> {
    const url = getFullUrl(`/ticket-custom-fields?active_only=${activeOnly}`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load ticket custom fields");
}

export async function createTicketCustomField(
    token: string,
    data: CreateTicketCustomFieldDTO
): Promise<{ data: TicketCustomFieldDefinition }> {
    const url = getFullUrl("/ticket-custom-fields");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create custom field");
}

export async function updateTicketCustomField(
    token: string,
    id: string,
    data: UpdateTicketCustomFieldDTO
): Promise<{ data: TicketCustomFieldDefinition }> {
    const url = getFullUrl(`/ticket-custom-fields/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update custom field");
}

export async function deleteTicketCustomField(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/ticket-custom-fields/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete custom field");
}
