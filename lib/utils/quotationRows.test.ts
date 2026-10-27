import { describe, expect, it } from 'vitest';
import type { QuotationLeadItem } from '@/lib/api/quotations';
import { newRow, orderFillAction, rowsFromLeadOrder, seedUnitPrice } from './quotationRows';

const orderItem = (overrides: Partial<QuotationLeadItem> = {}): QuotationLeadItem => ({
  id: 'prod-1',
  product_name: 'Kaos Polos',
  sku: 'KAOS-01',
  price: '150000.00',
  quantity: 3,
  total: '450000.00',
  notes: 'Warna navy, sablon depan',
  unit: { id: 'u1', code: 'PCS', name: 'Pcs', precision: 0 },
  custom_fields: { bahan: 'Cotton 30s' },
  resolved_unit_price: '135000.00',
  ...overrides,
});

describe('rowsFromLeadOrder: the client order fills the quotation lines', () => {
  it('turns every ordered product into one line, in order', () => {
    const rows = rowsFromLeadOrder([orderItem(), orderItem({ id: 'prod-2', sku: 'TOPI-01' })]);

    expect(rows.map((r) => r.product_id)).toEqual(['prod-1', 'prod-2']);
  });

  it('copies the product, the ordered quantity and the deal notes', () => {
    const [row] = rowsFromLeadOrder([orderItem()]);

    expect(row).toMatchObject({
      product_id: 'prod-1',
      title: 'Kaos Polos',
      sku: 'KAOS-01',
      qty: 3,
      desc: 'Warna navy, sablon depan',
      unitLabel: 'Pcs',
      unitPrecision: 0,
      attributes: { bahan: 'Cotton 30s' },
    });
  });

  it('shows the price this client resolves to, with the catalogue price as list price', () => {
    const [row] = rowsFromLeadOrder([orderItem()]);

    expect(row.unitPrice).toBe(135000);
    expect(row.listPrice).toBe(150000);
  });

  it('falls back to the catalogue price when the client has no resolved price', () => {
    const [row] = rowsFromLeadOrder([orderItem({ resolved_unit_price: null })]);

    expect(row.unitPrice).toBe(150000);
  });

  it('keeps every other field as a blank line has it, so the line is fully editable', () => {
    const [row] = rowsFromLeadOrder([orderItem()]);
    const blank = newRow();

    expect(row.discountType).toBe(blank.discountType);
    expect(row.discountValue).toBe(0);
    expect(row.overridePrice).toBeNull();
    expect(row.unitId).toBeNull();
  });

  it('handles an order without notes, unit or quantity', () => {
    const [row] = rowsFromLeadOrder([
      orderItem({ notes: null as unknown as string, unit: null, quantity: 0 }),
    ]);

    expect(row.desc).toBe('');
    expect(row.unitLabel).toBeNull();
    expect(row.unitPrecision).toBe(2);
    expect(row.qty).toBe(1);
  });

  it('names a variant and its family', () => {
    const [row] = rowsFromLeadOrder([
      orderItem({
        variant_values: { warna: 'Merah' },
        parent: { id: 'p0', product_name: 'Kaos', sku: 'KAOS' },
      }),
    ]);

    expect(row.variantValues).toEqual({ warna: 'Merah' });
    expect(row.parentName).toBe('Kaos');
  });

  it('gives no lines for an empty order', () => {
    expect(rowsFromLeadOrder([])).toEqual([]);
  });
});

describe('orderFillAction: when the order replaces the lines', () => {
  const order = rowsFromLeadOrder([orderItem()]);
  const picked = { ...newRow(), product_id: 'manual-1' };

  it('fills a form whose lines have no product yet, without asking', () => {
    expect(orderFillAction([newRow()], order)).toBe('fill');
    expect(orderFillAction([newRow(), { ...newRow(), desc: 'typed note only' }], order)).toBe('fill');
  });

  it('asks first when the seller already picked a product on any line', () => {
    expect(orderFillAction([picked], order)).toBe('confirm');
    expect(orderFillAction([newRow(), picked], order)).toBe('confirm');
  });

  it('leaves the lines alone when the client has no order', () => {
    expect(orderFillAction([newRow()], [])).toBe('none');
    expect(orderFillAction([picked], [])).toBe('none');
  });
});

describe('seedUnitPrice', () => {
  it('prefers the resolved price, else the catalogue price', () => {
    expect(seedUnitPrice('150000', '120000')).toBe(120000);
    expect(seedUnitPrice('150000', null)).toBe(150000);
    expect(seedUnitPrice(150000, undefined)).toBe(150000);
  });

  it('falls back to the catalogue price when the resolved price is not a number', () => {
    expect(seedUnitPrice('150000', 'abc')).toBe(150000);
  });
});
