// lib/quotation/formQuotation.ts
//
// The quotation the form currently shows, in the stored-row shape, so the
// template preview beside the picker renders what the seller is editing
// (guide section 7) through the same `buildTemplateContext` as the real PDF.
//
// Money comes from the server's preview (`QuotationTotals`) whenever it has
// priced a line; a line it has not priced yet (just added, preview in flight)
// falls back to the row's own price so it still shows. The real PDF is always
// rendered from the SAVED row, never from this.

import type {
  DiscountType,
  ItemRow,
  LeadContact,
  LeadUser,
  Quotation,
  QuotationCrmCompanyBrief,
  QuotationItem,
  QuotationLineTotals,
  QuotationTotals,
} from "@/lib/types/Quotation";

/** The lead as the client picker knows it (`QuotationLead`) or as a stored row embeds it. */
export interface FormQuotationLead {
  id: string;
  office_location?: string | null;
  contact: Partial<LeadContact> & { id: string };
  user: LeadUser;
  crm_company?: QuotationCrmCompanyBrief | null;
}

export interface FormQuotationInput {
  /** The saved row, if any: number, dates, links and the customer snapshot. */
  stored: Quotation | null;
  lead: FormQuotationLead | null;
  title: string;
  /** yyyy-MM-dd, as the date inputs hold them. */
  issueDate: string;
  expiryDate: string;
  currency: string;
  terms: string;
  paymentTerms: string;
  headerDiscountType: DiscountType;
  headerDiscountValue: number;
  rows: ItemRow[];
  /** The server's preview; null before the first one lands. */
  totals: QuotationTotals | null;
  /** The company basis, for a form the preview has not priced yet. */
  taxRate?: string | null;
  pricesIncludeTax?: boolean | null;
}

const money = (value: number) => value.toFixed(2);

function rowDiscount(row: ItemRow, gross: number): number {
  const value = Number(row.discountValue) || 0;
  return row.discountType === "percent" ? (gross * value) / 100 : value;
}

function itemFromRow(row: ItemRow, line: QuotationLineTotals | undefined, quotationId: string): QuotationItem {
  const unitPrice = row.overridePrice ?? row.unitPrice;
  const gross = (Number(row.qty) || 0) * (Number(unitPrice) || 0);
  const discount = rowDiscount(row, gross);
  const unitPrecision = line?.unit_precision ?? row.unitPrecision;

  return {
    id: null,
    quotation_id: quotationId,
    product_id: row.product_id,
    quantity: line?.quantity ?? String(row.qty),
    list_price: line?.list_price ?? money(row.listPrice),
    unit_price: line?.unit_price ?? money(Number(unitPrice) || 0),
    discount: 0,
    discount_type: line?.discount_type ?? row.discountType,
    discount_value: line?.discount_value ?? String(row.discountValue || 0),
    discount_amount: line?.discount_amount ?? money(discount),
    header_discount_share: line?.header_discount_share ?? "0",
    tax_rate: line?.tax_rate ?? "0",
    tax_amount: line?.tax_amount ?? "0",
    line_total: line?.line_total ?? money(gross - discount),
    price_source: line?.price_source ?? "",
    product_name_snapshot: line?.product_name_snapshot || row.title,
    sku_snapshot: line?.sku_snapshot || row.sku,
    unit_label_snapshot: line?.unit_label ?? line?.unit_label_snapshot ?? row.unitLabel,
    override_reason: null,
    notes: row.desc || null,
    product: {
      id: row.product_id,
      product_name: row.title,
      sku: row.sku,
      price: money(row.listPrice),
      unit: { id: "", code: "", name: row.unitLabel ?? "", precision: unitPrecision },
      custom_fields: row.attributes,
      variant_values: row.variantValues,
    },
    billing_period: line?.billing_period ?? row.billingPeriod,
    bundle_components: line?.bundle_components ?? row.bundleComponents,
    promo_code_snapshot: line?.promo_code ?? row.promoCode,
  };
}

export function quotationFromForm(input: FormQuotationInput): Quotation {
  const { stored, lead, totals } = input;
  const quotationId = stored?.id ?? "draft";

  // A line answers to its row by position (the preview prices `items` in
  // order); rows without a product are not on the quotation yet.
  const items = input.rows
    .map((row, index) => ({ row, line: totals?.lines.find((line) => line.index === index) }))
    .filter(({ row }) => !!row.product_id)
    .map(({ row, line }) => itemFromRow(row, line, quotationId));

  const subtotal = items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
  const lineDiscounts = items.reduce((sum, item) => sum + Number(item.discount_amount), 0);
  const fallbackTaxable = subtotal - lineDiscounts;

  return {
    id: quotationId,
    lead_id: lead?.id ?? stored?.lead_id ?? "",
    quotation_number: stored?.quotation_number || "DRAFT",
    quotation_title: input.title,
    expire_date: input.expiryDate,
    quotation_status: stored?.quotation_status ?? "draft",
    currency: input.currency,
    subtotal: totals?.subtotal ?? money(subtotal),
    line_discount_total: totals?.line_discount_total ?? money(lineDiscounts),
    discount_type: totals?.discount_type ?? input.headerDiscountType,
    discount_value: totals?.discount_value ?? String(input.headerDiscountValue || 0),
    discount_amount: totals?.discount_amount ?? "0",
    discount_total: totals?.discount_total ?? money(lineDiscounts),
    taxable_amount: totals?.taxable_amount ?? money(fallbackTaxable),
    tax_rate: totals?.tax_rate ?? input.taxRate ?? "0",
    tax_total: totals?.tax_total ?? "0",
    prices_include_tax: totals?.prices_include_tax ?? input.pricesIncludeTax ?? false,
    grand_total: totals?.grand_total ?? money(fallbackTaxable),
    terms: input.terms,
    payment_terms: input.paymentTerms,
    revision_of_id: stored?.revision_of_id ?? null,
    revision_no: stored?.revision_no ?? 0,
    sent_at: stored?.sent_at ?? null,
    accepted_at: stored?.accepted_at ?? null,
    public_code: stored?.public_code ?? null,
    acceptance_url: stored?.acceptance_url ?? null,
    exchange_rate_used: totals?.exchange_rate_used ?? stored?.exchange_rate_used ?? null,
    exchange_rate_date: totals?.exchange_rate_date ?? stored?.exchange_rate_date ?? null,
    promo_discount_total: totals?.promo_discount_total ?? null,
    // The stored customer snapshot wins on a saved quotation (its client is
    // fixed); a new one shows the picked lead's company.
    crm_company: stored?.crm_company ?? lead?.crm_company ?? null,
    lead: {
      id: lead?.id ?? stored?.lead?.id ?? "",
      office_location: lead?.office_location ?? stored?.lead?.office_location ?? "",
      contact: {
        id: lead?.contact.id ?? stored?.lead?.contact?.id ?? "",
        name: lead?.contact.name ?? stored?.lead?.contact?.name ?? null,
        email: lead?.contact.email ?? stored?.lead?.contact?.email ?? null,
        phone_number: lead?.contact.phone_number ?? stored?.lead?.contact?.phone_number ?? null,
        company: lead?.contact.company ?? stored?.lead?.contact?.company ?? null,
        address: lead?.contact.address ?? stored?.lead?.contact?.address ?? null,
      },
      user: lead?.user ?? stored?.lead?.user ?? { id: "", fullname: "", email: "" },
    },
    items,
    created_at: stored?.created_at ?? input.issueDate,
    updated_at: stored?.updated_at ?? input.issueDate,
    template_id: stored?.template_id ?? null,
  };
}
