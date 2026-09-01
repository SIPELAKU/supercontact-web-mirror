import { fetchWithTimeout } from "./api-client";

const BASE_URL = () => `${process.env.NEXT_PUBLIC_API_URL}/verification`;

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

export type VerificationTargetType = "cache" | "crm_company" | "person";

export type VerificationKind = "email" | "phone";

export interface VerificationResultItem {
    kind: VerificationKind;
    status: string;
    line_type: string | null;
    checked_at: string;
    cached: boolean;
}

export interface VerifyContactPayload {
    target_type: VerificationTargetType;
    target_id: string;
    kinds?: VerificationKind[];
}

export async function verifyContact(
    token: string,
    payload: VerifyContactPayload
): Promise<{ results: VerificationResultItem[] }> {
    const res = await fetchWithTimeout(`${BASE_URL()}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    return handle<{ results: VerificationResultItem[] }>(res, "Failed to verify contact");
}
