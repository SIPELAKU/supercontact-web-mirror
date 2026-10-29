// lib/api/quotation-templates.ts
// Quotation PDF templates: the list, one template's source, and the company default.

import api from "../utils/axiosClient";
import { logger } from "../utils/logger";
import { toApiError, type ApiEnvelope } from "./quotations";
import type { QuotationTemplateDetail, QuotationTemplateList } from "../types/QuotationTemplate";

/** The templates this company may use, in display order (permission `quotations`). No html/css. */
export async function fetchQuotationTemplates(): Promise<QuotationTemplateList> {
    try {
        const res = await api.get<ApiEnvelope<QuotationTemplateList>>("/quotation-templates");
        return res.data.data;
    } catch (error: any) {
        logger.error("fetchQuotationTemplates error:", error);
        throw toApiError(error, "Failed to fetch quotation templates");
    }
}

/** One template with its Handlebars `html` and `css` (permission `quotations`). */
export async function fetchQuotationTemplate(templateId: string): Promise<QuotationTemplateDetail> {
    try {
        const res = await api.get<ApiEnvelope<QuotationTemplateDetail>>(
            `/quotation-templates/${encodeURIComponent(templateId)}`
        );
        return res.data.data;
    } catch (error: any) {
        logger.error("fetchQuotationTemplate error:", error);
        throw toApiError(error, "Failed to fetch quotation template");
    }
}

/**
 * Sets the template new quotations get (permission `sales:config:manage`).
 * Existing quotations keep theirs. Returns the updated list.
 */
export async function setDefaultQuotationTemplate(templateId: string): Promise<QuotationTemplateList> {
    try {
        const res = await api.put<ApiEnvelope<QuotationTemplateList>>("/quotation-templates/default", {
            template_id: templateId,
        });
        return res.data.data;
    } catch (error: any) {
        logger.error("setDefaultQuotationTemplate error:", error);
        throw toApiError(error, "Failed to set the default quotation template");
    }
}
