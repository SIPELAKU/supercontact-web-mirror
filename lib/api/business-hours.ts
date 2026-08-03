import { fetchWithTimeout } from "./api-client";
import { BusinessHoursCalendar, WeekdayHours } from "@/lib/types/TicketSettings";

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

export interface CreateBusinessHoursDTO {
    name: string;
    timezone: string;
    weekly_hours: Record<string, WeekdayHours>;
    is_default?: boolean;
}

export type UpdateBusinessHoursDTO = Partial<CreateBusinessHoursDTO>;

export async function fetchBusinessHours(
    token: string
): Promise<{ data: { data: BusinessHoursCalendar[] } }> {
    const url = getFullUrl("/ticket-business-hours");
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load business hours calendars");
}

export async function createBusinessHours(
    token: string,
    data: CreateBusinessHoursDTO
): Promise<{ data: BusinessHoursCalendar }> {
    const url = getFullUrl("/ticket-business-hours");
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create business hours calendar");
}

export async function updateBusinessHours(
    token: string,
    id: string,
    data: UpdateBusinessHoursDTO
): Promise<{ data: BusinessHoursCalendar }> {
    const url = getFullUrl(`/ticket-business-hours/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update business hours calendar");
}

export async function deleteBusinessHours(token: string, id: string): Promise<any> {
    const url = getFullUrl(`/ticket-business-hours/${id}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete business hours calendar");
}
