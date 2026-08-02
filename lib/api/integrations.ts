import {
    Integration,
    IntegrationConnectionLogResponse,
    IntegrationListResponse,
    IntegrationResponse,
    TestConnectionResponse,
} from "../models/types";
import { fetchWithTimeout } from "./api-client";

function buildError(json: any, fallback: string) {
    const errorMessage =
        typeof json.error === "string"
            ? json.error
            : json.error?.message || json.message || fallback;
    const error = new Error(errorMessage) as any;
    error.data = json;
    return error;
}

export async function fetchIntegrations(token: string): Promise<IntegrationListResponse> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw buildError(json, "Failed to load integrations");

    return json;
}

export async function createIntegration(
    token: string,
    data: Partial<Integration>
): Promise<IntegrationResponse> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw buildError(json, "Failed to create integration");

    return json;
}

export async function updateIntegration(
    token: string,
    id: string,
    data: Partial<Integration>
): Promise<IntegrationResponse> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/integrations/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw buildError(json, "Failed to update integration");

    return json;
}

export async function deleteIntegration(token: string, id: string) {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/integrations/${id}`, {
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
    if (!res.ok) throw buildError(json, "Failed to delete integration");

    return json;
}

export async function testIntegrationConnection(
    token: string,
    id: string
): Promise<TestConnectionResponse> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/${id}/test-connection`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw buildError(json, "Failed to test connection");

    return json;
}

export async function fetchIntegrationConnectionLog(
    token: string,
    id: string
): Promise<IntegrationConnectionLogResponse> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/${id}/latest-connection-log`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw buildError(json, "Failed to fetch connection log");

    return json;
}
