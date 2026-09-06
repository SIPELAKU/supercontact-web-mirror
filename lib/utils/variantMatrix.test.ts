import { describe, expect, it } from 'vitest';
import {
  VARIANT_BULK_MAX,
  VARIANT_SKU_MAX_LENGTH,
  buildVariantMatrix,
  draftRowFrom,
  parseAxisValues,
  reseedDraftRows,
  suggestVariantSku,
  usableAxes,
  validateVariantDraft,
  variantCreatePayload,
  variantMatrixSize,
  variantValueChips,
  type VariantDraftRow,
} from './variantMatrix';

/**
 * COMMERCIAL Phase 5 (spec I4 / A9 / A2).
 *
 * The matrix editor posts ONE bulk request for the whole grid, in ONE server
 * transaction. That is what makes these three functions expensive to get wrong:
 * a bad cartesian product ships twelve wrong rows at once, and a missed local
 * duplicate SKU comes back as a single 409 for the batch with no row named -
 * the seller sees "gagal" and has no idea which of the twelve caused it.
 */
describe('parseAxisValues', () => {
  it('splits, trims and drops the blanks a trailing comma leaves', () => {
    expect(parseAxisValues('Merah, Biru , Hijau')).toEqual(['Merah', 'Biru', 'Hijau']);
    expect(parseAxisValues('Merah,,Biru,')).toEqual(['Merah', 'Biru']);
    expect(parseAxisValues('   ')).toEqual([]);
    expect(parseAxisValues('')).toEqual([]);
  });

  it('drops a case-insensitive duplicate and keeps the FIRST spelling', () => {
    // "Merah, merah" is one colour to a human. Left as two, the rows would
    // differ only by case inside `variant_values` and no screen afterwards
    // could tell them apart.
    expect(parseAxisValues('Merah, merah, MERAH')).toEqual(['Merah']);
    expect(parseAxisValues('S, s, M')).toEqual(['S', 'M']);
  });
});

describe('buildVariantMatrix', () => {
  it('expands two axes with the LAST axis varying fastest', () => {
    const matrix = buildVariantMatrix([
      { name: 'Warna', values: ['Merah', 'Biru'] },
      { name: 'Ukuran', values: ['S', 'M'] },
    ]);
    expect(matrix.map((row) => row.label)).toEqual([
      'Merah / S',
      'Merah / M',
      'Biru / S',
      'Biru / M',
    ]);
    expect(matrix[0].values).toEqual({ Warna: 'Merah', Ukuran: 'S' });
    expect(matrix[3].values).toEqual({ Warna: 'Biru', Ukuran: 'M' });
  });

  it('handles one axis, and three, at the size the count promises', () => {
    expect(buildVariantMatrix([{ name: 'Warna', values: ['Merah'] }]).map((r) => r.label)).toEqual([
      'Merah',
    ]);
    const axes = [
      { name: 'Warna', values: ['Merah', 'Biru'] },
      { name: 'Ukuran', values: ['S', 'M', 'L'] },
      { name: 'Bahan', values: ['Katun', 'Linen'] },
    ];
    expect(buildVariantMatrix(axes)).toHaveLength(12);
    expect(variantMatrixSize(axes)).toBe(12);
  });

  it('returns NOTHING - never one empty row - when no axis is usable', () => {
    // One empty combination would post `variant_values: {}`, which the schema's
    // `min_length=1` refuses; the screen must show an empty state instead.
    expect(buildVariantMatrix([])).toEqual([]);
    expect(buildVariantMatrix([{ name: '', values: ['Merah'] }])).toEqual([]);
    expect(buildVariantMatrix([{ name: 'Warna', values: [] }])).toEqual([]);
    expect(variantMatrixSize([{ name: 'Warna', values: [] }])).toBe(0);
    expect(usableAxes([{ name: ' Warna ', values: ['Merah'] }])).toEqual([
      { name: 'Warna', values: ['Merah'] },
    ]);
  });

  it('gives every row a stable key that survives a re-expansion', () => {
    const first = buildVariantMatrix([{ name: 'Warna', values: ['Merah', 'Biru'] }]);
    const second = buildVariantMatrix([{ name: 'Warna', values: ['Merah', 'Biru', 'Hijau'] }]);
    expect(second[0].key).toBe(first[0].key);
    expect(second[1].key).toBe(first[1].key);
  });
});

