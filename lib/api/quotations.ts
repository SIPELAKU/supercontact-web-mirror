// lib/api/quotations.ts
// Quotations API functions: CRUD operations for quotations

import api from "../utils/axiosClient";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

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

export interface QuotationItemData {
    product_id: string;
    quantity: number;
    notes: string;
    discount: number;
}

export interface CreateQuotationData {
    action: "draft" | "publish";
    lead_id: string;
    quotation_title: string;
    expire_date: string; // ISO format
    items: QuotationItemData[];
}

// ============================================
// Functions
// ============================================

/**
 * Create a new quotation using FormData (multipart/form-data).
 */
export async function createQuotation(token: string, formData: FormData): Promise<any> {
    try {
        logger.info("Making POST request to create quotation", {
            action: formData.get("action")
        });

        // Using axiosClient instead of fetch for better body parsing compatibility
        const res = await api.post("/quotations", formData);

        return res.data;
    } catch (error: any) {
        logger.error("createQuotation error:", error);

        // Handle axios error format
        if (error.response?.data) {
            const message = error.response.data.message || error.response.data.error?.message || "Failed to create quotation";
            const err: any = new Error(message);
            err.details = error.response.data.error?.details;
            throw err;
        }
        throw error;
    }
}

/**
 * Update an existing quotation (PUT) using FormData.
 */
export async function updateQuotation(token: string, quotationId: string, formData: FormData): Promise<any> {
    try {
        logger.info("Making PUT request to update quotation", {
            id: quotationId,
            action: formData.get("action")
        });

        // Using axiosClient instead of fetch for better body parsing compatibility
        const res = await api.put(`/quotations/${quotationId}`, formData);

        return res.data;
    } catch (error: any) {
        logger.error("updateQuotation error:", error);

        // Handle axios error format
        if (error.response?.data) {
            const message = error.response.data.message || error.response.data.error?.message || "Failed to update quotation";
            const err: any = new Error(message);
            err.details = error.response.data.error?.details;
            throw err;
        }
        throw error;
    }
}

/**
 * Send quotation email with PDF attachment.
 */
export async function sendQuotationEmail(
    token: string,
    emailData: { to_email: string; subject: string; file: File | Blob }
): Promise<any> {
    try {
        logger.info("Making POST request to send quotation email", {
            to: emailData.to_email
        });

        const formData = new FormData();
        formData.append("to_email", emailData.to_email);
        formData.append("subject", emailData.subject);
        formData.append("file", emailData.file);

        // Axios handles FormData correctly with proper boundaries
        const res = await api.post("/send-email", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return res.data;
    } catch (error: any) {
        logger.error("sendQuotationEmail error:", error);
        if (error.response?.data) {
            throw new Error(error.response.data.message || error.response.data.error?.message || "Failed to send email");
        }
        throw error;
    }
}

/**
 * Fetch a single quotation by ID.
 */
export async function fetchQuotationById(token: string, quotationId: string): Promise<any> {
    try {
        const res = await api.get(`/quotations/${quotationId}`);
        return res.data;
    } catch (error: any) {
        logger.error("fetchQuotationById error:", error);
        if (error.response?.data) {
            throw new Error(error.response.data.message || error.response.data.error?.message || "Failed to fetch quotation");
        }
        throw error;
    }
}

/**
 * Fetch leads for quotation (combined data).
 */
export async function fetchQuotationLeads(token: string, page: number = 1, limit: number = 100, search?: string): Promise<QuotationLeadsResponse> {
    try {
        const params: any = { page, limit };
        if (search && search.trim() !== "") {
            params.search = search;
        }

        const res = await api.get("/quotations/lead", {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data;
    } catch (error: any) {
        logger.error("fetchQuotationLeads error:", error);
        if (error.response?.data) {
            throw new Error(error.response.data.message || error.response.data.error?.message || "Failed to fetch quotation leads");
        }
        throw error;
    }
}
