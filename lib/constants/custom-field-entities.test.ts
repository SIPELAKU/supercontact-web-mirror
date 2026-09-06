import { describe, expect, it } from 'vitest';
import {
  BUILTIN_CONDITION_FIELDS_BY_ENTITY,
  CUSTOM_FIELD_ENTITY_OPTIONS,
  FIELD_KEY_PATTERN,
  FIELD_TYPE_OPTIONS,
  MAX_ACTIVE_DEFINITIONS_PER_ENTITY,
  builtinNamesFor,
  usesOptions,
} from './custom-field-entities';

describe('custom-field entity catalogue', () => {
  it('offers exactly the four API entity types', () => {
    expect(CUSTOM_FIELD_ENTITY_OPTIONS.map((o) => o.value)).toEqual([
      'product',
      'contact',
      'crm_company',
      'quotation',
    ]);
  });

  it('includes multi_select among the field types', () => {
    expect(FIELD_TYPE_OPTIONS.map((o) => o.value)).toEqual([
      'text',
      'number',
      'date',
      'boolean',
      'select',
      'multi_select',
    ]);
    expect(usesOptions('select')).toBe(true);
    expect(usesOptions('multi_select')).toBe(true);
    expect(usesOptions('text')).toBe(false);
  });

  it('mirrors the API\'s built-in condition fields per entity', () => {
    expect(builtinNamesFor('product')).toEqual(['product_type', 'status']);
    expect(builtinNamesFor('quotation')).toEqual(['quotation_status']);
    // Phase 3 added the two commercial reference columns to both customer
    // entities (spec E10/I1). They are RESERVED names a tenant `field_key` may
    // not shadow, so a custom "region_id" is refused instead of quietly
    // shadowing the real column.
    expect(builtinNamesFor('contact')).toEqual(['customer_type_id', 'region_id']);
    expect(builtinNamesFor('crm_company')).toEqual(['customer_type_id', 'region_id']);
    // Their value sets are per-tenant uuids, so there is no closed option list
    // to offer and a clause on them is free text.
    expect(BUILTIN_CONDITION_FIELDS_BY_ENTITY.contact[0].options).toEqual([]);
    expect(BUILTIN_CONDITION_FIELDS_BY_ENTITY.product[0].options).toEqual([
      'goods',
      'service',
      'subscription',
      'bundle',
      'digital',
    ]);
    expect(MAX_ACTIVE_DEFINITIONS_PER_ENTITY).toBe(100);
  });
});

describe('FIELD_KEY_PATTERN', () => {
  it('accepts lower-case slugs', () => {
    expect(FIELD_KEY_PATTERN.test('brand')).toBe(true);
    expect(FIELD_KEY_PATTERN.test('warna_2')).toBe(true);
    expect(FIELD_KEY_PATTERN.test('a')).toBe(true);
    expect(FIELD_KEY_PATTERN.test('a'.repeat(60))).toBe(true);
  });

  it('rejects what the ticket table used to accept', () => {
    expect(FIELD_KEY_PATTERN.test('Nama Ibu Kandung')).toBe(false);
    expect(FIELD_KEY_PATTERN.test('2x')).toBe(false);
    expect(FIELD_KEY_PATTERN.test('A')).toBe(false);
    expect(FIELD_KEY_PATTERN.test('')).toBe(false);
    expect(FIELD_KEY_PATTERN.test('a'.repeat(61))).toBe(false);
    expect(FIELD_KEY_PATTERN.test('brand-name')).toBe(false);
  });
});
