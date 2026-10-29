"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchQuotationTemplate,
  fetchQuotationTemplates,
  setDefaultQuotationTemplate,
} from "@/lib/api/quotation-templates";
import type { QuotationTemplateList } from "@/lib/types/QuotationTemplate";

export const quotationTemplatesKey = ["quotation-templates"] as const;
export const quotationTemplateKey = (id: string) => ["quotation-template", id] as const;
/** `GET /quotations/defaults`, read by the PDF for the company currency and default template. */
export const quotationDefaultsKey = ["quotation-defaults"] as const;

/** Templates change only on a deploy (system templates) or a rare edit. */
export const TEMPLATE_STALE_TIME = 30 * 60 * 1000;

export const quotationTemplateQuery = (id: string) => ({
  queryKey: quotationTemplateKey(id),
  queryFn: () => fetchQuotationTemplate(id),
  staleTime: TEMPLATE_STALE_TIME,
});

/** The templates this company may use, in display order, and which one is the default. */
export function useQuotationTemplates() {
  return useQuery({
    queryKey: quotationTemplatesKey,
    queryFn: fetchQuotationTemplates,
    staleTime: TEMPLATE_STALE_TIME,
  });
}

/** One template's html and css, cached per id. */
export function useQuotationTemplate(id: string | null | undefined) {
  return useQuery({ ...quotationTemplateQuery(id ?? ""), enabled: !!id });
}

/**
 * Makes a template the company default. The response is the updated list, so
 * it replaces the cache without a refetch; the defaults (which name the
 * default template) are refetched for the next quotation.
 */
export function useSetDefaultQuotationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => setDefaultQuotationTemplate(templateId),
    onSuccess: (list) => {
      queryClient.setQueryData<QuotationTemplateList>(quotationTemplatesKey, list);
      queryClient.invalidateQueries({ queryKey: quotationDefaultsKey });
    },
  });
}