describe('suggestVariantSku', () => {
  it('joins the parent SKU and the values as an uppercase slug', () => {
    expect(suggestVariantSku('KAOS', { Warna: 'Merah', Ukuran: 'S' })).toBe('KAOS-MERAH-S');
    expect(suggestVariantSku('kaos-01', { Warna: 'Biru Muda' })).toBe('KAOS-01-BIRU-MUDA');
  });

  it('turns anything that cannot live in a code into the separator', () => {
    expect(suggestVariantSku('KAOS', { Ukuran: 'XL / XXL' })).toBe('KAOS-XL-XXL');
    expect(suggestVariantSku('KAOS', { Warna: '  Merah  ' })).toBe('KAOS-MERAH');
    // No leading or trailing separator, ever.
    expect(suggestVariantSku('', { Warna: 'Merah' })).toBe('MERAH');
  });

  it('never exceeds the SKU column, because the server would refuse the batch', () => {
    const suggestion = suggestVariantSku('P'.repeat(60), { Warna: 'Merah', Ukuran: 'Sangat Besar' });
    expect(suggestion.length).toBeLessThanOrEqual(VARIANT_SKU_MAX_LENGTH);
  });
});

describe('reseedDraftRows', () => {
  const parentSku = 'KAOS';
  const parentPrice = '100000';

  it('KEEPS what the seller typed for combinations that survive a change', () => {
    // Adding "L" to the size axis must not wipe the prices already entered:
    // the grid is re-expanded on every keystroke in the axis inputs.
    const before = buildVariantMatrix([
      { name: 'Warna', values: ['Merah'] },
      { name: 'Ukuran', values: ['S', 'M'] },
    ]).map((c) => draftRowFrom(c, parentSku, parentPrice));
    const edited = before.map((row) =>
      row.label === 'Merah / S' ? { ...row, price: '150000', sku: 'CUSTOM-1' } : row
    );

    const after = reseedDraftRows(
      buildVariantMatrix([
        { name: 'Warna', values: ['Merah'] },
        { name: 'Ukuran', values: ['S', 'M', 'L'] },
      ]),
      edited,
      parentSku,
      parentPrice
    );

    expect(after).toHaveLength(3);
    expect(after[0]).toMatchObject({ label: 'Merah / S', price: '150000', sku: 'CUSTOM-1' });
    expect(after[1]).toMatchObject({ label: 'Merah / M', price: '100000' });
    // The new row is seeded fresh, from the parent's price.
    expect(after[2]).toMatchObject({ label: 'Merah / L', price: '100000', sku: 'KAOS-MERAH-L' });
  });

  it('seeds a fresh row from the PARENT price and suggests its SKU', () => {
    const [row] = buildVariantMatrix([{ name: 'Warna', values: ['Merah'] }]).map((c) =>
      draftRowFrom(c, parentSku, parentPrice)
    );
    expect(row).toEqual({
      key: 'merah',
      label: 'Merah',
      values: { Warna: 'Merah' },
      sku: 'KAOS-MERAH',
      price: '100000',
      cost: '',
      selected: true,
    });
  });
});

