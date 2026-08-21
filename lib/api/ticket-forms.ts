// lib/api/ticket-forms.ts
//
// Phase 5 / Inc 7 - ticket forms (admin-configured intake forms):
//   GET    /ticket-forms
//   POST   /ticket-forms          { name, is_active?, display_order?, field_layout }
//   PATCH  /ticket-forms/{id}
//   DELETE /ticket-forms/{id}
//
// A form's `field_layout` is an ordered list of {field, required?} entries where
// `field` is either a built-in ticket field key or a tenant custom field key.
// POST/PATCH answer 409 when the name collides with another form.

import { fetchWithTimeout } from "./api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TicketFormFieldLayoutItem {
    field: string;
    required?: boolean;
}

export interface TicketFormDefinition {
    id: string;
    name: string;
    is_active: boolean;
    display_order: number;
    field_layout: TicketFormFieldLayoutItem[];
}

export interface CreateTicketFormDTO {
    name: string;
    is_active?: boolean;
    display_order?: number;
    field_layout: TicketFormFieldLayoutItem[];
}

export interface UpdateTicketFormDTO {
    name?: string;
    is_active?: boolean;
    display_order?: number;
    field_layout?: TicketFormFieldLayoutItem[];
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
    // 409 = duplicate form name. Surface a friendly, specific message.
    if (res.status === 409) {
        throw new Error("A ticket form with this name already exists.");
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

function unwrap(json: any): any {
    const raw = json?.data;
    if (raw && typeof raw === "object" && "data" in raw) return raw.data;
    return raw ?? json;
}

// ---------------------------------------------------------------------------
// Ticket forms
// ---------------------------------------------------------------------------
export async function fetchTicketForms(token: string): Promise<TicketFormDefinition[]> {
    const res = await fetchWithTimeout(getFullUrl(`/ticket-forms`), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const json = await handleResponse(res, "Failed to load ticket forms");
    const raw = unwrap(json);
    return (Array.isArray(raw) ? raw : []) as TicketFormDefinition[];
}

export async function createTicketForm(
    token: string,
    data: CreateTicketFormDTO
): Promise<TicketFormDefinition> {
    const res = await fetchWithTimeout(getFullUrl(`/ticket-forms`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    const json = await handleResponse(res, "Failed to create ticket form");
    return unwrap(json) as TicketFormDefinition;
}

export async function updateTicketForm(
    token: string,
    id: string,
    data: UpdateTicketFormDTO
): Promise<TicketFormDefinition> {
    const res = await fetchWithTimeout(getFullUrl(`/ticket-forms/${id}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    const json = await handleResponse(res, "Failed to update ticket form");
    return unwrap(json) as TicketFormDefinition;
}

export async function deleteTicketForm(token: string, id: string): Promise<any> {
    const res = await fetchWithTimeout(getFullUrl(`/ticket-forms/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete ticket form");
}
