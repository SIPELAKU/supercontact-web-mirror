import QuotationApprovalsClient from "@/components/quotation/QuotationApprovalsClient";

// /sales/quotation/approvals - the tenant approval queue (Phase 4, spec I6).
//
// A STATIC segment beside the dynamic /sales/quotation/[id], which Next's App
// Router always resolves in favour of the static one, so "approvals" can never
// be read as a quotation id here. The API has the mirror-image problem and
// solves it by registration order: `GET /quotations/approvals` is declared
// BEFORE `GET /quotations/{quotation_id}` (spec A29), or FastAPI matches the id
// route and answers 422 on the literal.
export default function QuotationApprovalsPage() {
  return <QuotationApprovalsClient />;
}
