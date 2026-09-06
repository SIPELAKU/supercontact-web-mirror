// lib/utils/quotationPdf.ts
//
// The quotation PDF rasteriser (Phase 3, spec I7.1), extracted from
// `QuotationFormClient.generatePDF` so a second caller - the "Unduh PDF" row
// action on the quotation list - can reuse it instead of the template being
// unreachable for an already-published quotation.
//
// THERE IS NO SERVER-SIDE PDF RENDERER. The API only ACCEPTS an uploaded
// `application/pdf` attachment; the only template in the codebase is the
// hidden `<QuotationPdfDocument/>` node, rasterised here by `html2canvas-pro`
// and wrapped in a page by `jsPDF`.
//
// Two mechanics that are load-bearing and easy to break:
//
//   * both libraries are imported DYNAMICALLY, at call time, never at module
//     scope: they are large and only this one path needs them, so a static
//     import would make every visitor of the quotation pages download them
//     whether or not they ever export anything;
//   * the node is CLONED, positioned on screen behind everything, captured,
//     and removed. html2canvas cannot capture a node that is display:none or
//     translated off-screen, and it cannot resolve the app's CSS custom
//     properties - which is why every element in the template carries an
//     INLINE colour.

/** A4 at 210mm wide; the capture is scaled to that. */
const PDF_PAGE_WIDTH_MM = 210;
/** A4 at 297mm tall. The page height the canvas is sliced against (A34). */
const PDF_PAGE_HEIGHT_MM = 297;
/** Fixed capture width so the layout does not reflow with the viewport. */
const CAPTURE_WIDTH_PX = 800;

export interface QuotationPdfOptions {
  /** Rasterisation scale. 1.5 keeps the file small enough to upload. */
  scale?: number;
  /** JPEG quality; PNG would roughly triple the attachment size. */
  quality?: number;
}

/**
 * Rasterises `node` into a PAGINATED A4 PDF and returns it as a Blob.
 *
 * `filename` is written into the PDF's document properties, so a downloaded
 * file and an uploaded attachment identify themselves the same way.
 *
 * Throws on failure - the caller decides whether that is a toast, a warning
 * or a silent skip. The clone is removed from the DOM in every path.
 *
 * ── COMMERCIAL Phase 5 (spec I10 / A34): PAGINATION ──────────────────────
 *
 * This function used to compute `imgHeight` and call
 *
 *     pdf.addImage(imgData, "JPEG", 0, 0, 210, imgHeight)
 *
 * ONCE - no page splitting and no height check - so anything past 297 mm was
 * simply NOT ON THE PAGE. Not clipped with a marker, not warned about: gone.
 *
 * Phase 5 makes every line taller (a unit select, variant chips, a bundle
 * sub-block, a promo caption) and the totals block longer (a rate line and two
 * rupiah-equivalent rows), so quotations that print correctly today would
 * silently lose THEIR TOTALS AND TERMS - and there is no server-side renderer
 * to fall back on: the API only accepts an uploaded PDF, and this hidden node
 * is the only template in the codebase.
 *
 * So the canvas is now SLICED into 297 mm-tall pages and each slice is placed
 * with a `pdf.addPage()` between. The fixed 800 px capture width and the 1.5
 * scale are unchanged, so an existing one-page quotation rasterises to exactly
 * the same first page it always did.
 */
export async function generateQuotationPdf(
  node: HTMLElement,
  filename: string,
  options: QuotationPdfOptions = {}
): Promise<Blob> {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.zIndex = "-1000"; // behind everything, but rendered
  clone.style.width = `${CAPTURE_WIDTH_PX}px`;
  clone.style.backgroundColor = "#ffffff";
  clone.style.display = "block";
  document.body.appendChild(clone);

  try {
    const [h2cMod, jspdfMod] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);
    // Resolve defensively: the browser (ESM build) and Node (CJS build) expose
    // these under different keys, so pin to whichever is callable rather than
    // assuming one bundler resolution.
    const html2canvas = (h2cMod as any).default ?? (h2cMod as any);
    const jsPDF = (jspdfMod as any).jsPDF ?? (jspdfMod as any).default;

    // Let the clone paint before it is measured.
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(clone, {
      scale: options.scale ?? 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const quality = options.quality ?? 0.75;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    pdf.setProperties?.({ title: filename });

    // How many CANVAS pixels fill one A4 page at this capture width.
    const pxPerMm = canvas.width / PDF_PAGE_WIDTH_MM;
    const pageHeightPx = Math.floor(PDF_PAGE_HEIGHT_MM * pxPerMm);
    const totalHeight = canvas.height;

    // A short document takes the single-image path unchanged, so nothing that
    // prints on one page today changes by a pixel.
    if (pageHeightPx <= 0 || totalHeight <= pageHeightPx) {
      const imgData = canvas.toDataURL("image/jpeg", quality);
      const imgHeight = (totalHeight * PDF_PAGE_WIDTH_MM) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, PDF_PAGE_WIDTH_MM, imgHeight);
      return pdf.output("blob") as Blob;
    }

    // Each slice is drawn onto its own canvas and added as its own page. A
    // scratch canvas per slice (rather than one reused canvas) keeps the last
    // page's shorter height from stretching the image.
    for (let offset = 0; offset < totalHeight; offset += pageHeightPx) {
      const sliceHeight = Math.min(pageHeightPx, totalHeight - offset);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext("2d");
      // Without an explicit white fill a JPEG slice renders transparent pixels
      // as BLACK, which would print a black band down a short final page.
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(
          canvas,
          0, offset, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );
      }
      if (offset > 0) pdf.addPage();
      const sliceHeightMm = (sliceHeight * PDF_PAGE_WIDTH_MM) / canvas.width;
      pdf.addImage(
        slice.toDataURL("image/jpeg", quality),
        "JPEG",
        0,
        0,
        PDF_PAGE_WIDTH_MM,
        sliceHeightMm
      );
    }
    return pdf.output("blob") as Blob;
  } finally {
    if (document.body.contains(clone)) document.body.removeChild(clone);
  }
}

/** Hands a generated blob to the browser as a download, then releases the URL. */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoked on the next tick: revoking synchronously races the click in
  // Safari and yields an empty file.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** `quotation-QUO-2026-0007.pdf` - one spelling for upload and download. */
export function quotationPdfFilename(quotationNumber: string | null | undefined): string {
  return `quotation-${quotationNumber ?? "draft"}.pdf`;
}
