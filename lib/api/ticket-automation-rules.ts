import { fetchWithTimeout } from "./api-client";
import { TicketAutomationRule, TicketAutomationTriggerType, TicketConditionClause, TicketAutomationAction } from "@/lib/types/TicketAutomation";

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

export interface CreateTicketAutomationRuleDTO {
    name: string;
    trigger_type: TicketAutomationTriggerType;
    priority?: number;
    is_enabled?: boolean;
    conditions: { all: TicketConditionClause[] };
    actions: TicketAutomationAction[];
}

export type UpdateTicketAutomationRuleDTO = Partial<CreateTicketAutomationRuleDTO>;

export async function fetchTicketAutomationRules(
    token: string
): Promise<{ data: { data: TicketAutomationRule[] } }> {
    const url = getFullUrl("/ticket-automation-rules");
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load automation rules");
}

export async function createTicketAutomationRule(
    token: string,
    data: CreateTicketAutomationRuleDTO
): Promise<{ data: TicketAutomationRule }> {
    const url = getFullUrl("/ticket-automation-rules");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create automation rule");
}

export async function updateTicketAutomationRule(
    token: string,
    id: string,
    data: UpdateTicketAutomationRuleDTO
): Promise<{ data: TicketAutomationRule }> {
    const url = getFullUrl(`/ticket-automation-rules/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update automation rule");
}

export async function deleteTicketAutomationRule(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/ticket-automation-rules/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete automation rule");
}

// ---- Auto-close solved tickets setting (companies.auto_close_solved_days) ----

export interface AutoCloseSetting {
    // null or 0 = disabled; a positive value 1..365 = close Solved tickets after
    // that many days.
    auto_close_solved_days: number | null;
}

export async function fetchAutoCloseSetting(
    token: string
): Promise<{ data: AutoCloseSetting }> {
    const url = getFullUrl("/ticket-automation-rules/auto-close");
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load auto-close setting");
}

export async function updateAutoCloseSetting(
    token: string,
    auto_close_solved_days: number | null
): Promise<{ data: AutoCloseSetting }> {
    const url = getFullUrl("/ticket-automation-rules/auto-close");
    const res = await fetchWithTimeout(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ auto_close_solved_days }),
    });
    return handleResponse(res, "Failed to update auto-close setting");
}
