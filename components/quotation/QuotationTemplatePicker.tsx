"use client";

// components/quotation/QuotationTemplatePicker.tsx
//
// Which PDF template this quotation is printed with. Starts on the company
// default; changeable only while the quotation is a draft (the API locks the
// template once it leaves draft and freezes it as `template_snapshot`). The
// thumbnail renders the chosen template with the data on the form (debounced
// by the caller) and opens it full size; "Lihat PDF" is the saved row's file.

import { useMemo, useState } from "react";
import { ZoomIn } from "lucide-react";
import { AppSelect } from "@/components/ui/app-select";
import QuotationTemplateRenderer, { useTemplateDocument } from "@/components/quotation/QuotationTemplateRenderer";
import QuotationTemplatePreviewDialog from "@/components/quotation/QuotationTemplatePreviewDialog";
import { useMyCompany } from "@/lib/hooks/useMyCompany";
import { useQuotationTemplate, useQuotationTemplates } from "@/lib/hooks/useQuotationTemplates";
import { buildTemplateContext } from "@/lib/quotation/templateContext";
import { SAMPLE_QUOTATION } from "@/lib/quotation/sampleQuotation";
import type { CustomFieldDefinitionLike } from "@/lib/types/CustomFieldDefinition";
import type { Quotation } from "@/lib/types/Quotation";
import type { QuotationTemplateSnapshot } from "@/lib/types/QuotationTemplate";

interface QuotationTemplatePickerProps {
  /** The selected template id; "" until the defaults arrive. */
  value: string;
  onChange: (templateId: string) => void;
  readOnly?: boolean;
  /** A sent quotation's frozen template, named even if it is no longer listed. */
  snapshot?: QuotationTemplateSnapshot | null;
  /** The API's refusal of `template_id` (400 `details.field = "template_id"`). */
  error?: string;
  /** What to preview: the form's data (`quotationFromForm`) or the saved row. Sample data when absent. */
  quotation?: Quotation | null;
  /** The company currency, for the base-currency totals of a foreign quotation. */
  companyCurrency?: string | null;
  /** Product definitions, for each line's attributes. */
  productDefinitions?: CustomFieldDefinitionLike[];
}

export default function QuotationTemplatePicker({
  value,
  onChange,
  readOnly = false,
  snapshot,
  error,
  quotation,
  companyCurrency,
  productDefinitions,
}: QuotationTemplatePickerProps) {
  const templates = useQuotationTemplates();
  const company = useMyCompany();
  const items = useMemo(() => templates.data?.items ?? [], [templates.data]);

  const options = useMemo(() => {
    const listed = items.map((item) => ({
      value: item.id,
      label: item.is_default ? `${item.name} (default)` : item.name,
    }));
    if (snapshot && !items.some((item) => item.id === snapshot.id)) {
      listed.push({ value: snapshot.id, label: snapshot.name });
    }
    return listed;
  }, [items, snapshot]);

  const selected = items.find((item) => item.id === value) ?? null;
  const templateName = snapshot?.name ?? selected?.name ?? "Template";
  const [previewOpen, setPreviewOpen] = useState(false);

  // A sent quotation shows its snapshot, which is what its PDF is rendered from.
  const detail = useQuotationTemplate(snapshot ? null : value || null);
  const source = snapshot ?? detail.data;
  const context = useMemo(
    () =>
      company.isLoading
        ? null
        : buildTemplateContext({
            quotation: quotation ?? SAMPLE_QUOTATION,
            company: company.data,
            companyCurrency: quotation ? companyCurrency : "IDR",
            productDefinitions,
          }),
    [company.isLoading, company.data, quotation, companyCurrency, productDefinitions]
  );
  const { documentHtml, error: renderError } = useTemplateDocument(source, context);

  const helperText =
    error ||
    (templates.isError
      ? "Daftar template gagal dimuat"
      : readOnly
        ? "Template tidak bisa diganti setelah quotation keluar dari draft"
        : selected?.description || undefined);

  return (
    <div className="bg-white p-6">
      <h2 className="mb-3 text-base font-semibold">Template PDF</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="w-full max-w-md">
          <AppSelect
            value={options.some((option) => option.value === value) ? value : ""}
            onChange={(event) => onChange(String(event.target.value))}
            options={options}
            placeholder={templates.isLoading ? "Memuat template..." : "Pilih template"}
            disabled={readOnly || templates.isLoading}
            error={!!error}
            helperText={helperText}
            isBgWhite
            height="48px"
            rounded="8px"
          />
        </div>
        {(value || snapshot) && (
          <figure className="w-28 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              aria-label={`Perbesar pratinjau ${templateName}`}
              className="group relative block w-full overflow-hidden rounded-sm shadow ring-1 ring-black/10 transition hover:ring-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              {documentHtml ? (
                <QuotationTemplateRenderer documentHtml={documentHtml} title="Pratinjau template" />
              ) : (
                <div className="aspect-[800/1131] animate-pulse bg-slate-100" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/30 group-hover:opacity-100 group-focus-visible:bg-slate-900/30 group-focus-visible:opacity-100">
                <span className="rounded-full bg-white p-1.5 text-slate-700 shadow">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </span>
            </button>
            <figcaption className="mt-1 text-center text-[11px] text-slate-500">Klik untuk perbesar</figcaption>
          </figure>
        )}
      </div>

      <QuotationTemplatePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={templateName}
        description={
          quotation
            ? "Pratinjau dengan data di form ini dan profil perusahaan Anda. PDF yang dikirim dibuat dari data yang disimpan."
            : "Pratinjau dengan data contoh dan profil perusahaan Anda."
        }
        documentHtml={documentHtml}
        failed={detail.isError || !!renderError}
      />
    </div>
  );
}
