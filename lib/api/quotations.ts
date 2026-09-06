// lib/api/quotations.ts
// Quotations API functions: CRUD, defaults, preview and status transitions.

import api from "../utils/axiosClient";
import { logger } from "../utils/logger";
import type {
    Quotation,
    QuotationApproval,
    QuotationApprovalListResponse,
    QuotationApprovalStatus,
    QuotationDefaults,
    QuotationDelivery,
    QuotationDetail,
    QuotationPreviewRequest,
    QuotationSendChannel,
    QuotationSendResponse,
    QuotationStatusTransition,
    QuotationTotals,
    QuotationWhatsappSender,
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
    /** Phase 1: ProductItem inherits the catalogue briefs (spec D5 / S3-12). */
    unit?: { id: string; code: string; name: string; precision: number } | null;
    category?: { id: string; code: string; name: string } | null;
    custom_fields?: Record<string, unknown>;
    /**
     * Phase 2 (spec D6): what this customer would actually pay. `price` above
     * stays the LIVE catalogue row - showing one price in the picker and
     * another on the line is the defect this phase exists to remove.
     */
    resolved_unit_price?: string | null;
    price_source?: string | null;
    price_list?: { id: string; code: string; name: string } | null;
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
        /** Phase 3 (spec D5): the PDF's address fallback. */
        address?: string | null;
    };
    user: {
        id: string;
        fullname: string;
        email: string;
    };
    items: QuotationLeadItem[];
    /**
     * Phase 3 (spec D5): the picker's briefs, so the form can show the
     * customer's commercial context before a quotation exists. All optional.
     */
    crm_company?: {
        id: string;
        name: string | null;
        npwp?: string | null;
        address_line?: string | null;
        kecamatan?: string | null;
        kabupaten?: string | null;
        postal_code?: string | null;
        location?: string | null;
    } | null;
    sales_channel?: { id: string; code: string; name: string; channel_type: string } | null;
    segment?: { id: string; code: string; name: string; priority: number } | null;
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

// ============================================
// Phase 4 - governance, revisions and delivery
// ============================================
//
// Every one of these goes through the same axios client and the same
// `toApiError`, so a governance refusal arrives carrying `code` / `details`
// exactly like a discount-policy refusal does and `mapQuotationException` can
// place it (spec I2).

/**
 * `POST /quotations/{id}/submit` (spec F1) - route a DRAFT into the approval
 * queue.
 *
 * `NO_ELIGIBLE_APPROVER` is RETIRED (owner amendment to A17, 5 Sep 2026). A
 * tenant with nobody but the requester holding `quotations:approve` - which is
 * a real, common state, since every staging tenant is single-user - is NOT
 * refused any more: the request is routed to the requester, the approval row
 * carries `self_approved`, and the requester may decide it. The error code
 * remains in the client's placement map defensively, in case an older leg
 * still answers with it during a rolling deploy.
 */
export async function submitQuotationForApproval(
    token: string,
    quotationId: string
): Promise<Quotation> {
    try {
        const res = await api.post<ApiEnvelope<Quotation>>(`/quotations/${quotationId}/submit`);
        return res.data.data;
    } catch (error: any) {
        logger.error("submitQuotationForApproval error:", error);
        throw toApiError(error, "Failed to submit quotation for approval");
    }
}

/** `POST /quotations/{id}/recall` - the REQUESTER cancels their own pending
 *  request and the quotation returns to `draft` (E5.4). */
export async function recallQuotationApproval(
    token: string,
    quotationId: string
): Promise<Quotation> {
    try {
        const res = await api.post<ApiEnvelope<Quotation>>(`/quotations/${quotationId}/recall`);
        return res.data.data;
    } catch (error: any) {
        logger.error("recallQuotationApproval error:", error);
        throw toApiError(error, "Failed to recall approval request");
    }
}

/**
 * `POST /quotations/{id}/approve` or `/reject` (E5.3), both gated on
 * `quotations:approve`. Approve lands the quotation on `sent` and mints its
 * `public_code`; reject sends it back to `draft` so the seller can fix it.
 */
