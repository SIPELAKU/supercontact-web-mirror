import api from "@/lib/utils/axiosClient";
import type { AxiosError } from "axios";
import type { PipelineAPIItem } from "@/lib/helper/transformPipeline";

// Types
export interface PipelineQueryParams {
    status?: string;
    salesperson?: string;
    date_from?: string;
    date_to?: string;
    assigned_to?: string;
    search?: string;
}

export interface CreatePipelineRequest {
    client_account: string;
    product_id: string;
    deal_stage: string;
    expected_close_date: string;
    quantity: number;
    probability_of_close: number;
    notes: string;
    /**
     * User the deal is assigned to - the avatar on the kanban card. Sent on
     * create and update; the BE also moves the deal's lead to this user.
     * Not in the API spec yet (DEV 1.144.3): until BE adds it, create assigns
     * the logged-in user and update keeps the assignee.
     */
    assigned_to: string;
    /**
     * Lead the deal is created from (the client always comes from a lead), so
     * the BE can store it and keep that lead's assignee in sync. Sent on
     * create only. Not in the API spec yet either.
     */
    lead_id?: string;
}

export interface UpdatePipelineRequest extends CreatePipelineRequest { }

/** The fields of a lead the deal form's Client/Account picker reads. */
export interface DealLead {
    id: string;
    contact_id: string;
    assigned_to: string;
    lead_status: string;
    created_at: string;
    contact?: { id: string; name: string; company?: string | null } | null;
    user?: { id: string; fullname: string } | null;
}

/** Only these leads can become a deal (BO, 2026-10-26). */
export const DEAL_LEAD_STATUSES = ["Contacted", "Qualified"];

export interface UpdatePipelineStageRequest {
    deal_stage: string;
}

export interface ValidationItem {
    type: string;
    loc: string[];
    msg: string;
    input?: unknown;
}

export interface PipelineValidationResponse {
    error: string;
    details: ValidationItem[];
}

export type PipelineDealStatus = "active" | "expired" | "won" | "lost";

/**
 * The filters the kanban board is loaded with. "Load more" on a column must
 * resend exactly the same ones (the BE ties each cursor to them).
 */
export interface PipelineBoardFilters {
    search?: string;
    assigned_to?: string[];
    /**
     * Deal status. `expired` = an open stage past its expected close date,
     * marked by an hourly BE job; won/lost deals are never active or expired.
     */
    status?: PipelineDealStatus[];
    /** `expected_close_date` range, both ends inclusive. */
    date_from?: string;
    date_to?: string;
}

export interface PipelineMetricResponse {
    value: number;
    percent: number;
    trend: string;
}

export interface PipelineStatsResponse {
    total_pipeline: PipelineMetricResponse;
    avg_pipeline: PipelineMetricResponse;
    winrate_pipeline: PipelineMetricResponse;
}

/** One kanban column from `GET /pipelines/board`. */
export interface PipelineBoardStage {
    name: string;
    outcome: "open" | "won" | "lost";
    display_order: number | null;
    /** Every deal in the column that matches the filters, not only `deals`. */
    count: number;
    /** Total of those same deals: a Decimal as a string, e.g. "1500.00". */
    total_amount: string;
    deals: PipelineAPIItem[];
    /** Cursor for `GET /pipelines/board/column`; null = nothing more to load. */
    next_cursor: string | null;
}

export interface PipelineBoardResponse {
    stats: PipelineStatsResponse;
    stages: PipelineBoardStage[];
}

export interface PipelineBoardColumnResponse {
    deals: PipelineAPIItem[];
    next_cursor: string | null;
}

/** Deals per column on the first load, and per "Load more" (the BE caps both at 50). */
// TEMP for manual testing of Load More: back to 20 before committing.
export const BOARD_PAGE_SIZE = 5;

type QueryValue = string | number | string[] | null | undefined;

/**
 * Query string for the board endpoints. Built by hand: axios would send an
 * array as `key[]=...`, which FastAPI does not read - it expects the key
 * repeated. Empty values are left out.
 */
