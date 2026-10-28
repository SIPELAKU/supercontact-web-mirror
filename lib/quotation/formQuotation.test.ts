import { describe, expect, it } from 'vitest';

import { quotationFromForm, type FormQuotationInput } from './formQuotation';
import { buildTemplateContext } from './templateContext';
import { SAMPLE_QUOTATION } from './sampleQuotation';
import type { ItemRow, QuotationLineTotals, QuotationTotals } from '../types/Quotation';

function row(overrides: Partial<ItemRow> = {}): ItemRow {
  return {
    product_id: 'p-gula',
    title: 'Gula Pasir 1kg',
    sku: 'P5-GULA-1KG',
    desc: '',
    qty: 1,
    unitPrice: 18000,
    listPrice: 18000,
    discountType: 'percent',
    discountValue: 0,
    unitLabel: 'pcs',
    unitPrecision: 0,
    attributes: {},
    overridePrice: null,
    overrideReason: '',
    overrideAllowed: false,
    priceList: null,
    billingPeriod: null,
    costSnapshot: null,
    marginPercent: null,
    unitId: null,
    unitOptions: [],
    variantValues: {},
    parentName: null,
    bundleComponents: null,
    promoCode: null,
    promoDiscountAmount: null,
    prePromoUnitPrice: null,
    ...overrides,
  };
}

function line(index: number, overrides: Partial<QuotationLineTotals> = {}): QuotationLineTotals {
  return {
    index,
    product_id: 'p',
    quantity: '1.00',
    list_price: '0',
    unit_price: '0',
    gross: '0',
    discount_type: 'percent',
    discount_value: '0.00',
    discount_amount: '0.00',
    header_discount_share: '0.00',
    taxable_amount: '0',
    tax_rate: '11.00',
    tax_amount: '0',
    line_total: '0',
    price_source: 'base_price',
    product_name_snapshot: '',
    sku_snapshot: '',
    effective_discount_percent: '0.00',
    ...overrides,
  };
}

const bundle = row({
  product_id: 'p-paket',
  title: 'Paket Hemat',
  sku: 'P5-PAKET-HEMAT',
  qty: 10,
  unitPrice: 75000,
  listPrice: 75000,
  desc: 'Kirim minggu depan',
});
const gula = row();

const totals: QuotationTotals = {
  currency: 'IDR',
  tax_rate: '11.00',
  prices_include_tax: false,
  subtotal: '767000.00',
  line_discount_total: '0.00',
  discount_type: 'percent',
  discount_value: '0.00',
  discount_amount: '0.00',
  discount_total: '0.00',
  taxable_amount: '767000.00',
  tax_total: '84370.00',
  grand_total: '851370.00',
  lines: [
    line(0, {
      product_id: 'p-paket',
      quantity: '10.00',
      unit_price: '75000.00',
      line_total: '832500.00',
      product_name_snapshot: 'Paket Hemat',
      sku_snapshot: 'P5-PAKET-HEMAT',
      unit_label: 'pcs',
      bundle_components: [
        { product_id: 'k', product_name: 'Kopi Bubuk 250g', quantity: '1.00', unit_label: 'pcs' },
        { product_id: 'g', product_name: 'Gula Pasir 1kg', quantity: '2.00', unit_label: 'pcs' },
      ],
    }),
    line(1, {
      product_id: 'p-gula',
      quantity: '1.00',
      unit_price: '17000.00',
      line_total: '18870.00',
      product_name_snapshot: 'Gula Pasir 1kg',
      sku_snapshot: 'P5-GULA-1KG',
      unit_label: 'pcs',
    }),
  ],
};

const lead = {
  id: 'lead-1',
  office_location: '',
  contact: { id: 'c1', name: 'Rina', email: 'rina@toko.id', phone_number: '0812', company: 'Toko Rina', address: 'Jl. Pasar 3' },
  user: { id: 'u1', fullname: 'Sales Satu', email: 'sales@co.id' },
  crm_company: null,
};

