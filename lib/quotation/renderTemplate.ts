// lib/quotation/renderTemplate.ts
//
// Turns a quotation template (Handlebars HTML + CSS from the API) and its
// context into the document an iframe shows and the PDF is captured from.
//
// Templates are tenant-editable HTML, so three layers keep a script out:
// the API sanitises on save, DOMPurify runs again here on the rendered HTML,
// and the document is only ever shown in an iframe WITHOUT `allow-scripts`.
// Every `{{ }}` is escaped (Handlebars' default); the CSS is not sanitised by
// DOMPurify, it goes into its own <style>.

import type { QuotationTemplateContext, QuotationTemplateSource } from "@/lib/types/QuotationTemplate";

/** The width every template is laid out at (`.qt { width: 800px }`). */
export const TEMPLATE_PAGE_WIDTH_PX = 800;
/** One A4 page at that width. */
export const TEMPLATE_PAGE_HEIGHT_PX = 1131;

const SANITIZE_CONFIG = {
  // SVG for the Fresh and Surat Penawaran ornaments.
  USE_PROFILES: { html: true, svg: true },
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "link", "meta", "style"],
  FORBID_ATTR: ["srcset"],
};

/** The full iframe document. A `</style` inside the CSS cannot close the tag early. */
export function buildTemplateDocument(safeHtml: string, css: string): string {
  const safeCss = css.replace(/<\/style/gi, "<\\/style");
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}${safeCss}</style></head><body>${safeHtml}</body></html>`;
}

/**
 * Renders and sanitises a template into an iframe document. Handlebars and
 * DOMPurify are imported here, at call time, so pages that never render a
 * template never download them. `strict: false`: a typo in a template prints
 * blank instead of failing a send.
 */
export async function renderTemplateDocument(
  source: QuotationTemplateSource,
  context: QuotationTemplateContext
): Promise<string> {
  const [handlebarsMod, purifyMod] = await Promise.all([import("handlebars"), import("dompurify")]);
  const Handlebars = (handlebarsMod as any).default ?? handlebarsMod;
  const DOMPurify = (purifyMod as any).default ?? purifyMod;

  const raw: string = Handlebars.compile(source.html, { strict: false })(context);
  const safeHtml: string = DOMPurify.sanitize(raw, SANITIZE_CONFIG);
  return buildTemplateDocument(safeHtml, source.css);
}
