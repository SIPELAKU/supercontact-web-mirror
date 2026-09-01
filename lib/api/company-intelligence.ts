// lib/api/company-intelligence.ts
import { fetchWithTimeout } from "./api-client";
import {
    CompanyIntelligenceSearchPayload,
    CompanyIntelligenceSearchResult,
    CompanyIntelligenceProfileResponse,
    CompanySocialInfo,
    SaveToCrmResponse,
    CompanyBulkImportPayload,
    CompanyBulkImportResponse,
    CompanyImportJobResponse,
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

export async function enrichCompanySocial(
    token: string,
    cacheId: string,
    pageNameOrUrl: string
): Promise<CompanySocialInfo> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/${cacheId}/enrich-social`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ page_name_or_url: pageNameOrUrl }),
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to look up Facebook/Instagram Page";
        throw new Error(message);
    }

    return json?.data;
}

export async function bulkSaveCompaniesToCrm(
    token: string,
    cacheIds: string[]
): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/save-to-crm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cache_ids: cacheIds }),
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to bulk save companies to CRM";
        throw new Error(message);
    }

    return json?.data;
}

export async function importCompanies(
    token: string,
    payload: CompanyBulkImportPayload
): Promise<CompanyBulkImportResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        // Enqueue validates + dedups up to 5,000 rows synchronously before
        // returning 201 — give it more room than the 45s default.
        timeout: 120000,
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message =
            json?.error?.message || json?.message || "Failed to import companies";
        throw new Error(message);
    }

    return json?.data;
}

export async function getImportJob(
    token: string,
    jobId: string
): Promise<CompanyImportJobResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/bulk/${jobId}`, {
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
            json?.error?.message || json?.message || "Failed to get import job status";
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

export async function getIndividualIntelligence(
    token: string,
    params: import("@/lib/types/individual-intelligence").IndividualIntelligenceParams
): Promise<import("@/lib/types/individual-intelligence").IndividualIntelligenceResponse['data']> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const query = new URLSearchParams();

    if (params.industry) query.append("industry", params.industry);
    if (params.location) query.append("location", params.location);
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    const res = await fetchWithTimeout(
        `${baseUrl}/company-intelligence/individual?${query.toString()}`,
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
            json?.error?.message || json?.message || "Failed to fetch individual intelligence";
        throw new Error(message);
    }

    return json?.data;
}

export async function saveContactsToCrm(
    token: string,
    payload: import("@/lib/types/individual-intelligence").SaveContactsPayload
): Promise<import("@/lib/types/individual-intelligence").SaveContactsResponse['data']> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/company-intelligence/individual/save-to-contact`, {
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
            json?.error?.message || json?.message || "Failed to save contacts to CRM";
        throw new Error(message);
    }

    return json?.data;
}
