// lib/api/company-intelligence.ts
import { fetchWithTimeout } from "./api-client";
import {
    CompanyIntelligenceSearchPayload,
    CompanyIntelligenceSearchResult,
    CompanyIntelligenceProfileResponse,
    SaveToCrmResponse,
} from "@/lib/types/company-intelligence";

export async function searchCompanyIntelligence(
    token: string,
    payload: CompanyIntelligenceSearchPayload
): Promise<CompanyIntelligenceSearchResult> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to search company intelligence";
        throw new Error(message);
    }

    return json?.data;
}

export async function getCompanyIntelligenceProfile(
    token: string,
    cacheId: string
): Promise<CompanyIntelligenceProfileResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/${cacheId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to get company intelligence profile";
        throw new Error(message);
    }

    return json?.data;
}

export async function saveCompanyToCrm(
    token: string,
    cacheId: string
): Promise<SaveToCrmResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/${cacheId}/save-to-crm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to save company to CRM";
        throw new Error(message);
    }

    return json?.data;
}

export async function getMyTargetCompanies(
    token: string,
    params: {
        industry?: string[];
        location?: string[];
        search?: string;
        page?: number;
        limit?: number;
    }
): Promise<import("@/lib/types/company-intelligence").MyTargetCompaniesResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const query = new URLSearchParams();

    if (params.industry && params.industry.length > 0) {
        params.industry.forEach((ind) => query.append("industry", ind));
    }
    if (params.location && params.location.length > 0) {
        params.location.forEach((loc) => query.append("location", loc));
    }
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    const res = await fetchWithTimeout(
        `${baseUrl}/company-intelligence/my-target-companies?${query.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to get my target companies";
        throw new Error(message);
    }

    return json?.data;
}

export async function deleteTargetCompany(
    token: string,
    id: string
): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/my-target-companies/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to delete target company";
        throw new Error(message);
    }
}

export async function getMyTargetCompany(
    token: string,
    id: string
): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/my-target-companies/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to get target company details";
        throw new Error(message);
    }

    return json?.data;
}