export function toBoardQuery(params: Record<string, QueryValue>): URLSearchParams {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];
        values.forEach((item) => {
            if (item === null || item === undefined || String(item).trim() === "") return;
            query.append(key, String(item));
        });
    });
    return query;
}

/**
 * A 400 on `cursor`: the cursor no longer matches the filters it was made
 * for, so the board has to be loaded again.
 */
export function isStaleCursorError(error: unknown): boolean {
    const response = (error as AxiosError<any>)?.response;
    return response?.status === 400 && response.data?.error?.details?.field === "cursor";
}

// API Functions

/**
 * Fetch pipelines with optional filters
 */
export async function fetchPipelines(params?: PipelineQueryParams) {
    const response = await api.get("/pipelines", { params });
    return response.data;
}

/**
 * The kanban board in one request: every stage column with its first deals,
 * its count and total, plus the stats cards.
 */
export async function fetchPipelineBoard(filters: PipelineBoardFilters): Promise<PipelineBoardResponse> {
    const params = toBoardQuery({ ...filters, per_stage: BOARD_PAGE_SIZE });
    const response = await api.get("/pipelines/board", { params });
    return response.data?.data;
}

/** "Load more" for one column: the deals after `cursor`, under the board's filters. */
export async function fetchPipelineBoardColumn(
    filters: PipelineBoardFilters,
    dealStage: string,
    cursor: string
): Promise<PipelineBoardColumnResponse> {
    const params = toBoardQuery({ ...filters, deal_stage: dealStage, cursor, limit: BOARD_PAGE_SIZE });
    const response = await api.get("/pipelines/board/column", { params });
    return response.data?.data;
}

/**
 * Fetch a single pipeline by ID
 */
export async function fetchPipelineById(id: string) {
    const response = await api.get(`/pipelines/${id}`);
    return response.data;
}

/**
 * Fetch active users for filtering
 */
export async function fetchActiveUsers() {
    const response = await api.get("/pipelines/active-users");
    return response.data;
}

/**
 * Leads for the deal form's Client/Account picker: a deal's client always
 * comes from a lead, which brings its contact and its assignee.
 */
export async function fetchDealLeads(search?: string, assignedTo?: string): Promise<DealLead[]> {
    // Built by hand: axios would send an array as `lead_status[]=...`, which
    // FastAPI does not read - it expects the key repeated.
    const params = new URLSearchParams({ limit: "100" });
    DEAL_LEAD_STATUSES.forEach((status) => params.append("lead_status", status));
    if (search) params.append("search", search);
    // A sales user only picks their own leads.
    if (assignedTo) params.append("assigned_to", assignedTo);

    const response = await api.get("/leads", { params });
    return response.data?.data?.leads ?? [];
}

/**
 * Create a new pipeline
 */
export async function createPipeline(data: CreatePipelineRequest) {
    try {
        const response = await api.post("/pipelines", data);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        const axiosErr = error as AxiosError<any>;
        if (axiosErr.response?.data?.error) {
            const errorData = axiosErr.response.data.error;
            return {
                success: false,
                error: typeof errorData === 'object' ? errorData.message : errorData,
                validation: errorData.details,
            };
        }
        return {
            success: false,
            error:
                axiosErr.message ??
                "Failed to create pipeline",
        };
    }
}

/**
 * Update an existing pipeline
 */
export async function updatePipeline(id: string, data: UpdatePipelineRequest) {
    try {
        const response = await api.put(`/pipelines/${id}`, data);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        const axiosErr = error as AxiosError<any>;
        if (axiosErr.response?.data?.error) {
            const errorData = axiosErr.response.data.error;
            return {
                success: false,
                error: typeof errorData === 'object' ? errorData.message : errorData,
                validation: errorData.details,
            };
        }
        return {
            success: false,
            error:
                axiosErr.message ??
                "Failed to update pipeline",
        };
    }
}

/**
 * Update pipeline stage (for drag-and-drop)
 */
export async function updatePipelineStage(
    id: string,
    data: UpdatePipelineStageRequest
) {
    const response = await api.patch(`/pipelines/${id}/stage`, data);
    return response.data;
}
