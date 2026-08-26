import { MailServerResponse, MailServerConnectionLogResponse, TestConnectionResponse } from "../models/types";
import { fetchWithTimeout } from "./api-client";

export async function fetchMailServers(
    token: string,
    page: number,
    limit: number,
    search?: string
): Promise<MailServerResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search) params.append("search", search);

    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) throw new Error("Failed to load mail servers");

    return json;
}

// Placeholder for other CRUD operations
export async function createMailServer(token: string, data: any) {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers`, {
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

    if (!res.ok) {
        const errorMessage = typeof json.error === 'string'
            ? json.error
            : (json.error?.message || json.message || "Failed to create mail server");
        const error = new Error(errorMessage) as any;
        error.data = json;
        throw error;
    }

    return json;
}

export async function updateMailServer(token: string, id: string, data: any) {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers/${id}`, {
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

    if (!res.ok) {
        const errorMessage = typeof json.error === 'string'
            ? json.error
            : (json.error?.message || json.message || "Failed to update mail server");
        const error = new Error(errorMessage) as any;
        error.data = json;
        throw error;
    }

    return json;
}

export async function updateMailServerStatus(token: string, id: string, data: any) {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers/${id}/status`, {
        method: "PATCH",
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

    if (!res.ok) {
        const errorMessage = typeof json.error === 'string'
            ? json.error
            : (json.error?.message || json.message || "Failed to update mail server status");
        const error = new Error(errorMessage) as any;
        error.data = json;
        throw error;
    }

    return json;
}

export async function deleteMailServer(token: string, id: string) {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers/${id}`, {
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

    if (!res.ok) {
        const errorMessage = typeof json.error === 'string'
            ? json.error
            : (json.error?.message || json.message || "Failed to delete mail server");
        const error = new Error(errorMessage) as any;
        error.data = json;
        throw error;
    }

    return json;
}

export async function fetchMailServerConnectionLog(token: string, mailServerId: string): Promise<MailServerConnectionLogResponse> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers/${mailServerId}/latest-connection-log`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (res.status === 404) {
        // Should we throw or return a specific structure? 
        // The requirement says: "Jika belum ada log koneksi, mengembalikan `null` (data: null)."
        // But 404 might also mean mail server not found. 
        // Let's rely on the backend response structure for now, assuming 404 might return specific error or just standard error.
        // If the API returns standard error structure, json will match MailServerConnectionLogResponse(error).
    }

    if (!res.ok) {
        // For now, I will throw error with message from backend
        const errorMessage = json.error?.message || json.message || "Failed to fetch connection log";
        const error = new Error(errorMessage) as any;
        error.data = json;
        throw error;
    }

    return json;
}

export async function testMailServerConnection(token: string, mailServerId: string): Promise<TestConnectionResponse> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers/${mailServerId}/test-connection`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
        // If 400 or other errors, backend might return { error: { message: ... } } or { message: ... }
        const errorMessage = json.error?.message || json.message || "Failed to test connection";
        const error = new Error(errorMessage) as any;
        error.data = json;
        throw error;
    }

    return json;
}

export async function setUsePlatformSender(
    token: string,
    enabled: boolean
): Promise<{ success: boolean; message?: string }> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/mail-servers/use-platform-sender`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
        throw new Error(json.error?.message || json.message || "Gagal mengubah pengirim");
    }
    return json;
}
