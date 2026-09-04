// lib/api/quotations.ts
// Quotations API functions: CRUD, defaults, preview and status transitions.

import api from "../utils/axiosClient";
import { logger } from "../utils/logger";
import type {
    Quotation,
    QuotationDefaults,
    QuotationDetail,
    QuotationPreviewRequest,
    QuotationStatusTransition,
    QuotationTotals,
} from "../types/Quotation";

// ============================================
// Types
// ============================================

export interface ApiEnvelope<T> {
    success: boolean;
    data: T;
    error: unknown;
}

/**
 * Every thrown error carries the API's `error.code` and `error.details`
 * alongside its message, so a form can tell a discount-policy refusal
 * (DISCOUNT_POLICY_VIOLATION, per-row details) from a plain validation error.
 */
export interface QuotationApiError extends Error {
    code?: string;
    details?: unknown;
    status?: number;
}

export interface QuotationLeadItem {
    id: string;
    product_name: string;
    sku: string;
    price: string;
    quantity: number;
    total: string;
    notes: string;
}

export interface QuotationLead {
    id: string;
    contact_id: string;
    office_location: string;
    assigned_to: string;
    contact: {
        id: string;
        name: string;
        email: string;
        phone_number: string;
        company: string;
    };
    user: {
        id: string;
        fullname: string;
        email: string;
    };
    items: QuotationLeadItem[];
}

export interface QuotationLeadsResponse {
    success: boolean;
    data: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        leads: QuotationLead[];
    };
    error: any;
}

// ============================================
// Helpers
// ============================================

function toApiError(error: any, fallback: string): QuotationApiError {
    const payload = error?.response?.data;
    if (payload && typeof payload === "object") {
        const message =
            payload.error?.message || payload.message || payload.detail || fallback;
        const err: QuotationApiError = new Error(message);
        err.code = payload.error?.code;
        err.details = payload.error?.details;
        err.status = error.response?.status;
        return err;
    }
    if (error instanceof Error) return error;
    return new Error(fallback);
}

// ============================================
// Functions
// ============================================

/**
 * Create a new quotation using FormData (multipart/form-data).
 */
export async function createQuotation(
    token: string,
    formData: FormData
): Promise<ApiEnvelope<Quotation>> {
    try {
        logger.info("Making POST request to create quotation", {
            action: formData.get("action"),
        });
        // axiosClient handles the multipart boundary itself.
        const res = await api.post("/quotations", formData);
        return res.data;
    } catch (error: any) {
        logger.error("createQuotation error:", error);
        throw toApiError(error, "Failed to create quotation");
    }
}

/**
 * Update an existing quotation (PUT) using FormData. Draft only.
 */
export async function updateQuotation(
    token: string,
    quotationId: string,
    formData: FormData
): Promise<ApiEnvelope<Quotation>> {
    try {
        logger.info("Making PUT request to update quotation", {
            id: quotationId,
            action: formData.get("action"),
        });
        const res = await api.put(`/quotations/${quotationId}`, formData);
        return res.data;
    } catch (error: any) {
        logger.error("updateQuotation error:", error);
        throw toApiError(error, "Failed to update quotation");
    }
}

/**
 * Delete a quotation by ID (permanent).
 */
export async function deleteQuotation(quotationId: string): Promise<any> {
    try {
        logger.info("Making DELETE request to delete quotation", { id: quotationId });
        const res = await api.delete(`/quotations/${quotationId}`);
        return res.data;
    } catch (error: any) {
        logger.error("deleteQuotation error:", error);
        throw toApiError(error, "Failed to delete quotation");
    }
}

/**
 * Fetch a single quotation by ID.
 */
export async function fetchQuotationById(
    token: string,
    quotationId: string
): Promise<ApiEnvelope<QuotationDetail>> {
    try {
        const res = await api.get(`/quotations/${quotationId}`);
        return res.data;
    } catch (error: any) {
        logger.error("fetchQuotationById error:", error);
        throw toApiError(error, "Failed to fetch quotation");
    }
}

/**
 * The company's quotation defaults (currency, tax basis, terms, discount cap).
 * Sellers never call GET /companies - this route is gated on `quotations`.
 */
export async function fetchQuotationDefaults(token: string): Promise<QuotationDefaults> {
    try {
        const res = await api.get<ApiEnvelope<QuotationDefaults>>("/quotations/defaults");
        return res.data.data;
    } catch (error: any) {
        logger.error("fetchQuotationDefaults error:", error);
        throw toApiError(error, "Failed to fetch quotation defaults");
    }
}

/**
 * Server-computed totals for a payload, without saving. Errors are the same
 * as create (policy 400, archived product 400, unknown product 404).
 */
export async function previewQuotationTotals(
    token: string,
    body: QuotationPreviewRequest
): Promise<QuotationTotals> {
    try {
        const res = await api.post<ApiEnvelope<QuotationTotals>>("/quotations/preview", body);
        return res.data.data;
    } catch (error: any) {
        logger.error("previewQuotationTotals error:", error);
        throw toApiError(error, "Failed to preview quotation totals");
    }
}

/**
 * `sent -> accepted | rejected`. Anything else is a 400 INVALID_STATUS_TRANSITION.
 */
export async function transitionQuotationStatus(
    token: string,
    quotationId: string,
    body: QuotationStatusTransition
): Promise<Quotation> {
    try {
        logger.info("Making POST request to transition quotation status", {
            id: quotationId,
            status: body.status,
        });
        const res = await api.post<ApiEnvelope<Quotation>>(
            `/quotations/${quotationId}/status`,
            body
        );
        return res.data.data;
    } catch (error: any) {
        logger.error("transitionQuotationStatus error:", error);
        throw toApiError(error, "Failed to update quotation status");
    }
}

/**
 * Fetch leads for quotation (combined data).
 */
export async function fetchQuotationLeads(
    token: string,
    page: number = 1,
    limit: number = 100,
    search?: string
): Promise<QuotationLeadsResponse> {
    try {
        const params: any = { page, limit };
        if (search && search.trim() !== "") {
            params.search = search;
        }

        const res = await api.get("/quotations/lead", {
            params,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error: any) {
        logger.error("fetchQuotationLeads error:", error);
        throw toApiError(error, "Failed to fetch quotation leads");
    }
}
