import api from "@/lib/utils/axiosClient";
import type { AxiosError } from "axios";

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
}

export interface UpdatePipelineRequest extends CreatePipelineRequest { }

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

// API Functions

/**
 * Fetch pipelines with optional filters
 */
export async function fetchPipelines(params?: PipelineQueryParams) {
    const response = await api.get("/pipelines", { params });
    return response.data;
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