describe('validateVariantDraft', () => {
  const row = (over: Partial<VariantDraftRow>): VariantDraftRow => ({
    key: 'merah',
    label: 'Merah',
    values: { Warna: 'Merah' },
    sku: 'KAOS-MERAH',
    price: '100000',
    cost: '',
    selected: true,
    ...over,
  });

  it('passes a well-formed batch', () => {
    expect(validateVariantDraft([row({}), row({ key: 'biru', label: 'Biru', sku: 'KAOS-BIRU' })])).toEqual(
      []
    );
  });

  it('refuses a batch with nothing selected', () => {
    expect(validateVariantDraft([row({ selected: false })])).toEqual([
      { key: '_', field: '_', message: 'Pilih minimal satu varian' },
    ]);
    expect(validateVariantDraft([])).toHaveLength(1);
  });

  it('names the OTHER row when two SKUs collide, case-insensitively', () => {
    // The bulk create is ONE transaction (A9): a duplicate loses the whole
    // batch and the server's 409 names no row. This is the only place the
    // seller can be told which two rows are the problem.
    const problems = validateVariantDraft([
      row({ key: 'merah', label: 'Merah', sku: 'KAOS-X' }),
      row({ key: 'biru', label: 'Biru', sku: 'kaos-x' }),
    ]);
    expect(problems).toEqual([
      { key: 'biru', field: 'sku', message: 'SKU sama dengan varian "Merah"' },
    ]);
  });

  it('ignores an UNSELECTED row entirely, duplicate SKU and all', () => {
    // A 3x4 grid may ship 10 of its 12 rows; the two left out are not created
    // and must not block the ten that are.
    expect(
      validateVariantDraft([
        row({ key: 'merah', sku: 'KAOS-X' }),
        row({ key: 'biru', sku: 'KAOS-X', selected: false, price: '' }),
      ])
    ).toEqual([]);
  });

  it('refuses a blank or sub-1 price, mirroring the schema ge=1', () => {
    expect(validateVariantDraft([row({ price: '' })])).toEqual([
      { key: 'merah', field: 'price', message: 'Harga wajib diisi' },
    ]);
    expect(validateVariantDraft([row({ price: '0' })])).toEqual([
      { key: 'merah', field: 'price', message: 'Harga minimal 1' },
    ]);
    expect(validateVariantDraft([row({ price: 'abc' })])).toEqual([
      { key: 'merah', field: 'price', message: 'Harga wajib diisi' },
    ]);
  });

  it('refuses a blank SKU, an over-long one, and a negative cost', () => {
    expect(validateVariantDraft([row({ sku: '   ' })])).toEqual([
      { key: 'merah', field: 'sku', message: 'SKU wajib diisi' },
    ]);
    expect(validateVariantDraft([row({ sku: 'A'.repeat(VARIANT_SKU_MAX_LENGTH + 1) })])).toEqual([
      { key: 'merah', field: 'sku', message: `Maksimal ${VARIANT_SKU_MAX_LENGTH} karakter` },
    ]);
    expect(validateVariantDraft([row({ cost: '-1' })])).toEqual([
      { key: 'merah', field: 'cost', message: 'HPP tidak boleh negatif' },
    ]);
    // A blank cost is fine: null means "no cost recorded".
    expect(validateVariantDraft([row({ cost: '' })])).toEqual([]);
  });

  it('refuses a batch past the API bulk cap instead of losing it server-side', () => {
    const rows = Array.from({ length: VARIANT_BULK_MAX + 1 }, (_, i) =>
      row({ key: `k${i}`, label: `L${i}`, sku: `SKU-${i}` })
    );
    const problems = validateVariantDraft(rows);
    expect(problems).toHaveLength(1);
    expect(problems[0].key).toBe('_');
    expect(problems[0].message).toContain(String(VARIANT_BULK_MAX));
  });
});

describe('variantCreatePayload', () => {
  const row = (over: Partial<VariantDraftRow>): VariantDraftRow => ({
    key: 'merah',
    label: 'Merah',
    values: { Warna: 'Merah' },
    sku: ' KAOS-MERAH ',
    price: '100000',
    cost: '',
    selected: true,
    ...over,
  });

  it('sends only the selected rows, with the SKU trimmed', () => {
    expect(
      variantCreatePayload([row({}), row({ key: 'biru', sku: 'KAOS-BIRU', selected: false })])
    ).toEqual([{ sku: 'KAOS-MERAH', price: 100000, variant_values: { Warna: 'Merah' } }]);
  });

  it('OMITS a blank cost rather than sending 0', () => {
    // `null` means "no cost recorded" and 0 means "this costs nothing"; the
    // margin column reads them completely differently (Phase 4).
    expect(variantCreatePayload([row({ cost: '' })])[0]).not.toHaveProperty('cost');
    expect(variantCreatePayload([row({ cost: '60000' })])[0].cost).toBe(60000);
    expect(variantCreatePayload([row({ cost: '0' })])[0].cost).toBe(0);
  });
});

describe('variantValueChips', () => {
  it('renders one chip per axis, in insertion order', () => {
    expect(variantValueChips({ Warna: 'Merah', Ukuran: 'S' })).toEqual([
      { key: 'Warna', label: 'Warna: Merah' },
      { key: 'Ukuran', label: 'Ukuran: S' },
    ]);
  });

  it('renders nothing for a non-variant line instead of an empty chip row', () => {
    expect(variantValueChips({})).toEqual([]);
    expect(variantValueChips(null)).toEqual([]);
    expect(variantValueChips(undefined)).toEqual([]);
    // A blank axis value is not a chip: "Warna: " says nothing.
    expect(variantValueChips({ Warna: '   ', Ukuran: 'S' })).toEqual([
      { key: 'Ukuran', label: 'Ukuran: S' },
    ]);
  });
});
