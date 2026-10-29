import { describe, expect, it } from 'vitest';

import { buildTemplateContext, type TemplateCompany } from './templateContext';
import { SAMPLE_QUOTATION } from './sampleQuotation';
import type { Quotation } from '../types/Quotation';
import type { CustomFieldDefinitionLike } from '../types/CustomFieldDefinition';

const company: TemplateCompany = {
  name: 'Solvera Global Teknologi',
  email: 'official@solvera.id',
  phone_number: '+62 812 3456 7890',
  website: 'https://solvera.id/',
  address_1: 'Jl. Sudirman No. 10',
  address_2: '',
  city: 'Jakarta',
  postal_code: '10220',
  logo_url: null,
};

const build = (quotation: Partial<Quotation> = {}, extra: Partial<Parameters<typeof buildTemplateContext>[0]> = {}) =>
  buildTemplateContext({
    quotation: { ...SAMPLE_QUOTATION, ...quotation },
    company,
    companyCurrency: 'IDR',
    ...extra,
  });

describe('buildTemplateContext', () => {
  it('sends every key of the template contract', () => {
    const context = build();
    expect(Object.keys(context).sort()).toEqual(
      ['company', 'conditions', 'customer', 'exchange', 'items', 'quotation', 'sales', 'show_discount_column', 'totals'].sort()
    );
    expect(Object.keys(context.company).sort()).toEqual(
      ['name', 'name_words', 'initials', 'logo_url', 'email', 'phone_number', 'website', 'website_label', 'address', 'address_1', 'address_2', 'city', 'postal_code'].sort()
    );
    expect(Object.keys(context.customer).sort()).toEqual(
      ['contact_name', 'company_name', 'npwp', 'address', 'email', 'phone_number'].sort()
    );
    expect(Object.keys(context.quotation).sort()).toEqual(
      ['number', 'title', 'date', 'date_long', 'expire_date', 'expire_date_long', 'currency', 'terms', 'payment_terms', 'acceptance_url'].sort()
    );
    expect(Object.keys(context.items[0]).sort()).toEqual(
      ['no', 'name', 'sku', 'variant', 'attributes', 'notes', 'quantity', 'unit_price', 'billing_period', 'discount_label', 'line_total', 'promo_label', 'bundle_components'].sort()
    );
    expect(Object.keys(context.totals).sort()).toEqual(
      ['subtotal', 'has_promo', 'promo_total', 'has_discount', 'discount_caption', 'discount_total', 'taxable', 'tax_rate', 'tax_total', 'grand_total', 'tax_note'].sort()
    );
    expect(Object.keys(context.exchange).sort()).toEqual(
      ['is_foreign', 'rate_note', 'base_currency', 'tax_total_base', 'grand_total_base'].sort()
    );
  });

  it('derives the seller wordmark, initials, website label and address', () => {
    expect(build().company).toMatchObject({
      name: 'Solvera Global Teknologi',
      name_words: ['SOLVERA', 'GLOBAL', 'TEKNOLOGI'],
      initials: 'SG',
      logo_url: '',
      website_label: 'solvera.id',
      address: 'Jl. Sudirman No. 10, Jakarta 10220',
    });
  });

  it('uses the Company Profile monogram, skipping the legal form', () => {
    expect(build({}, { company: { ...company, name: 'PT solvera global' } }).company.initials).toBe('SG');
  });

  it('prints blanks, not "null", when the company is missing', () => {
    const seller = build({}, { company: null }).company;
    expect(seller).toMatchObject({ name: '', name_words: [], initials: '', address: '', website_label: '' });
  });

  it('formats dates short and long (Indonesian)', () => {
    expect(build().quotation).toMatchObject({
      date: '01 Sep 2026',
      date_long: '1 September 2026',
      expire_date: '08 Sep 2026',
      expire_date_long: '8 September 2026',
    });
  });

  it('formats the lines like the old PDF', () => {
    const [first, second, third] = build().items;
    expect(first).toMatchObject({
      no: 1,
      name: 'Mesin Kasir POS-200',
      sku: 'POS-200',
      quantity: '1 unit',
      unit_price: 'Rp 6.612.923',
      discount_label: '5%',
      line_total: 'Rp 6.282.277',
      billing_period: '',
      bundle_components: [],
    });
    expect(second.no).toBe(2);
    expect(second.notes).toContain('training');
    expect(third.billing_period).toBe('/bulan');
  });

  it('prints "-" for a line without a discount and hides the column when no line has one', () => {
    const items = SAMPLE_QUOTATION.items.map((item) => ({ ...item, discount_value: '0' }));
    const context = build({ items });
    expect(context.items[0].discount_label).toBe('-');
    expect(context.show_discount_column).toBe(false);
    expect(build().show_discount_column).toBe(true);
  });

  it('names an amount discount in the quotation currency', () => {
    const items = [{ ...SAMPLE_QUOTATION.items[0], discount_type: 'amount' as const, discount_value: '50000' }];
    expect(build({ items }).items[0].discount_label).toBe('Rp 50.000');
  });

  it('lists variants, active attributes, bundle components and the promo in the line', () => {
    const definitions: CustomFieldDefinitionLike[] = [
      { field_key: 'brand', label: 'Brand', field_type: 'text', is_required: false, select_options: null },
      { field_key: 'color', label: 'Warna', field_type: 'text', is_required: false, select_options: null },
      { field_key: 'old', label: 'Lama', field_type: 'text', is_required: false, select_options: null, is_active: false },
      { field_key: 'empty', label: 'Kosong', field_type: 'text', is_required: false, select_options: null },
    ];
    const base = SAMPLE_QUOTATION.items[0];
    const items = [
      {
        ...base,
        product: {
          ...base.product,
          variant_values: { Ukuran: 'L', Warna: 'Hitam' },
          custom_fields: { brand: 'Epson', color: 'Hitam', old: 'x', empty: '' },
        },
        bundle_components: [
          { product_id: 'p1', product_name: 'Printer Struk', quantity: '1.00', unit_label: 'unit' },
          { product_id: 'p2', product_name: 'Kertas', quantity: '10.00', unit_label: null },
        ],
        promo_code_snapshot: 'HEMAT10',
      },
    ];
    const [line] = build({ items }, { productDefinitions: definitions }).items;
    expect(line.variant).toBe('Ukuran: L · Warna: Hitam');
    expect(line.attributes).toBe('Brand: Epson · Warna: Hitam');
    expect(line.bundle_components).toEqual([
      { quantity: '1', unit: 'unit', name: 'Printer Struk' },
      { quantity: '10', unit: '', name: 'Kertas' },
    ]);
    expect(line.promo_label).toBe('Promo HEMAT10');
  });

  it('builds the totals, with the discount unsigned and the header discount in the caption', () => {
    expect(build().totals).toEqual({
      subtotal: 'Rp 16.334.535',
      has_promo: false,
      promo_total: '',
      has_discount: true,
      discount_caption: 'Diskon',
      discount_total: 'Rp 816.727',
      taxable: 'Rp 15.517.808',
      tax_rate: '11',
      tax_total: 'Rp 1.706.959',
      grand_total: 'Rp 17.224.767',
      tax_note: 'Harga belum termasuk PPN',
    });
    const header = build({ discount_type: 'percent', discount_value: '10', promo_discount_total: '25000' }).totals;
    expect(header.discount_caption).toBe('Diskon (header 10%)');
    expect(header).toMatchObject({ has_promo: true, promo_total: 'Rp 25.000' });
    expect(build({ discount_total: '0' }).totals.has_discount).toBe(false);
    expect(build({ prices_include_tax: true }).totals.tax_note).toBe('Harga sudah termasuk PPN');
  });

  it('adds the rate and the company-currency totals only for a foreign quotation with a rate', () => {
    expect(build().exchange).toEqual({
      is_foreign: false,
      rate_note: '',
      base_currency: 'IDR',
      tax_total_base: '',
      grand_total_base: '',
    });

    const usd = build({
      currency: 'usd',
      exchange_rate_used: '16250.000000',
      exchange_rate_date: '2026-09-01',
      tax_total: '11.00',
      grand_total: '111.00',
    });
    expect(usd.quotation.currency).toBe('USD');
    expect(usd.exchange).toMatchObject({
      is_foreign: true,
      base_currency: 'IDR',
      tax_total_base: 'Rp 178.750',
      grand_total_base: 'Rp 1.803.750',
    });
    expect(usd.exchange.rate_note).toMatch(/^Kurs 1 USD = Rp 16\.250 per 1 Sep 2026$/);

    expect(build({ currency: 'USD', exchange_rate_used: null }).exchange.is_foreign).toBe(false);
  });

  it('lists the conditions in the fixed order, skipping the empty ones', () => {
    expect(build().conditions).toEqual([
      'Penawaran berlaku hingga 8 September 2026.',
      'Harga dalam IDR, harga belum termasuk PPN.',
      'Penawaran ini bukan invoice dan hanya merupakan estimasi barang/jasa.',
      'Termin pembayaran: 50% di muka, 50% setelah barang/jasa diserahkan.',
    ]);
    expect(
      build({ terms: '  ', payment_terms: null, acceptance_url: 'https://app.example/q/abc' }).conditions
    ).toEqual([
      'Penawaran berlaku hingga 8 September 2026.',
      'Harga dalam IDR, harga belum termasuk PPN.',
      'Penawaran dapat disetujui online melalui https://app.example/q/abc.',
    ]);
  });

  it('falls back to the public code for the acceptance link', () => {
    expect(build({ public_code: 'abc' }).quotation.acceptance_url).toBe('/q/abc');
    expect(build().quotation.acceptance_url).toBe('');
  });

  it('prints the CRM company with its NPWP, or the contact address without one', () => {
    const crm = build({
      crm_company: {
        id: 'c1',
        name: 'PT Legal Entity',
        npwp: '01.234.567.8-901.000',
        address_line: 'Jl. Asia Afrika 8',
        kecamatan: 'Sumur Bandung',
        kabupaten: 'Kota Bandung',
        postal_code: '40111',
      },
    }).customer;
    expect(crm).toMatchObject({
      company_name: 'PT Legal Entity',
      npwp: '01.234.567.8-901.000',
      address: 'Jl. Asia Afrika 8, Sumur Bandung, Kota Bandung, 40111',
    });

    // A CRM company without an address: the contact's address, and no NPWP.
    expect(
      build({ crm_company: { id: 'c1', name: 'PT Legal Entity', npwp: '01.234.567.8-901.000', address_line: ' ' } }).customer
    ).toMatchObject({ company_name: 'PT Legal Entity', npwp: '', address: 'Jl. Merdeka No. 1, Bandung 40111' });

    expect(build().customer).toEqual({
      contact_name: 'Budi Santoso',
      company_name: 'PT Contoh Pelanggan',
      npwp: '',
      address: 'Jl. Merdeka No. 1, Bandung 40111',
      email: 'budi@contohpelanggan.co.id',
      phone_number: '+62 811 0000 1234',
    });
  });

  it('names the sales person from the lead', () => {
    expect(build().sales).toEqual({ name: 'Andi Pratama', email: 'andi@perusahaan.co.id' });
  });
});
