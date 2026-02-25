// lib/api/billings.ts
// Billing and Subscription API functions

import { fetchWithTimeout } from "./api-client";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

export interface BillingPlan {
    id: string;
    code: string;
    name: string;
    description: string;
    price: string;
    currency: string;
    billing_interval: string;
    duration_days: number;
    is_active: boolean;
}

export interface BillingPlansResponse {
    success: boolean;
    data: BillingPlan[];
    error: string | null;
}

export interface CurrentBilling {
    company_plan_id: string;
    plan_id: string;
    plan_name: string;
    plan_code: string;
    plan_status: string;
    starts_at: string;
    expires_at: string;
    auto_renew: boolean;
    is_current: boolean;
}

export interface CurrentBillingResponse {
    success: boolean;
    data: CurrentBilling | null;
    error: string | null;
}

export interface CheckoutResponseData {
    payment_transaction_id: string;
    order_id: string;
    status: string;
    midtrans_token: string;
    midtrans_redirect_url: string;
}

export interface CheckoutResponse {
    success: boolean;
    data: CheckoutResponseData;
    error: string | null;
}

export interface CheckoutRequestPayload {
    plan_id: string;
}

// ============================================
// Functions
// ============================================

export async function fetchBillingPlans(token: string): Promise<BillingPlansResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/billings/plans`;
    logger.info("Making GET request to fetch billing plans", { url });

    const res = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    const json = await res.json();
    logger.apiResponse("/billings/plans (GET)", { status: res.status, response: json });

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
        logger.error(`Fetch billing plans failed: ${res.status}`, { json });
        throw new Error(json.message || "Failed to load billing plans");
    }

    return json;
}

export async function fetchCurrentBilling(token: string): Promise<CurrentBillingResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/billings/current`;
    logger.info("Making GET request to fetch current billing", { url });

    const res = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    const json = await res.json();
    logger.apiResponse("/billings/current (GET)", { status: res.status, response: json });

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
        logger.error(`Fetch current billing failed: ${res.status}`, { json });
        throw new Error(json.message || "Failed to load current billing");
    }

    return json;
}

export async function checkoutBillingPlan(token: string, payload: CheckoutRequestPayload): Promise<CheckoutResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/billings/checkout`;
    logger.info("Making POST request for billing checkout", { url, payload });

    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
    });

    const json = await res.json();
    logger.apiResponse("/billings/checkout (POST)", { status: res.status, response: json });

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
        logger.error(`Checkout billing plan failed: ${res.status}`, { json });
        throw new Error(json.message || "Failed to initiate checkout");
    }

    return json;
}
