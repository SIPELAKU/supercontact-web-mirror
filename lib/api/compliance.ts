import { fetchWithTimeout } from "./api-client";
import {
    CreateDsrRequestPayload,
    CreateSuppressionEntryPayload,
    DsrRequestItem,
    DsrRequestsResponse,
    DsrRequestStatus,
    SuppressionEntriesResponse,
    SuppressionEntryItem,
} from "@/lib/types/compliance";

const BASE_URL = () => `${process.env.NEXT_PUBLIC_API_URL}/compliance`;

function buildError(json: any, fallback: string) {
    const message =
        typeof json?.error === "string" ? json.error : json?.error?.message || json?.message || fallback;
    return new Error(message);
}

async function handle<T>(res: Response, fallback: string): Promise<T> {
    const json = await res.json();
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok || json?.success === false) throw buildError(json, fallback);
    return json?.data as T;
}

export async function fetchSuppressionEntries(
    token: string,
    params?: { page?: number; limit?: number }
): Promise<SuppressionEntriesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetchWithTimeout(`${BASE_URL()}/suppression?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<SuppressionEntriesResponse>(res, "Failed to load suppression list");
}

export async function createSuppressionEntry(
    token: string,
    payload: CreateSuppressionEntryPayload
): Promise<SuppressionEntryItem> {
    const res = await fetchWithTimeout(`${BASE_URL()}/suppression`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<SuppressionEntryItem>(res, "Failed to add suppression entry");
}

export async function deleteSuppressionEntry(
    token: string,
    id: string
): Promise<{ deleted: boolean; id: string }> {
    const res = await fetchWithTimeout(`${BASE_URL()}/suppression/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle(res, "Failed to remove suppression entry");
}

export async function fetchDsrRequests(
    token: string,
    params?: { page?: number; limit?: number; status?: DsrRequestStatus }
): Promise<DsrRequestsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);

    const res = await fetchWithTimeout(`${BASE_URL()}/dsr?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<DsrRequestsResponse>(res, "Failed to load data subject requests");
}

export async function createDsrRequest(
    token: string,
    payload: CreateDsrRequestPayload
): Promise<DsrRequestItem> {
    const res = await fetchWithTimeout(`${BASE_URL()}/dsr`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<DsrRequestItem>(res, "Failed to log request");
}

export async function updateDsrRequestStatus(
    token: string,
    id: string,
    status: DsrRequestStatus
): Promise<DsrRequestItem> {
    const res = await fetchWithTimeout(`${BASE_URL()}/dsr/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
    });
    return handle<DsrRequestItem>(res, "Failed to update request status");
}
