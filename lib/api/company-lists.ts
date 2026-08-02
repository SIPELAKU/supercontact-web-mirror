import { fetchWithTimeout } from "./api-client";
import {
    CompanyListItem,
    CompanyListMembersResponse,
    CompanyListsResponse,
    CreateCompanyListPayload,
    UpdateCompanyListPayload,
} from "@/lib/types/company-list";

const BASE_URL = () => `${process.env.NEXT_PUBLIC_API_URL}/company-lists`;

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

export async function fetchCompanyLists(
    token: string,
    params?: { page?: number; limit?: number }
): Promise<CompanyListsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetchWithTimeout(`${BASE_URL()}?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<CompanyListsResponse>(res, "Failed to load lists");
}

export async function fetchCompanyList(token: string, id: string): Promise<CompanyListItem> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<CompanyListItem>(res, "Failed to load list");
}

export async function createCompanyList(
    token: string,
    payload: CreateCompanyListPayload
): Promise<CompanyListItem> {
    const res = await fetchWithTimeout(BASE_URL(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<CompanyListItem>(res, "Failed to create list");
}

export async function updateCompanyList(
    token: string,
    id: string,
    payload: UpdateCompanyListPayload
): Promise<CompanyListItem> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<CompanyListItem>(res, "Failed to update list");
}

export async function deleteCompanyList(token: string, id: string): Promise<{ deleted: boolean; id: string }> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle(res, "Failed to delete list");
}

export async function fetchCompanyListMembers(
    token: string,
    id: string,
    params?: { page?: number; limit?: number }
): Promise<CompanyListMembersResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetchWithTimeout(`${BASE_URL()}/${id}/members?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<CompanyListMembersResponse>(res, "Failed to load list members");
}

export async function addCompanyListMembers(
    token: string,
    id: string,
    crmCompanyIds: string[]
): Promise<{ added_count: number }> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ crm_company_ids: crmCompanyIds }),
    });
    return handle(res, "Failed to add members");
}

export async function removeCompanyListMember(
    token: string,
    id: string,
    crmCompanyId: string
): Promise<{ removed: boolean }> {
    const res = await fetchWithTimeout(`${BASE_URL()}/${id}/members/${crmCompanyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle(res, "Failed to remove member");
}
