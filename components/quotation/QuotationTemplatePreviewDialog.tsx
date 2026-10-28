"use client";

// components/quotation/QuotationTemplatePreviewDialog.tsx
//
// A template shown at full size, page by page as the PDF prints it, in a dialog. Used by the
// Settings › Template Quotation cards and by the template picker in the
// quotation form; each caller renders the document and may add buttons.

import type { ReactNode } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import QuotationTemplateRenderer from "@/components/quotation/QuotationTemplateRenderer";

interface QuotationTemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** From `useTemplateDocument`; null while it renders. */
  documentHtml: string | null;
  /** The template or its render failed. */
  failed?: boolean;
  /** Buttons after "Tutup", e.g. "Jadikan default". */
  actions?: ReactNode;
}

export default function QuotationTemplatePreviewDialog({
  open,
  onClose,
  title,
  description = "Pratinjau dengan data contoh dan profil perusahaan Anda.",
  documentHtml,
  failed = false,
  actions,
}: QuotationTemplatePreviewDialogProps) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={title}
      description={description}
      actions={
        <>
          <AppButton variantStyle="outline" onClick={onClose}>
            Tutup
          </AppButton>
          {actions}
        </>
      }
    >
      <div className="bg-slate-100 p-4">
        <div className="mx-auto max-w-[800px]">
          {failed ? (
            <div className="flex h-64 items-center justify-center bg-white text-sm text-slate-500 shadow-md ring-1 ring-black/5">
              Pratinjau gagal dimuat
            </div>
          ) : documentHtml ? (
            <QuotationTemplateRenderer documentHtml={documentHtml} title={`Pratinjau ${title}`} paged />
          ) : (
            <div className="aspect-[800/1131] animate-pulse bg-white shadow-md ring-1 ring-black/5" />
          )}
        </div>
      </div>
    </AppDialog>
  );
}
