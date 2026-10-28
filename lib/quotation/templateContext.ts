// lib/quotation/templateContext.ts
//
// Builds the data a quotation PDF template is rendered with. The key names are
// a contract with the templates stored by the API (QUOTATION_TEMPLATES_WEB_GUIDE
// section 6): every key is always sent, every value is already formatted text,
// because the templates format nothing.
//
// The helpers below came from the old QuotationPdfDocument, so the template
// prints the same numbers, dates and fallbacks that document did.

import { format, type Locale } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatMoney, formatPercent, formatQuantity, normalizeCurrencyCode } from "@/lib/helper/currency";
import { formatQuantityWithUnit } from "@/lib/helper/quantity";
import { billingPeriodSuffix } from "@/lib/utils/priceSource";
import { promoChipLabel } from "@/lib/constants/promotion";
import { variantValueChips } from "@/lib/utils/variantMatrix";
import { exchangeRateNote } from "@/lib/utils/quotationForm";
import { formatCustomFieldValue, isBlankCustomValue } from "@/lib/utils/customFieldValues";
import { publicQuotationUrl } from "@/lib/api/quotations-public";
import { companyInitials, websiteLabel } from "@/components/admin/companyIdentity";
import type { CompanyGeneral } from "@/lib/types/company-profile";
import type { CustomFieldDefinitionLike } from "@/lib/types/CustomFieldDefinition";
import type { DiscountType, Quotation, QuotationItem } from "@/lib/types/Quotation";
import type { QuotationTemplateContext, QuotationTemplateContextItem } from "@/lib/types/QuotationTemplate";

/** The seller fields a template prints; `GET /companies` returns them all. */
export type TemplateCompany = Pick<
  CompanyGeneral,
  "name" | "email" | "phone_number" | "website" | "address_1" | "address_2" | "city" | "postal_code" | "logo_url"
>;

/** "01 Sep 2026" by default; "-" for a missing or unparsable date. */
export function safeDate(value?: string | null, pattern = "dd MMM yyyy", locale?: Locale): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, pattern, locale ? { locale } : undefined);
}

/** "1 September 2026", the long Indonesian form the letter-style text uses. */
function longDate(value?: string | null): string {
  return safeDate(value, "d MMMM yyyy", idLocale);
}

export function discountLabel(type: DiscountType, value: string | number, currency: string): string {
  return type === "percent" ? `${formatPercent(value)}%` : formatMoney(value, currency);
}

/**
 * The customer address the PDF prints, and where it came from.
 *
 * NPWP and the address come from the quotation's linked CRM company (filled
 * from the lead at create). Its columns are joined in postal order, blanks
 * dropped, so a company with only `address_line` prints one line. Without a
 * CRM address the contact's own free-text address is used and NO npwp is
 * printed: an empty "NPWP:" on an invoice-like document reads as "has none".
 */
export function buildPdfAddressBlock(quotation: Quotation): {
  npwp: string | null;
  address: string | null;
  companyName: string | null;
} {
  const crm = quotation.crm_company ?? null;
  const parts = [crm?.address_line, crm?.kecamatan, crm?.kabupaten, crm?.postal_code]
    .map((part) => (part ?? "").trim())
    .filter(Boolean);
  const crmAddress = parts.length > 0 ? parts.join(", ") : null;
  const companyName = (crm?.name ?? "").trim() || null;

  if (crmAddress) {
    return { npwp: (crm?.npwp ?? "").trim() || null, address: crmAddress, companyName };
  }

  const contactAddress = (quotation.lead?.contact?.address ?? "").trim();
  return { npwp: null, address: contactAddress || null, companyName };
}

const text = (value: string | null | undefined): string => (value ?? "").trim();