const base: FormQuotationInput = {
  stored: null,
  lead,
  title: 'Penawaran Toko Rina',
  issueDate: '2026-10-28',
  expiryDate: '2026-11-04',
  currency: 'IDR',
  terms: 'Harga dapat berubah.',
  paymentTerms: 'Lunas di muka',
  headerDiscountType: 'percent',
  headerDiscountValue: 0,
  rows: [bundle, gula],
  totals,
};

describe('quotationFromForm', () => {
  it('prints the products on the form, priced by the server preview', () => {
    const context = buildTemplateContext({
      quotation: quotationFromForm(base),
      company: null,
      companyCurrency: 'IDR',
    });
    expect(context.items.map((item) => item.name)).toEqual(['Paket Hemat', 'Gula Pasir 1kg']);
    expect(context.items[0]).toMatchObject({
      sku: 'P5-PAKET-HEMAT',
      quantity: '10 pcs',
      unit_price: 'Rp 75.000',
      line_total: 'Rp 832.500',
      notes: 'Kirim minggu depan',
      bundle_components: [
        { quantity: '1', unit: 'pcs', name: 'Kopi Bubuk 250g' },
        { quantity: '2', unit: 'pcs', name: 'Gula Pasir 1kg' },
      ],
    });
    expect(context.items[1]).toMatchObject({ unit_price: 'Rp 17.000', line_total: 'Rp 18.870' });
    expect(context.totals).toMatchObject({ subtotal: 'Rp 767.000', tax_total: 'Rp 84.370', grand_total: 'Rp 851.370' });
  });

  it('takes the header, customer and sales from the form', () => {
    const context = buildTemplateContext({ quotation: quotationFromForm(base), company: null, companyCurrency: 'IDR' });
    expect(context.quotation).toMatchObject({
      number: 'DRAFT',
      title: 'Penawaran Toko Rina',
      date: '28 Oct 2026',
      expire_date: '04 Nov 2026',
      terms: 'Harga dapat berubah.',
      payment_terms: 'Lunas di muka',
    });
    expect(context.customer).toMatchObject({ contact_name: 'Rina', company_name: 'Toko Rina', address: 'Jl. Pasar 3' });
    expect(context.sales).toEqual({ name: 'Sales Satu', email: 'sales@co.id' });
  });

  it('keeps the saved number, dates and customer snapshot of a stored quotation', () => {
    const stored = { ...SAMPLE_QUOTATION, quotation_number: 'QUO-26-050', created_at: '2026-10-01T08:00:00' };
    const quotation = quotationFromForm({ ...base, stored, lead: null });
    expect(quotation.quotation_number).toBe('QUO-26-050');
    expect(quotation.created_at).toBe('2026-10-01T08:00:00');
    expect(quotation.lead.contact.name).toBe(SAMPLE_QUOTATION.lead.contact.name);
  });

  it('leaves out rows without a product', () => {
    const quotation = quotationFromForm({ ...base, rows: [bundle, row({ product_id: '' }), gula] });
    expect(quotation.items).toHaveLength(2);
  });

  it('shows a row the preview has not priced yet at its own price', () => {
    const added = row({ product_id: 'p-kopi', title: 'Kopi', sku: 'KOPI', qty: 2, unitPrice: 30000, discountValue: 10 });
    const [, , kopi] = quotationFromForm({ ...base, rows: [bundle, gula, added] }).items;
    expect(kopi).toMatchObject({
      product_name_snapshot: 'Kopi',
      unit_price: '30000.00',
      discount_value: '10',
      line_total: '54000.00',
    });
  });

  it('prints the server totals, not a sum of the rows', () => {
    const promoted = { ...totals, subtotal: '760000.00', promo_discount_total: '7000.00' };
    expect(quotationFromForm({ ...base, totals: promoted })).toMatchObject({
      subtotal: '760000.00',
      promo_discount_total: '7000.00',
    });
  });

  it('adds up the rows when no preview has landed yet', () => {
    const quotation = quotationFromForm({
      ...base,
      totals: null,
      rows: [row({ qty: 2, unitPrice: 10000, discountValue: 10 })],
      taxRate: '11.00',
    });
    expect(quotation).toMatchObject({
      subtotal: '20000.00',
      discount_total: '2000.00',
      taxable_amount: '18000.00',
      tax_rate: '11.00',
    });
  });
});
