// lib/api/quotations.ts
// Quotations API functions: CRUD operations for quotations

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
// Helper
// ============================================

async function handleResponse(res: Response, errorMessage: string) {
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    let json;
    try {
        json = await res.json();
    } catch (err) {
        logger.error(`Failed to parse JSON for ${res.url}`, { status: res.status });
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }

    if (!res.ok || (json.success === false)) {
        const errorMsg = json.message || json.error?.message || json.error || errorMessage;
        logger.error(`API Error: ${res.url}`, { status: res.status, json });
        throw new Error(errorMsg);
    }

    return json;
}

function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return `${baseUrl}${path}`;
}

// ============================================
// Functions
// ============================================

/**
 * Create a new quotation.
 */
export async function createQuotation(token: string, quotationData: CreateQuotationData): Promise<any> {
    try {
        const url = getFullUrl("/quotations");

        logger.info("Making POST request to create quotation", {
            url,
            action: quotationData.action
        });

        const res = await fetchWithTimeout(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(quotationData),
        });

        return await handleResponse(res, "Failed to create quotation");
    } catch (error: any) {
        logger.error("createQuotation error:", error);
        throw error;
    }
}

/**
 * Fetch a single quotation by ID.
 */
export async function fetchQuotationById(token: string, quotationId: string): Promise<any> {
    try {
        const url = getFullUrl(`/quotations/${quotationId}`);

        logger.info("Making GET request to fetch quotation", {
            url,
            quotationId
        });

        const res = await fetchWithTimeout(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return await handleResponse(res, "Failed to fetch quotation");
    } catch (error: any) {
        logger.error("fetchQuotationById error:", error);
        throw error;
    }
}