function companyContext(company: TemplateCompany | null | undefined): QuotationTemplateContext["company"] {
  const name = text(company?.name);
  const words = name.split(/\s+/).filter(Boolean);
  const website = text(company?.website);
  const address_1 = text(company?.address_1);
  const address_2 = text(company?.address_2);
  const city = text(company?.city);
  const postal_code = text(company?.postal_code);

  return {
    name,
    name_words: words.map((word) => word.toUpperCase()),
    // The monogram the Company Profile shows too ("PT Solvera Global" -> "SG").
    initials: name ? companyInitials(name) : "",
    logo_url: text(company?.logo_url),
    email: text(company?.email),
    phone_number: text(company?.phone_number),
    website,
    website_label: websiteLabel(website),
    address: [address_1, address_2, [city, postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    address_1,
    address_2,
    city,
    postal_code,
  };
}

/** The product's custom fields as one "Brand: X · Warna: Y" line, in definition order. */
function attributesText(
  values: Record<string, unknown> | null | undefined,
  definitions: CustomFieldDefinitionLike[]
): string {
  return definitions
    .filter((definition) => definition.is_active !== false)
    .filter((definition) => !isBlankCustomValue(values?.[definition.field_key]))
    .map(
      (definition) =>
        `${definition.label}: ${formatCustomFieldValue(values?.[definition.field_key], definition.field_type)}`
    )
    .join(" · ");
}

function itemContext(
  item: QuotationItem,
  index: number,
  currency: string,
  productDefinitions: CustomFieldDefinitionLike[]
): QuotationTemplateContextItem {
  return {
    no: index + 1,
    name: item.product_name_snapshot ?? item.product?.product_name ?? "-",
    sku: item.sku_snapshot ?? item.product?.sku ?? "",
    variant: variantValueChips(item.product?.variant_values)
      .map((chip) => chip.label)
      .join(" · "),
    attributes: attributesText(item.product?.custom_fields, productDefinitions),
    notes: text(item.notes),
    quantity: formatQuantityWithUnit(item.quantity, item.unit_label_snapshot, item.product?.unit?.precision ?? 2),
    unit_price: formatMoney(item.unit_price, currency),
    billing_period: billingPeriodSuffix(item.billing_period),
    discount_label:
      Number(item.discount_value) > 0 ? discountLabel(item.discount_type, item.discount_value, currency) : "-",
    line_total: formatMoney(item.line_total, currency),
    promo_label: promoChipLabel(item.promo_code_snapshot),
    bundle_components: (item.bundle_components ?? []).map((component) => ({
      quantity: formatQuantity(component.quantity),
      unit: text(component.unit_label),
      name: text(component.product_name),
    })),
  };
}

export interface BuildTemplateContextInput {
  /** The STORED row (detail or a save's response), never form state. */
  quotation: Quotation;
  /** The seller, from `GET /companies`. */
  company: TemplateCompany | null | undefined;
  /** The company currency (`GET /quotations/defaults`), for the base-currency totals. */
  companyCurrency: string | null | undefined;
  /** Product custom field definitions, for each line's `attributes`. */
  productDefinitions?: CustomFieldDefinitionLike[];
}

export function buildTemplateContext({
  quotation,
  company,
  companyCurrency,
  productDefinitions = [],
}: BuildTemplateContextInput): QuotationTemplateContext {
  const currency = normalizeCurrencyCode(quotation.currency);
  const base = normalizeCurrencyCode(companyCurrency);
  const money = (value: string | number | null | undefined) => formatMoney(value, currency);
  const baseMoney = (value: string | number | null | undefined) => formatMoney(value, base);

  const rate = Number(quotation.exchange_rate_used);
  const isForeign = currency !== base && Number.isFinite(rate) && rate > 0;
  const hasPromo = Number(quotation.promo_discount_total) > 0;
  const taxNote = quotation.prices_include_tax ? "Harga sudah termasuk PPN" : "Harga belum termasuk PPN";

  const block = buildPdfAddressBlock(quotation);
  const contact = quotation.lead?.contact;
  // The server's own link wins; `public_code` covers a row written before the
  // field existed. A draft has neither and prints no acceptance line.
  const acceptanceUrl =
    text(quotation.acceptance_url) || publicQuotationUrl(quotation.public_code) || "";

  const terms = quotation.terms ?? "";
  const paymentTerms = quotation.payment_terms ?? "";
  const expireDateLong = longDate(quotation.expire_date);

  const items = (quotation.items ?? []).map((item, index) =>
    itemContext(item, index, currency, productDefinitions)
  );

  const conditions = [
    `Penawaran berlaku hingga ${expireDateLong}.`,
    `Harga dalam ${currency}, ${taxNote.charAt(0).toLowerCase()}${taxNote.slice(1)}.`,
  ];
  if (terms.trim()) conditions.push(terms);
  if (paymentTerms.trim()) conditions.push(`Termin pembayaran: ${paymentTerms}`);
  if (acceptanceUrl) conditions.push(`Penawaran dapat disetujui online melalui ${acceptanceUrl}.`);

  return {
    company: companyContext(company),
    customer: {
      contact_name: text(contact?.name) || "-",
      company_name: block.companyName || text(contact?.company),
      npwp: block.npwp ?? "",
      address: block.address ?? "",
      email: text(contact?.email),
      phone_number: text(contact?.phone_number),
    },
    sales: {
      name: text(quotation.lead?.user?.fullname),
      email: text(quotation.lead?.user?.email),
    },
    quotation: {
      number: quotation.quotation_number ?? "",
      title: quotation.quotation_title ?? "",
      date: safeDate(quotation.created_at),
      date_long: longDate(quotation.created_at),
      expire_date: safeDate(quotation.expire_date),
      expire_date_long: expireDateLong,
      currency,
      terms,
      payment_terms: paymentTerms,
      acceptance_url: acceptanceUrl,
    },
    items,
    show_discount_column: (quotation.items ?? []).some((item) => Number(item.discount_value) > 0),
    totals: {
      subtotal: money(quotation.subtotal),
      has_promo: hasPromo,
      promo_total: hasPromo ? money(quotation.promo_discount_total) : "",
      has_discount: Number(quotation.discount_total) > 0,
      discount_caption:
        Number(quotation.discount_value) > 0
          ? `Diskon (header ${discountLabel(quotation.discount_type, quotation.discount_value, currency)})`
          : "Diskon",
      discount_total: money(quotation.discount_total),
      taxable: money(quotation.taxable_amount),
      tax_rate: formatPercent(quotation.tax_rate),
      tax_total: money(quotation.tax_total),
      grand_total: money(quotation.grand_total),
      tax_note: taxNote,
    },
    exchange: {
      is_foreign: isForeign,
      rate_note: isForeign
        ? exchangeRateNote(currency, quotation.exchange_rate_used, quotation.exchange_rate_date, base, baseMoney)
        : "",
      base_currency: base,
      tax_total_base: isForeign ? baseMoney(Number(quotation.tax_total) * rate) : "",
      grand_total_base: isForeign ? baseMoney(Number(quotation.grand_total) * rate) : "",
    },
    conditions,
  };
}
