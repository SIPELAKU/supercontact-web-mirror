"use client";

// components/quotation/QuotationTemplateRenderer.tsx
//
// Shows a rendered quotation template on screen, scaled to the width it is
// given. The template is laid out at its real 800px width inside a script-less
// iframe (its CSS lives only there) and shrunk with a CSS transform, so a
// thumbnail and a full preview show exactly what the PDF captures: the same
// page breaks (`paginateTemplateDocument`) and the same A4 pages.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { pageCount, paginateTemplateDocument } from "@/lib/quotation/paginate";
import { renderTemplateDocument, TEMPLATE_PAGE_HEIGHT_PX, TEMPLATE_PAGE_WIDTH_PX } from "@/lib/quotation/renderTemplate";
import type { QuotationTemplateContext, QuotationTemplateSource } from "@/lib/types/QuotationTemplate";

/** Renders `source` with `context` into an iframe document; null until ready. */
export function useTemplateDocument(
  source: QuotationTemplateSource | null | undefined,
  context: QuotationTemplateContext | null | undefined
): { documentHtml: string | null; error: Error | null } {
  const [state, setState] = useState<{ documentHtml: string | null; error: Error | null }>({
    documentHtml: null,
    error: null,
  });

  useEffect(() => {
    if (!source || !context) return;
    let cancelled = false;
    renderTemplateDocument(source, context)
      .then((documentHtml) => !cancelled && setState({ documentHtml, error: null }))
      .catch((error: Error) => !cancelled && setState({ documentHtml: null, error }));
    return () => {
      cancelled = true;
    };
  }, [source, context]);

  return state;
}

/** Applies the page breaks once loaded and returns the paginated content height. */
function layOut(frame: HTMLIFrameElement): number | null {
  const doc = frame.contentDocument;
  if (!doc?.body) return null;
  paginateTemplateDocument(doc);
  return Math.max(TEMPLATE_PAGE_HEIGHT_PX, doc.documentElement.scrollHeight);
}

interface QuotationTemplateRendererProps {
  /** From `useTemplateDocument`; null shows a blank page. */
  documentHtml: string | null;
  /** The iframe's accessible name. */
  title: string;
  /** Show every A4 page, one below the other (preview dialog), instead of the first one only (thumbnail). */
  paged?: boolean;
  className?: string;
}

export default function QuotationTemplateRenderer({
  documentHtml,
  title,
  paged = false,
  className,
}: QuotationTemplateRendererProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [contentHeight, setContentHeight] = useState(TEMPLATE_PAGE_HEIGHT_PX);

  // The scale follows the box width, so the page always fits its card.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => setScale(box.clientWidth / TEMPLATE_PAGE_WIDTH_PX);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // One window per page onto the same document, each showing its own slice:
  // page `index` is the content shifted up by `index` page heights.
  const page = (index: number, measure: boolean) =>
    documentHtml && (
      <iframe
        title={index === 0 ? title : `${title}, halaman ${index + 1}`}
        // Same-origin only to lay out and measure the pages; never allow-scripts.
        sandbox="allow-same-origin"
        srcDoc={documentHtml}
        tabIndex={-1}
        onLoad={(event) => {
          const height = layOut(event.currentTarget);
          if (height && measure) setContentHeight(height);
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: TEMPLATE_PAGE_WIDTH_PX,
          height: paged ? contentHeight : TEMPLATE_PAGE_HEIGHT_PX,
          border: 0,
          transform: `scale(${scale}) translateY(-${index * TEMPLATE_PAGE_HEIGHT_PX}px)`,
          transformOrigin: "top left",
          // Clicks and scrolling belong to the card or dialog around it.
          pointerEvents: "none",
        }}
      />
    );

  const pageBox = "relative w-full overflow-hidden bg-white";

  if (!paged) {
    return (
      <div ref={boxRef} className={`${pageBox} ${className ?? ""}`} style={{ height: TEMPLATE_PAGE_HEIGHT_PX * scale }}>
        {page(0, false)}
      </div>
    );
  }

  const pages = pageCount(contentHeight);
  return (
    <div ref={boxRef} className={`flex w-full flex-col gap-4 ${className ?? ""}`}>
      {Array.from({ length: pages }, (_, index) => (
        <div key={index}>
          <div className={`${pageBox} shadow-md ring-1 ring-black/5`} style={{ height: TEMPLATE_PAGE_HEIGHT_PX * scale }}>
            {page(index, index === 0)}
          </div>
          {pages > 1 && (
            <p className="mt-1 text-center text-[11px] text-slate-500">
              Halaman {index + 1} dari {pages}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
