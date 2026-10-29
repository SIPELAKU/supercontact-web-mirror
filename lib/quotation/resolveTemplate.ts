// lib/quotation/resolveTemplate.ts
//
// Which template a quotation's PDF is rendered with (guide section 4):
//
//   1. its `template_snapshot`, once it has left draft, so the PDF stays the
//      one the customer received even after the company default changes;
//   2. otherwise its own `template_id`;
//   3. otherwise (a quotation made before templates existed) the company
//      default from `GET /quotations/defaults`.

import type { Quotation } from "@/lib/types/Quotation";
import type { QuotationTemplateSnapshot } from "@/lib/types/QuotationTemplate";

export type TemplateChoice =
  | { kind: "snapshot"; snapshot: QuotationTemplateSnapshot }
  | { kind: "id"; id: string }
  | { kind: "none" };

export function chooseTemplate(
  quotation: Pick<Quotation, "template_id" | "template_snapshot">,
  defaultTemplateId: string | null | undefined
): TemplateChoice {
  if (quotation.template_snapshot) return { kind: "snapshot", snapshot: quotation.template_snapshot };
  const id = quotation.template_id || defaultTemplateId;
  return id ? { kind: "id", id } : { kind: "none" };
}
