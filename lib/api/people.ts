import { fetchWithTimeout } from "./api-client";
import { PersonListResponse, SeniorityGroupedResponse } from "@/lib/types/person";

const BASE_URL = () => `${process.env.NEXT_PUBLIC_API_URL}/people`;

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

export async function fetchPeopleForOrganization(
    token: string,
    organizationId: string
): Promise<PersonListResponse> {
    const res = await fetchWithTimeout(`${BASE_URL()}?organization_id=${organizationId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handle<PersonListResponse>(res, "Failed to load people");
}

export async function fetchPeopleGroupedBySeniority(
    token: string,
    organizationId: string
): Promise<SeniorityGroupedResponse> {
    const res = await fetchWithTimeout(
        `${BASE_URL()}?organization_id=${organizationId}&group_by=seniority`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return handle<SeniorityGroupedResponse>(res, "Failed to load org chart");
}
