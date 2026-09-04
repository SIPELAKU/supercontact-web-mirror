import { describe, expect, it } from 'vitest';
import type { CustomFieldDefinitionLike } from '@/lib/types/CustomFieldDefinition';
import {
  customFieldErrorsByKey,
  formatCustomFieldValue,
  isBlankCustomValue,
  validateCustomFieldValues,
} from './customFieldValues';

const def = (over: Partial<CustomFieldDefinitionLike> & Pick<CustomFieldDefinitionLike, 'field_key' | 'field_type'>) =>
  ({
    label: over.field_key,
    select_options: null,
    is_required: false,
    visibility_condition: null,
    is_active: true,
    ...over,
  }) as CustomFieldDefinitionLike;

const BRAND = def({ field_key: 'brand', label: 'Brand', field_type: 'select', select_options: ['Acme', 'Beta'], is_required: true });
const WEIGHT = def({ field_key: 'weight', label: 'Berat', field_type: 'number' });
const NOTE = def({ field_key: 'note', label: 'Catatan', field_type: 'text' });
const FRAGILE = def({ field_key: 'fragile', label: 'Mudah pecah', field_type: 'boolean' });
const EXPIRY = def({ field_key: 'expiry', label: 'Kedaluwarsa', field_type: 'date' });
const TAGS = def({ field_key: 'tags', label: 'Tag', field_type: 'multi_select', select_options: ['a', 'b', 'c'] });

const strict = (defs: CustomFieldDefinitionLike[], values: Record<string, unknown>, builtIns?: Record<string, unknown>) =>
  validateCustomFieldValues(defs, values, { entityType: 'product', mode: 'strict', builtIns });

const messages = (defs: CustomFieldDefinitionLike[], values: Record<string, unknown>) =>
  strict(defs, values).errors.map((e) => `${e.field}: ${e.message}`);

