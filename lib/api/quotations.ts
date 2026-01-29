// lib/api/quotations.ts
// Quotations API functions: CRUD operations for quotations

import api from "../utils/axiosClient";
import { logger } from "../utils/logger";
import { fetchWithTimeout } from "./api-client";

// ============================================
// Types
// ============================================

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
            throw new Error(error.response.data.message || error.response.data.error?.message || "Failed to create quotation");
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
            throw new Error(error.response.data.message || error.response.data.error?.message || "Failed to update quotation");
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
