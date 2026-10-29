"use client";

// components/quotation/QuotationPdfPreviewDialog.tsx
//
// "Lihat PDF": the real PDF - the same file that is attached when the
// quotation is sent - shown in the browser's PDF viewer before anything goes
// out. The blob URL is revoked when the dialog closes.

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { downloadPdfBlob, quotationPdfFilename } from "@/lib/utils/quotationPdf";
import type { Quotation } from "@/lib/types/Quotation";

interface QuotationPdfPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** The STORED row to render. */
  quotation: Quotation | null;
  /** Builds the PDF; null when it failed (the caller has already said why). */
  generatePdf: (quotation: Quotation) => Promise<Blob | null>;
}

export default function QuotationPdfPreviewDialog({
  open,
  onClose,
  quotation,
  generatePdf,
}: QuotationPdfPreviewDialogProps) {
  const [pdf, setPdf] = useState<{ blob: Blob; url: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || !quotation) return;
    let cancelled = false;
    let url: string | null = null;
    setPdf(null);
    setFailed(false);
    generatePdf(quotation)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setFailed(true);
          return;
        }
        url = URL.createObjectURL(blob);
        setPdf({ blob, url });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // Regenerated per opening only; a new `generatePdf` identity mid-view must not rebuild it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, quotation?.id]);

  const filename = quotationPdfFilename(quotation?.quotation_number);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title="Lihat PDF"
      description={quotation ? `${quotation.quotation_number} - file yang sama dengan lampiran saat dikirim.` : undefined}
      contentPadding={false}
      actions={
        <>
          <AppButton variantStyle="outline" onClick={onClose}>
            Tutup
          </AppButton>
          <AppButton disabled={!pdf} onClick={() => pdf && downloadPdfBlob(pdf.blob, filename)}>
            Unduh PDF
          </AppButton>
        </>
      }
    >
      <div className="h-[75vh] bg-slate-100">
        {pdf ? (
          <iframe title={filename} src={pdf.url} className="h-full w-full border-0" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-500">
            {failed ? (
              "PDF gagal dibuat."
            ) : (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
                Membuat PDF...
              </>
            )}
          </div>
        )}
      </div>
    </AppDialog>
  );
}