describe('validateCustomFieldValues - strict mode', () => {
  it('refuses unknown keys with one combined error under custom_fields', () => {
    expect(messages([NOTE], { note: 'x', foo: 1, bar: 2 })).toEqual(['custom_fields: Unknown custom field(s): foo, bar']);
  });

  it('enforces required on null, "" and []', () => {
    expect(messages([BRAND], {})).toEqual(["brand: Custom field 'Brand' is required"]);
    expect(messages([BRAND], { brand: '' })).toEqual(["brand: Custom field 'Brand' is required"]);
    expect(messages([BRAND], { brand: null })).toEqual(["brand: Custom field 'Brand' is required"]);
    expect(messages([def({ ...TAGS, is_required: true })], { tags: [] })).toEqual([
      "tags: Custom field 'Tag' is required",
    ]);
  });

  it('skips required when enforceRequired is false', () => {
    const result = validateCustomFieldValues([BRAND], {}, { entityType: 'product', enforceRequired: false });
    expect(result.errors).toEqual([]);
  });

  it('skips a field hidden by its condition, keeping the value as sent', () => {
    const hidden = def({
      ...BRAND,
      visibility_condition: { all: [{ field: 'product_type', op: 'eq', value: 'service' }] },
    });
    const result = strict([hidden], { brand: 'Not an option' }, { product_type: 'goods' });
    expect(result.errors).toEqual([]);
    expect(result.values.brand).toBe('Not an option');
  });

  it('validates a field whose condition matches the built-in', () => {
    const shown = def({
      ...BRAND,
      visibility_condition: { all: [{ field: 'product_type', op: 'eq', value: 'goods' }] },
    });
    expect(strict([shown], { brand: 'Nope' }, { product_type: 'goods' }).errors[0].field).toBe('brand');
  });

  it('resolves quotation_status for quotation fields', () => {
    const po = def({
      field_key: 'po_number',
      label: 'PO',
      field_type: 'text',
      is_required: true,
      visibility_condition: { all: [{ field: 'quotation_status', op: 'in', value: ['sent', 'accepted'] }] },
    });
    expect(
      validateCustomFieldValues([po], {}, { entityType: 'quotation', builtIns: { quotation_status: 'draft' } }).errors
    ).toEqual([]);
    expect(
      validateCustomFieldValues([po], {}, { entityType: 'quotation', builtIns: { quotation_status: 'sent' } }).errors
    ).toHaveLength(1);
  });

  it('ignores inactive definitions entirely', () => {
    const inactive = def({ ...BRAND, is_active: false });
    expect(messages([inactive], { brand: 'zzz' })).toEqual(['custom_fields: Unknown custom field(s): brand']);
  });

  it('keeps a stored key whose definition was deactivated instead of calling it unknown', () => {
    // The edit form is seeded from the row, so a value left behind by a
    // deactivated definition is always present and has no control to clear
    // it; with storedValues it passes through, as on the server.
    const result = validateCustomFieldValues([NOTE], { brand: 'Acme', note: 'x' }, {
      entityType: 'product',
      mode: 'strict',
      storedValues: { brand: 'Acme' },
    });
    expect(result.errors).toEqual([]);
    expect(result.values).toEqual({ brand: 'Acme', note: 'x' });
    // A key that is neither defined nor stored is still unknown.
    expect(
      validateCustomFieldValues([NOTE], { brand: 'Acme', color: 'red' }, {
        entityType: 'product',
        mode: 'strict',
        storedValues: { brand: 'Acme' },
      }).errors
    ).toEqual([{ field: 'custom_fields', message: 'Unknown custom field(s): color' }]);
    // A DEFINED key is still re-judged in strict mode, stored or not.
    expect(
      validateCustomFieldValues([BRAND], { brand: 'Gamma' }, {
        entityType: 'product',
        mode: 'strict',
        storedValues: { brand: 'Gamma' },
      }).errors[0].field
    ).toBe('brand');
  });

  it('never type-checks null', () => {
    expect(messages([WEIGHT], { weight: null })).toEqual([]);
  });

  it('text must be a string', () => {
    expect(messages([NOTE], { note: 12 })).toEqual(["note: 'Catatan' must be text"]);
    expect(messages([NOTE], { note: 'ok' })).toEqual([]);
  });

  it('number accepts int, float and numeric strings and normalises to a number', () => {
    expect(strict([WEIGHT], { weight: 12 }).values.weight).toBe(12);
    expect(strict([WEIGHT], { weight: 1.5 }).values.weight).toBe(1.5);
    expect(strict([WEIGHT], { weight: '12.5' }).values.weight).toBe(12.5);
    expect(messages([WEIGHT], { weight: '12.5' })).toEqual([]);
  });

  it('number rejects booleans and non-numeric strings', () => {
    expect(messages([WEIGHT], { weight: true })).toEqual(["weight: 'Berat' must be a number"]);
    expect(messages([WEIGHT], { weight: 'abc' })).toEqual(["weight: 'Berat' must be a number"]);
    expect(messages([WEIGHT], { weight: '12,5' })).toEqual(["weight: 'Berat' must be a number"]);
  });

  it('boolean must be a real boolean', () => {
    expect(messages([FRAGILE], { fragile: true })).toEqual([]);
    expect(messages([FRAGILE], { fragile: 'true' })).toEqual(["fragile: 'Mudah pecah' must be a boolean"]);
    expect(messages([FRAGILE], { fragile: 1 })).toEqual(["fragile: 'Mudah pecah' must be a boolean"]);
  });

  it('date must be YYYY-MM-DD', () => {
    expect(messages([EXPIRY], { expiry: '2026-09-04' })).toEqual([]);
    expect(messages([EXPIRY], { expiry: '04/09/2026' })).toEqual(["expiry: 'Kedaluwarsa' must be a date (YYYY-MM-DD)"]);
    expect(messages([EXPIRY], { expiry: '2026-02-30' })).toEqual(["expiry: 'Kedaluwarsa' must be a date (YYYY-MM-DD)"]);
    expect(messages([EXPIRY], { expiry: 20260904 })).toEqual(["expiry: 'Kedaluwarsa' must be a date (YYYY-MM-DD)"]);
  });

  it('select must be one of the options', () => {
    expect(messages([BRAND], { brand: 'Acme' })).toEqual([]);
    expect(messages([BRAND], { brand: 'Gamma' })).toEqual(["brand: Invalid value for 'Brand' - must be one of [Acme, Beta]"]);
    expect(messages([BRAND], { brand: ['Acme'] })).toEqual(["brand: Invalid value for 'Brand' - must be one of [Acme, Beta]"]);
  });

  it('multi_select must be a list of unique options', () => {
    expect(messages([TAGS], { tags: ['a', 'b'] })).toEqual([]);
    expect(messages([TAGS], { tags: [] })).toEqual([]);
    expect(messages([TAGS], { tags: ['a', 'a'] })).toEqual(["tags: Invalid value for 'Tag' - must be one of [a, b, c]"]);
    expect(messages([TAGS], { tags: ['a', 'z'] })).toEqual(["tags: Invalid value for 'Tag' - must be one of [a, b, c]"]);
    expect(messages([TAGS], { tags: 'a' })).toEqual(["tags: 'Tag' must be a list of options"]);
    expect(messages([TAGS], { tags: [1] })).toEqual(["tags: 'Tag' must be a list of options"]);
  });

  it('reports every error, not just the first', () => {
    const result = strict([BRAND, WEIGHT, NOTE], { brand: 'x', weight: 'abc', note: 5 });
    expect(result.errors.map((e) => e.field)).toEqual(['brand', 'weight', 'note']);
    expect(customFieldErrorsByKey(result.errors)).toEqual({
      brand: "Invalid value for 'Brand' - must be one of [Acme, Beta]",
      weight: "'Berat' must be a number",
      note: "'Catatan' must be text",
    });
  });
});

