import { fetchWithTimeout } from "./api-client";
import type {
    PipelineStage,
    PipelineStageCreate,
    PipelineStageUpdate,
} from "@/lib/types/PipelineStage";

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

function authHeaders(token: string) {
    return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

export async function fetchPipelineStages(
    token: string,
    includeInactive = false
): Promise<{ data: { data: PipelineStage[] } }> {
    const res = await fetchWithTimeout(
        getFullUrl(`/pipeline-stages?include_inactive=${includeInactive}`),
        { headers: authHeaders(token) }
    );
    return handleResponse(res, "Failed to load pipeline stages");
}

export async function createPipelineStage(
    token: string,
    data: PipelineStageCreate
): Promise<{ data: PipelineStage }> {
    const res = await fetchWithTimeout(getFullUrl("/pipeline-stages"), {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to create pipeline stage");
}

export async function updatePipelineStage(
    token: string,
    id: string,
    data: PipelineStageUpdate
): Promise<{ data: PipelineStage }> {
    const res = await fetchWithTimeout(getFullUrl(`/pipeline-stages/${id}`), {
        method: "PATCH",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to update pipeline stage");
}

/** The API demands EVERY stage id exactly once, so the order is never ambiguous. */
export async function reorderPipelineStages(
    token: string,
    stageIds: string[]
): Promise<{ data: { data: PipelineStage[] } }> {
    const res = await fetchWithTimeout(getFullUrl("/pipeline-stages/reorder"), {
        method: "PUT",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ stage_ids: stageIds }),
    });
    return handleResponse(res, "Failed to reorder pipeline stages");
}

export async function deletePipelineStage(
    token: string,
    id: string
): Promise<{ data: { message: string } }> {
    const res = await fetchWithTimeout(getFullUrl(`/pipeline-stages/${id}`), {
        method: "DELETE",
        headers: authHeaders(token),
    });
    return handleResponse(res, "Failed to delete pipeline stage");
}