export async function decideQuotationApproval(
    token: string,
    quotationId: string,
    approved: boolean,
    comment?: string | null
): Promise<Quotation> {
    const path = approved ? "approve" : "reject";
    try {
        logger.info("Deciding quotation approval", { id: quotationId, approved });
        const res = await api.post<ApiEnvelope<Quotation>>(
            `/quotations/${quotationId}/${path}`,
            { comment: comment?.trim() ? comment.trim() : null }
        );
        return res.data.data;
    } catch (error: any) {
        logger.error("decideQuotationApproval error:", error);
        throw toApiError(error, "Failed to decide quotation approval");
    }
}

/**
 * `GET /quotations/{id}/approvals` - the on-quote timeline. This endpoint is
 * why the approver's decision is visible AT ALL to a tenant user:
 * `activity_logs` is readable only through the backoffice grant
 * `platform:audit-log:read`, and this app has no activity-log code.
 */
export async function fetchQuotationApprovals(
    token: string,
    quotationId: string
): Promise<QuotationApproval[]> {
    try {
        const res = await api.get<ApiEnvelope<QuotationApproval[]>>(
            `/quotations/${quotationId}/approvals`
        );
        return res.data.data ?? [];
    } catch (error: any) {
        logger.error("fetchQuotationApprovals error:", error);
        throw toApiError(error, "Failed to fetch quotation approvals");
    }
}