describe('validateCustomFieldValues - permissive mode (contacts)', () => {
  const GENDER = def({ field_key: 'gender', label: 'Gender', field_type: 'select', select_options: ['Pria', 'Wanita'], is_required: true });
  const permissive = (values: Record<string, unknown>, stored?: Record<string, unknown>) =>
    validateCustomFieldValues([GENDER, WEIGHT], values, {
      entityType: 'contact',
      mode: 'permissive',
      enforceRequired: false,
      storedValues: stored,
    });

  it('lets unknown keys pass through untouched', () => {
    const result = permissive({ nama_toko: 'Toko A', Division: 'X', nested: { a: 1 } });
    expect(result.errors).toEqual([]);
    expect(result.values).toEqual({ nama_toko: 'Toko A', Division: 'X', nested: { a: 1 } });
  });

  it('skips a defined key whose value is unchanged, even when it is invalid', () => {
    expect(permissive({ gender: 'L' }, { gender: 'L' }).errors).toEqual([]);
  });

  it('type-checks a defined key whose value changed', () => {
    expect(permissive({ gender: 'Pria' }, { gender: 'L' }).errors).toEqual([]);
    expect(permissive({ gender: 'X' }, { gender: 'L' }).errors).toEqual([
      { field: 'gender', message: "Invalid value for 'Gender' - must be one of [Pria, Wanita]" },
    ]);
  });

  it('does not enforce required', () => {
    expect(permissive({ weight: '3' }).errors).toEqual([]);
    expect(permissive({}).errors).toEqual([]);
  });

  it('compares list values structurally when deciding "unchanged"', () => {
    const result = validateCustomFieldValues([TAGS], { tags: ['zzz'] }, {
      entityType: 'contact',
      mode: 'permissive',
      storedValues: { tags: ['zzz'] },
    });
    expect(result.errors).toEqual([]);
  });
});

describe('isBlankCustomValue', () => {
  it('treats null, undefined, whitespace and [] as blank, everything else as set', () => {
    expect(isBlankCustomValue(null)).toBe(true);
    expect(isBlankCustomValue(undefined)).toBe(true);
    expect(isBlankCustomValue('  ')).toBe(true);
    expect(isBlankCustomValue([])).toBe(true);
    expect(isBlankCustomValue(0)).toBe(false);
    expect(isBlankCustomValue(false)).toBe(false);
    expect(isBlankCustomValue('a')).toBe(false);
  });
});

describe('formatCustomFieldValue', () => {
  it('formats each type the way a read-only surface prints it', () => {
    expect(formatCustomFieldValue(true)).toBe('Ya');
    expect(formatCustomFieldValue(false)).toBe('Tidak');
    expect(formatCustomFieldValue(1234.5)).toBe('1.234,5');
    expect(formatCustomFieldValue(['a', 'b'])).toBe('a, b');
    expect(formatCustomFieldValue('Acme')).toBe('Acme');
    expect(formatCustomFieldValue(null)).toBe('-');
    expect(formatCustomFieldValue('')).toBe('-');
    expect(formatCustomFieldValue([])).toBe('-');
  });

  it('renders legacy object values as JSON instead of crashing', () => {
    expect(formatCustomFieldValue({ city: 'Jakarta' })).toBe('{"city":"Jakarta"}');
  });

  it('uses the definition type to read a stringly-typed legacy value', () => {
    expect(formatCustomFieldValue('12.5', 'number')).toBe('12,5');
    expect(formatCustomFieldValue('true', 'boolean')).toBe('Ya');
    expect(formatCustomFieldValue('abc', 'number')).toBe('abc');
  });
});
