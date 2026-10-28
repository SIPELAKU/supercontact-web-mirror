"use client";

// components/admin/quotation-templates/QuotationTemplatesTab.tsx
//
// Settings › Sales › Template Quotation: the PDF templates this company can
// use, each previewed with the same sample quotation and the company's real
// name, logo and contacts, and which one new quotations get by default.
// Templates are fixed by the system; there is no create or edit.

import { useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Eye, FileText, Star } from "lucide-react";
import { AppAlert } from "@/components/ui/app-alert";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import QuotationTemplateRenderer, { useTemplateDocument } from "@/components/quotation/QuotationTemplateRenderer";
import QuotationTemplatePreviewDialog from "@/components/quotation/QuotationTemplatePreviewDialog";
import { notify } from "@/lib/notifications";
import { usePermission } from "@/lib/hooks/usePermission";
import { useMyCompany } from "@/lib/hooks/useMyCompany";
import {
  useQuotationTemplate,
  useQuotationTemplates,
  useSetDefaultQuotationTemplate,
} from "@/lib/hooks/useQuotationTemplates";
import { buildTemplateContext } from "@/lib/quotation/templateContext";
import { SAMPLE_QUOTATION } from "@/lib/quotation/sampleQuotation";
import type { QuotationTemplateContext, QuotationTemplateItem } from "@/lib/types/QuotationTemplate";

export default function QuotationTemplatesTab() {
  const { can } = usePermission();
  const canSetDefault = can("sales:config:manage");
  const templates = useQuotationTemplates();
  const company = useMyCompany();
  const setDefault = useSetDefaultQuotationTemplate();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const context = useMemo(
    () =>
      company.isLoading
        ? null
        : buildTemplateContext({ quotation: SAMPLE_QUOTATION, company: company.data, companyCurrency: "IDR" }),
    [company.isLoading, company.data]
  );

  const items = templates.data?.items ?? [];
  const previewed = items.find((item) => item.id === previewId) ?? null;

  const makeDefault = (template: QuotationTemplateItem) =>
    setDefault.mutate(template.id, {
      onSuccess: () =>
        notify.success("Template default diubah", {
          description: `${template.name} dipakai untuk quotation baru. Quotation yang sudah ada tidak berubah.`,
        }),
      onError: (error: Error) => notify.error("Gagal mengubah template default", { description: error.message }),
    });

  if (templates.isError) {
    return (
      <EmptyState
        icon={FileText}
        title="Template quotation gagal dimuat"
        description={templates.error.message}
        action={{ label: "Coba lagi", onClick: () => templates.refetch() }}
      />
    );
  }

  if (templates.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-[420px] animate-pulse rounded-xl border border-gray-200 bg-slate-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={FileText} title="Belum ada template quotation" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {!templates.data?.default_template_id && (
        <AppAlert
          variant="warning"
          title="Template default belum diatur"
          description="PDF quotation tidak bisa dibuat sampai ada template default. Hubungi tim support."
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            context={context}
            canSetDefault={canSetDefault}
            settingDefault={setDefault.isPending && setDefault.variables === template.id}
            disabled={setDefault.isPending}
            onPreview={() => setPreviewId(template.id)}
            onMakeDefault={() => makeDefault(template)}
          />
        ))}
      </div>

      {previewed && (
        <TemplatePreviewDialog
          template={previewed}
          context={context}
          canSetDefault={canSetDefault}
          settingDefault={setDefault.isPending}
          onClose={() => setPreviewId(null)}
          onMakeDefault={() => makeDefault(previewed)}
        />
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: QuotationTemplateItem;
  context: QuotationTemplateContext | null;
  canSetDefault: boolean;
  settingDefault: boolean;
  disabled: boolean;
  onPreview: () => void;
  onMakeDefault: () => void;
}

function TemplateCard({
  template,
  context,
  canSetDefault,
  settingDefault,
  disabled,
  onPreview,
  onMakeDefault,
}: TemplateCardProps) {
  const detail = useQuotationTemplate(template.id);
  const { documentHtml, error } = useTemplateDocument(detail.data, context);
  const failed = detail.isError || !!error;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        template.is_default ? "border-brand ring-1 ring-brand" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Pratinjau template ${template.name}`}
        className="group relative block bg-slate-100 p-4 text-left focus-visible:outline-2 focus-visible:outline-brand"
      >
        <div className="overflow-hidden rounded-sm shadow-md ring-1 ring-black/5">
          {failed ? (
            <div className="flex aspect-[800/1131] items-center justify-center bg-white px-4 text-center text-xs text-slate-500">
              Pratinjau gagal dimuat
            </div>
          ) : documentHtml ? (
            <QuotationTemplateRenderer documentHtml={documentHtml} title={`Pratinjau ${template.name}`} />
          ) : (
            <div className="aspect-[800/1131] animate-pulse bg-white" />
          )}
        </div>
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/30 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow">
            <Eye className="h-3.5 w-3.5" /> Lihat
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{template.name}</h3>
          {template.is_default && <Chip size="small" color="primary" label="Default" />}
        </div>
        {template.description && <p className="text-xs leading-relaxed text-slate-500">{template.description}</p>}
        {canSetDefault && !template.is_default && (
          <div className="mt-auto pt-2">
            <AppButton
              variantStyle="outline"
              size="small"
              startIcon={<Star className="h-3.5 w-3.5" />}
              onClick={onMakeDefault}
              disabled={disabled}
              isLoading={settingDefault}
            >
              Jadikan default
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplatePreviewDialogProps {
  template: QuotationTemplateItem;
  context: QuotationTemplateContext | null;
  canSetDefault: boolean;
  settingDefault: boolean;
  onClose: () => void;
  onMakeDefault: () => void;
}

function TemplatePreviewDialog({
  template,
  context,
  canSetDefault,
  settingDefault,
  onClose,
  onMakeDefault,
}: TemplatePreviewDialogProps) {
  const detail = useQuotationTemplate(template.id);
  const { documentHtml, error } = useTemplateDocument(detail.data, context);

  return (
    <QuotationTemplatePreviewDialog
      open
      onClose={onClose}
      title={template.is_default ? `${template.name} (default)` : template.name}
      documentHtml={documentHtml}
      failed={detail.isError || !!error}
      actions={
        canSetDefault &&
        !template.is_default && (
          <AppButton startIcon={<Star className="h-4 w-4" />} onClick={onMakeDefault} isLoading={settingDefault}>
            Jadikan default
          </AppButton>
        )
      }
    />
  );
}