export interface ApprovalQueueParams {
    page?: number;
    limit?: number;
    status?: QuotationApprovalStatus;
    /** Nomor quotation, judul, atau nama pelanggan. Token AND across columns,
     *  the same shape every other list search uses. */
    search?: string;
    /** `requested_at` | `quotation_number` | `grand_total` |
     *  `requested_max_percent` | `requested_min_margin_percent` | `status`.
     *  An unknown key falls back to the default order server-side. */
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

/**
 * `GET /quotations/approvals` - the tenant queue, gated on
 * `quotations:approve`. Registered BEFORE `GET /quotations/{id}` server-side
 * (A29) or FastAPI would match the id route and answer 422 on the literal.
 */
export async function fetchApprovalQueue(
    token: string,
    params: ApprovalQueueParams = {}
): Promise<QuotationApprovalListResponse> {
    try {
        const res = await api.get<ApiEnvelope<QuotationApprovalListResponse>>(
            "/quotations/approvals",
            { params }
        );
        return res.data.data;
    } catch (error: any) {
        logger.error("fetchApprovalQueue error:", error);
        throw toApiError(error, "Failed to fetch approval queue");
    }
}

/**
 * `POST /quotations/{id}/revise` (A5) - a NEW draft that supersedes this row.
 * Refused `409 QUOTATION_ALREADY_REVISED` when the row already has a child,
 * with that child's id and number in `details`, so the UI can send the seller
 * to the revision that already exists instead of retrying.
 */
export async function reviseQuotation(
    token: string,
    quotationId: string,
    reason?: string | null
): Promise<Quotation> {
    try {
        const res = await api.post<ApiEnvelope<Quotation>>(
            `/quotations/${quotationId}/revise`,
            { reason: reason?.trim() ? reason.trim() : null }
        );
        return res.data.data;
    } catch (error: any) {
        logger.error("reviseQuotation error:", error);
        throw toApiError(error, "Failed to revise quotation");
    }
}

/**
 * Longer than the API's own `TimeoutMiddleware` bound (60s), on purpose - see
 * `sendQuotation`. Anything shorter turns a slow-but-successful send into a
 * client-side failure and an invitation to send the quotation twice.
 */
export const SEND_TIMEOUT_MS = 90_000;

export interface SendQuotationOptions {
    channel: QuotationSendChannel;
    /** The client-generated PDF. Required: the bytes are what get uploaded. */
    pdf: Blob;
    filename: string;
    /** E.164; only read on the WhatsApp branch, and optional even there. */
    toPhone?: string | null;
    /** Only when the tenant has MORE THAN ONE active WhatsApp account and the
     *  server refused to guess which department's number to send from. */
    accountId?: string | null;
}

/**
 * `POST /quotations/{id}/send` (spec F2) - multipart, and deliberately
 * SYNCHRONOUS: the upload and the dispatch both run inside the request,
 * because a background task cannot recover the PDF bytes once the request has
 * finished. The delivery rows come back in the response.
 *
 * Known refusals the dialog surfaces by `code`: `429` (rate guard, A14),
 * `WHATSAPP_TEMPLATE_NOT_APPROVED` (409), `QUOTATION_DELIVERY_FAILED` (502)
 * and the multiple-active-accounts `400`.
 *
 * THE PER-REQUEST TIMEOUT IS LOAD-BEARING, not a tidy-up. `axiosClient`'s
 * default is 15s, and this one call legitimately runs longer: the storage
 * upload alone retries three times at 30s each before the email (with a PDF
 * attachment) or the WhatsApp dispatch has even started. The server's own
 * bound is `TimeoutMiddleware`'s 60s - and that middleware answers 408 without
 * STOPPING the endpoint, which keeps running headless. So a client that gives
 * up at 15s reports a failure for a send that then completes: the customer
 * gets the email, the delivery row is written, and the seller is invited to
 * retry - which re-sends, because only the PDF upload is de-duplicated (by
 * SHA-256), never the dispatch. 90s puts the client's patience beyond the
 * server's own limit so a timeout here means the request really is over.
 */
export async function sendQuotation(
    token: string,
    quotationId: string,
    options: SendQuotationOptions
): Promise<QuotationSendResponse> {
    const form = new FormData();
    form.append("attachments", options.pdf, options.filename);
    form.append("channel", options.channel);
    if (options.toPhone?.trim()) form.append("to_phone", options.toPhone.trim());
    if (options.accountId) form.append("account_id", options.accountId);
    try {
        logger.info("Sending quotation", { id: quotationId, channel: options.channel });
        const res = await api.post<ApiEnvelope<QuotationSendResponse>>(
            `/quotations/${quotationId}/send`,
            form,
            { timeout: SEND_TIMEOUT_MS }
        );
        return res.data.data;
    } catch (error: any) {
        logger.error("sendQuotation error:", error);
        throw toApiError(error, "Failed to send quotation");
    }
}

/**
 * `GET /quotations/whatsapp-senders` - the ACTIVE WhatsApp senders a quotation
 * can go out from, gated on `quotations` so a Staff seller can actually call
 * it. This is NOT `GET /omnichannels/accounts`, which needs `omnichannel:use`
 * / `omnichannel:setup` and would 403 for exactly the person who sends
 * quotations all day; it exists so the server's multiple-active-accounts 400
 * ("sertakan `account_id`") has a control that can answer it.
 */
export async function fetchQuotationWhatsappSenders(
    token: string
): Promise<QuotationWhatsappSender[]> {
    try {
        const res = await api.get<ApiEnvelope<QuotationWhatsappSender[]>>(
            "/quotations/whatsapp-senders"
        );
        return res.data.data ?? [];
    } catch (error: any) {
        logger.error("fetchQuotationWhatsappSenders error:", error);
        throw toApiError(error, "Failed to fetch WhatsApp senders");
    }
}

/** `GET /quotations/{id}/deliveries` - the per-quotation history the seller
 *  reads when a send fails. Scoped on `company_id` server-side (A8). */
export async function fetchQuotationDeliveries(
    token: string,
    quotationId: string
): Promise<QuotationDelivery[]> {
    try {
        const res = await api.get<ApiEnvelope<QuotationDelivery[]>>(
            `/quotations/${quotationId}/deliveries`
        );
        return res.data.data ?? [];
    } catch (error: any) {
        logger.error("fetchQuotationDeliveries error:", error);
        throw toApiError(error, "Failed to fetch quotation deliveries");
    }
}
