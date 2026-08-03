import { fetchWithTimeout } from "./api-client";
import api from "@/lib/utils/axiosClient";
import {
    ClosedWonDeal,
    CreateIcpProfilePayload,
    DeriveIcpPayload,
    IcpDeriveResult,
    IcpLookalikesResponse,
    IcpProfileItem,
    IcpProfilesResponse,
} from "@/lib/types/icp";

const BASE_URL = () => `${process.env.NEXT_PUBLIC_API_URL}/icp-profiles`;

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

export async function deriveIcpPreview(
    token: string,
    payload: DeriveIcpPayload
): Promise<IcpDeriveResult> {
    const res = await fetchWithTimeout(`${BASE_URL()}/derive-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<IcpDeriveResult>(res, "Failed to derive ICP preview");
}

export async function createIcpProfile(
    token: string,
    payload: CreateIcpProfilePayload
): Promise<IcpProfileItem> {
    const res = await fetchWithTimeout(BASE_URL(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<IcpProfileItem>(res, "Failed to save ICP profile");
}

export async function fetchIcpProfiles(
    token: string,
    params?: { page?: number; limit?: number }
): Promise<IcpProfilesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetchWithTimeout(`${BASE_URL()}?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<IcpProfilesResponse>(res, "Failed to load ICP profiles");
}

export async function fetchIcpProfile(token: string, id: string): Promise<IcpProfileItem> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<IcpProfileItem>(res, "Failed to load ICP profile");
}

export async function fetchIcpLookalikes(
    token: string,
    id: string,
    params?: { page?: number; limit?: number }
): Promise<IcpLookalikesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetchWithTimeout(`${BASE_URL()}/${id}/lookalikes?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<IcpLookalikesResponse>(res, "Failed to load lookalikes");
}

export async function deleteIcpProfile(token: string, id: string): Promise<{ deleted: boolean; id: string }> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle(res, "Failed to delete ICP profile");
}

// Deals picker source - reuses /pipelines (not a dedicated ICP endpoint),
// filtered to Closed - Won since that's the only stage F10 derives from.
export async function fetchClosedWonDeals(): Promise<ClosedWonDeal[]> {
    const response = await api.get("/pipelines", { params: { deal_stage: ["Closed - Won"] } });
    const pipelines = response.data?.data?.pipelines ?? [];
    return pipelines.map((p: any) => ({
        id: p.id,
        companyLabel: p.contact?.company || p.contact?.name || "Unknown company",
        contactName: p.contact?.name || "",
        productName: p.product?.product_name || "",
        expectedCloseDate: p.expected_close_date,
    }));
}
