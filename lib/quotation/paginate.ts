// lib/quotation/paginate.ts
//
// Page breaks for a rendered template. The PDF is cut into A4 slices of a
// fixed height (lib/utils/quotationPdf.ts), and the templates are one long
// page, so without this a slice boundary can run through the middle of an
// item row. Before the capture (and before the on-screen preview, so both
// show the same pages) every block that would cross a boundary is pushed to
// the top of the next page, leaving a margin above and below the cut.
//
// It works on the laid-out document, so it needs a browser; the arithmetic
// is in the pure helpers below.

import { TEMPLATE_PAGE_HEIGHT_PX } from "./renderTemplate";

/** Space kept empty above and below every page cut. */
export const PAGE_MARGIN_PX = 48;
/** A block up to this tall is kept whole; a taller one is broken between its children. */
const KEEP_TOGETHER_MAX_PX = 160;

/** How many pages a document this tall prints on (a pixel of rounding is not a page). */
export function pageCount(contentHeight: number, pageHeight = TEMPLATE_PAGE_HEIGHT_PX): number {
  return Math.max(1, Math.ceil((contentHeight - 2) / pageHeight));
}

/**
 * How far a block must move down so it does not cross a page cut, or 0.
 * A block that would end inside the bottom margin, or that starts inside the
 * top margin of a later page, moves to just below that page's top margin. A
 * block taller than a page cannot be helped and stays.
 */
export function pageBreakShift(
  top: number,
  height: number,
  pageHeight = TEMPLATE_PAGE_HEIGHT_PX,
  margin = PAGE_MARGIN_PX
): number {
  if (height <= 0 || height > pageHeight - 2 * margin) return 0;
  const page = Math.floor(top / pageHeight);
  if (page > 0 && top < page * pageHeight + margin) return page * pageHeight + margin - top;
  if (top + height > (page + 1) * pageHeight - margin) return (page + 1) * pageHeight + margin - top;
  return 0;
}

function isRowLayout(style: CSSStyleDeclaration): boolean {
  return (
    (style.display.includes("flex") && !style.flexDirection.startsWith("column")) ||
    style.display.includes("grid")
  );
}

/** Whether `el` is moved as one piece rather than broken between its children. */
function keepTogether(el: Element, height: number, style: CSSStyleDeclaration): boolean {
  const tag = el.tagName.toUpperCase();
  if (tag === "TR" || tag === "LI" || tag === "IMG" || tag === "SVG") return true;
  if (tag === "THEAD" || tag === "TBODY" || tag === "TFOOT") return false;
  // Columns side by side move together, or they would no longer line up.
  if (isRowLayout(style)) return true;
  if (el.children.length === 0) return true;
  return height <= KEEP_TOGETHER_MAX_PX;
}

/** Inserts empty space before `el` so it starts `shift` pixels lower. */
function pushDown(doc: Document, el: HTMLElement, shift: number, targetTop: () => number) {
  const parentStyle = el.parentElement ? doc.defaultView!.getComputedStyle(el.parentElement) : null;
  let grow: (by: number) => void;

  if (el.tagName.toUpperCase() === "TR") {
    // An empty row, so the table keeps its borders on both pages.
    const row = doc.createElement("tr");
    const cell = doc.createElement("td");
    const cells = Array.from((el as HTMLTableRowElement).cells);
    cell.colSpan = Math.max(1, cells.reduce((sum, c) => sum + (c.colSpan || 1), 0));
    cell.style.cssText = `height:${shift}px;padding:0;border:none;background:transparent`;
    row.setAttribute("aria-hidden", "true");
    row.appendChild(cell);
    el.before(row);
    grow = (by) => (cell.style.height = `${parseFloat(cell.style.height) + by}px`);
  } else if (parentStyle && isRowLayout(parentStyle)) {
    // A spacer would become another column; a margin moves just this one.
    const current = parseFloat(doc.defaultView!.getComputedStyle(el).marginTop) || 0;
    el.style.marginTop = `${current + shift}px`;
    grow = (by) => (el.style.marginTop = `${parseFloat(el.style.marginTop) + by}px`);
  } else {
    const spacer = doc.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    spacer.style.cssText = `height:${shift}px;margin:0;padding:0`;
    el.before(spacer);
    grow = (by) => (spacer.style.height = `${parseFloat(spacer.style.height) + by}px`);
  }

  // Collapsing margins can absorb part of the space; correct once.
  const missing = targetTop() - el.getBoundingClientRect().top;
  if (Math.abs(missing) > 0.5) grow(missing);
}

/** Moves every block that would be cut by a page boundary to the next page. */
export function paginateTemplateDocument(doc: Document, pageHeight = TEMPLATE_PAGE_HEIGHT_PX): void {
  const view = doc.defaultView;
  if (!view || !doc.body) return;
  const scrollY = () => view.scrollY || 0;

  const visit = (el: Element) => {
    const style = view.getComputedStyle(el);
    // Decorations and footers are placed against the page, not the flow.
    if (style.position === "absolute" || style.position === "fixed" || style.display === "none") return;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) return;

    const whole = keepTogether(el, rect.height, style) && rect.height <= pageHeight - 2 * PAGE_MARGIN_PX;
    if (!whole) {
      Array.from(el.children).forEach(visit);
      return;
    }
    const top = rect.top + scrollY();
    const shift = pageBreakShift(top, rect.height, pageHeight);
    if (shift > 0) pushDown(doc, el as HTMLElement, shift, () => top + shift - scrollY());
  };

  Array.from(doc.body.children).forEach(visit);
}
