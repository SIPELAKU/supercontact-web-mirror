"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchMyCompany } from "@/lib/api/company-profile";
import { fetchQuotationDefaults } from "@/lib/api/quotations";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { myCompanyKey } from "@/lib/hooks/useMyCompany";
import { quotationDefaultsKey, quotationTemplateQuery } from "@/lib/hooks/useQuotationTemplates";
import { buildTemplateContext } from "@/lib/quotation/templateContext";
import { chooseTemplate } from "@/lib/quotation/resolveTemplate";
import { renderTemplateDocument } from "@/lib/quotation/renderTemplate";
import { generateTemplatePdf, quotationPdfFilename } from "@/lib/utils/quotationPdf";
import type { Quotation } from "@/lib/types/Quotation";
import type { QuotationTemplateSource } from "@/lib/types/QuotationTemplate";

const COMPANY_STALE_TIME = 5 * 60 * 1000;
const DEFAULTS_STALE_TIME = 60 * 1000;

/**
 * Returns `generate(quotation)`, which renders the quotation's PDF with its
 * template and resolves to the Blob. Pass the STORED row (a detail, or the
 * response of a save): the PDF prints what the server has, never form state.
 *
 * Everything else it needs is fetched through the query cache: the seller
 * (`GET /companies`), the company currency and default template
 * (`GET /quotations/defaults`) and the template itself. Throws on failure.
 */
export function useQuotationPdf() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  // Mounted here so the definitions are usually cached before the first click.
  const { definitions: productDefinitions } = useCustomFieldDefinitionsFor("product");

  return useCallback(
    async (quotation: Quotation): Promise<Blob> => {
      const [company, defaults] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: myCompanyKey,
          queryFn: async () => fetchMyCompany(await getToken()),
          staleTime: COMPANY_STALE_TIME,
        }),
        queryClient.fetchQuery({
          queryKey: quotationDefaultsKey,
          queryFn: async () => fetchQuotationDefaults(await getToken()),
          staleTime: DEFAULTS_STALE_TIME,
        }),
      ]);

      const choice = chooseTemplate(quotation, defaults.template_id);
      if (choice.kind === "none") throw new Error("Template quotation default belum diatur");
      const source: QuotationTemplateSource =
        choice.kind === "snapshot" ? choice.snapshot : await queryClient.fetchQuery(quotationTemplateQuery(choice.id));

      const context = buildTemplateContext({
        quotation,
        company,
        companyCurrency: defaults.currency,
        productDefinitions,
      });
      const documentHtml = await renderTemplateDocument(source, context);
      return generateTemplatePdf(documentHtml, quotationPdfFilename(quotation.quotation_number));
    },
    [queryClient, getToken, productDefinitions]
  );
}
