// lib/quotation/sampleQuotation.ts
//
// A fixed quotation the Settings › Template Quotation previews are rendered
// with, so every template is shown with the same data next to the company's
// real name, logo and contacts. Shaped like a stored row (`GET /quotations/{id}`)
// so it goes through the same `buildTemplateContext` as a real PDF.
//
// The numbers add up the way the API computes them: subtotal is before the
// line discounts, discount_total is their sum, grand total = taxable + tax.

import type { Quotation, QuotationItem } from "@/lib/types/Quotation";

function sampleItem(item: Partial<QuotationItem> & Pick<QuotationItem, "id" | "product_name_snapshot">): QuotationItem {
  return {
    quotation_id: "sample",
    product_id: `${item.id}-product`,
    quantity: "1",
    list_price: item.unit_price ?? "0",
    unit_price: "0",
    discount: 0,
    discount_type: "percent",
    discount_value: "0",
    discount_amount: "0",
    header_discount_share: "0",
    tax_rate: "0",
    tax_amount: "0",
    line_total: "0",
    price_source: "manual",
    sku_snapshot: null,
    unit_label_snapshot: null,
    override_reason: null,
    notes: null,
    product: {
      id: `${item.id}-product`,
      product_name: item.product_name_snapshot ?? "",
      sku: item.sku_snapshot ?? "",
      price: item.unit_price ?? "0",
    },
    ...item,
  };
}

export const SAMPLE_QUOTATION: Quotation = {
  id: "sample",
  lead_id: "sample-lead",
  quotation_number: "QUO-26-008",
  quotation_title: "Penawaran Sistem Kasir untuk PT Contoh Pelanggan",
  expire_date: "2026-09-08T00:00:00",
  quotation_status: "draft",
  currency: "IDR",
  subtotal: "16334535.00",
  line_discount_total: "816727.00",
  discount_type: "percent",
  discount_value: "0",
  discount_amount: "0",
  discount_total: "816727.00",
  taxable_amount: "15517808.00",
  tax_rate: "11.00",
  tax_total: "1706959.00",
  prices_include_tax: false,
  grand_total: "17224767.00",
  terms: "Penawaran ini bukan invoice dan hanya merupakan estimasi barang/jasa.",
  payment_terms: "50% di muka, 50% setelah barang/jasa diserahkan.",
  revision_of_id: null,
  revision_no: 0,
  sent_at: null,
  accepted_at: null,
  public_code: null,
  lead: {
    id: "sample-lead",
    office_location: "",
    contact: {
      id: "sample-contact",
      name: "Budi Santoso",
      email: "budi@contohpelanggan.co.id",
      phone_number: "+62 811 0000 1234",
      company: "PT Contoh Pelanggan",
      address: "Jl. Merdeka No. 1, Bandung 40111",
    },
    user: { id: "sample-user", fullname: "Andi Pratama", email: "andi@perusahaan.co.id" },
  },
  items: [
    sampleItem({
      id: "sample-1",
      product_name_snapshot: "Mesin Kasir POS-200",
      sku_snapshot: "POS-200",
      quantity: "1",
      unit_price: "6612923.00",
      discount_value: "5",
      line_total: "6282277.00",
      unit_label_snapshot: "unit",
    }),
    sampleItem({
      id: "sample-2",
      product_name_snapshot: "Implementasi & Training",
      sku_snapshot: "SVC-IMPL",
      quantity: "2",
      unit_price: "3250000.00",
      discount_value: "5",
      line_total: "6175000.00",
      unit_label_snapshot: "sesi",
      notes: "Termasuk 2 sesi training online untuk kasir dan admin.",
    }),
    sampleItem({
      id: "sample-3",
      product_name_snapshot: "Lisensi Aplikasi Kasir",
      sku_snapshot: "LIC-POS",
      quantity: "1",
      unit_price: "3221612.00",
      discount_value: "5",
      line_total: "3060531.00",
      billing_period: "monthly",
    }),
  ],
  created_at: "2026-09-01T09:00:00",
  updated_at: "2026-09-01T09:00:00",
};
