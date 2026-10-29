// lib/types/QuotationTemplate.ts
//
// Quotation PDF templates (API v1.152.0): Handlebars HTML + CSS stored by the
// API and rendered by the web. Ids are minted by Postgres and differ per
// environment, so nothing here may be keyed on a name or a hardcoded id.

/** One row of `GET /quotation-templates`; no html/css. */
export interface QuotationTemplateItem {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_default: boolean;
}

/** `GET /quotation-templates/{id}`: the row plus its source. */
export interface QuotationTemplateDetail extends QuotationTemplateItem {
  html: string;
  css: string;
}

/** `GET /quotation-templates` and `PUT /quotation-templates/default`. Items are in display order. */
export interface QuotationTemplateList {
  /** Null only on a database that has not run the template migration. */
  default_template_id: string | null;
  items: QuotationTemplateItem[];
}

/** The template a quotation was frozen with when it first left draft. */
export interface QuotationTemplateSnapshot {
  id: string;
  name: string;
  html: string;
  css: string;
}

/** What a template is rendered with: html and css, from a detail or a snapshot. */
export interface QuotationTemplateSource {
  html: string;
  css: string;
}

/**
 * The data every template is rendered with. The key names are a CONTRACT with
 * the templates stored by the API: every key is always present, every text is
 * already formatted (the templates format nothing), empty means "" / false / [].
 */
export interface QuotationTemplateContext {
  company: {
    name: string;
    /** Upper-cased words of the name, for the text wordmarks. */
    name_words: string[];
    /** First letters of the first two words ("SG"). */
    initials: string;
    /** "" when there is no logo; the templates fall back to the name or initials. */
    logo_url: string;
    email: string;
    phone_number: string;
    website: string;
    /** The website without its scheme and trailing slash. */
    website_label: string;
    /** address_1, address_2 and "city postal_code", the non-blank ones joined by ", ". */
    address: string;
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
  };
  customer: {
    contact_name: string;
    company_name: string;
    npwp: string;
    address: string;
    email: string;
    phone_number: string;
  };
  sales: {
    name: string;
    email: string;
  };
  quotation: {
    number: string;
    title: string;
    /** "01 Sep 2026" */
    date: string;
    /** "1 September 2026" */
    date_long: string;
    expire_date: string;
    expire_date_long: string;
    currency: string;
    terms: string;
    payment_terms: string;
    acceptance_url: string;
  };
  items: QuotationTemplateContextItem[];
  /** True when any line carries a discount. */
  show_discount_column: boolean;
  totals: {
    subtotal: string;
    has_promo: boolean;
    promo_total: string;
    has_discount: boolean;
    /** "Diskon" or "Diskon (header 10%)". */
    discount_caption: string;
    /** Without a minus sign; the templates print "- ". */
    discount_total: string;
    taxable: string;
    /** "11" */
    tax_rate: string;
    tax_total: string;
    grand_total: string;
    tax_note: string;
  };
  exchange: {
    is_foreign: boolean;
    rate_note: string;
    base_currency: string;
    tax_total_base: string;
    grand_total_base: string;
  };
  /** The "Ketentuan penawaran" list, in a fixed order. */
  conditions: string[];
}

export interface QuotationTemplateContextItem {
  no: number;
  name: string;
  sku: string;
  variant: string;
  /** The product's custom fields as "Brand: X · Warna: Y". */
  attributes: string;
  notes: string;
  quantity: string;
  unit_price: string;
  /** "/bulan" for a recurring line. */
  billing_period: string;
  /** "5%", "Rp 50.000" or "-". */
  discount_label: string;
  line_total: string;
  promo_label: string;
  bundle_components: { quantity: string; unit: string; name: string }[];
}
