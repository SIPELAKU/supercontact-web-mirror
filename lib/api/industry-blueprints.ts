import { fetchWithTimeout } from "./api-client";
import type {
    ActivationChecklist,
    BlueprintDetail,
    BlueprintInstallReport,
    BlueprintSummary,
    InstalledBlueprint,
} from "@/lib/types/IndustryBlueprint";

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

export async function fetchBlueprints(
    token: string
): Promise<{ data: BlueprintSummary[] }> {
    const res = await fetchWithTimeout(getFullUrl("/industry-blueprints"), {
        headers: authHeaders(token),
    });
    return handleResponse(res, "Failed to load industry blueprints");
}

export async function fetchBlueprint(
    token: string,
    blueprintId: string
): Promise<{ data: BlueprintDetail }> {
    const res = await fetchWithTimeout(
        getFullUrl(`/industry-blueprints/${blueprintId}`),
        { headers: authHeaders(token) }
    );
    return handleResponse(res, "Failed to load blueprint");
}

/**
 * Same endpoint for preview and install. `dryRun` is what separates them, and
 * it is the caller's job to run the preview first - a dry run performs the
 * identical checks and reports the identical diff without writing anything.
 */
export async function installBlueprint(
    token: string,
    blueprintId: string,
    payload: {
        modules?: string[] | null;
        variables?: Record<string, string>;
        dry_run: boolean;
    }
): Promise<{ data: BlueprintInstallReport }> {
    const res = await fetchWithTimeout(
        getFullUrl(`/industry-blueprints/${blueprintId}/install`),
        {
            method: "POST",
            headers: { ...authHeaders(token), "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );
    return handleResponse(res, "Failed to install blueprint");
}

export async function fetchInstalledBlueprints(
    token: string
): Promise<{ data: InstalledBlueprint[] }> {
    const res = await fetchWithTimeout(
        getFullUrl("/industry-blueprints/state/installed"),
        { headers: authHeaders(token) }
    );
    return handleResponse(res, "Failed to load installed blueprints");
}

export async function fetchActivationChecklist(
    token: string
): Promise<{ data: ActivationChecklist }> {
    const res = await fetchWithTimeout(
        getFullUrl("/industry-blueprints/state/activation-checklist"),
        { headers: authHeaders(token) }
    );
    return handleResponse(res, "Failed to load activation checklist");
}
