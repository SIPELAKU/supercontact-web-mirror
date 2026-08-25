import { fetchWithTimeout } from "./api-client";

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

export interface SalesSettings {
    /** What this company chose. */
    enabled: boolean;
    /** Whether the deployment permits the sales layer at all - not ours to set. */
    platform_enabled: boolean;
    /** Both switches agree: this is what is actually running. */
    effective: boolean;
    enabled_at: string | null;
    enabled_by_id: string | null;
    note: string | null;
}

export async function fetchSalesSettings(token: string): Promise<{ data: SalesSettings }> {
    const res = await fetchWithTimeout(getFullUrl("/sales-settings"), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Gagal memuat pengaturan asisten penjualan");
}

export async function updateSalesSettings(
    token: string,
    data: { enabled: boolean; note?: string | null }
): Promise<{ data: SalesSettings; message?: string }> {
    const res = await fetchWithTimeout(getFullUrl("/sales-settings"), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Gagal menyimpan pengaturan asisten penjualan");
}
