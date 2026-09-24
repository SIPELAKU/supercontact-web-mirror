// lib/api/person-intelligence.ts
import { fetchWithTimeout } from "./api-client";
import {
    EnrichmentCreditBalanceResponse,
    PersonDetailResponse,
    PersonEnrichmentJobCreateRequest,
    PersonEnrichmentJobResponse,
    PersonEnrichmentJobStatusResponse,
    PersonSearchRequest,
    PersonSearchResponse,
} from "@/lib/types/person-intelligence";

async function readEnvelope<T>(res: Response, action: string): Promise<T> {
    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok || json?.success === false) {
        const message = json?.error?.message || json?.message || `Failed to ${action}`;
        throw new Error(message);
    }

    return json?.data as T;
}

export async function searchPersons(
    token: string,
    payload: PersonSearchRequest
): Promise<PersonSearchResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/person-intelligence/person/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return readEnvelope<PersonSearchResponse>(res, "search people");
}

export async function getPersonDetail(
    token: string,
    personId: string
): Promise<PersonDetailResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/person-intelligence/person/${personId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return readEnvelope<PersonDetailResponse>(res, "get person detail");
}

export async function createPersonEnrichmentJob(
    token: string,
    payload: PersonEnrichmentJobCreateRequest
): Promise<PersonEnrichmentJobResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/person-intelligence/enrichment/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return readEnvelope<PersonEnrichmentJobResponse>(res, "queue enrichment");
}

export async function getPersonEnrichmentJob(
    token: string,
    jobId: string
): Promise<PersonEnrichmentJobStatusResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/person-intelligence/enrichment/jobs/${jobId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return readEnvelope<PersonEnrichmentJobStatusResponse>(res, "get enrichment job status");
}

export async function getEnrichmentCreditBalance(
    token: string
): Promise<EnrichmentCreditBalanceResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetchWithTimeout(`${baseUrl}/person-intelligence/credit`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return readEnvelope<EnrichmentCreditBalanceResponse>(res, "get credit balance");
}
