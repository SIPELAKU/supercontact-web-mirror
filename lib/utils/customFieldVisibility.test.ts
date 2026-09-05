import { describe, expect, it } from 'vitest';
import { isFieldVisible as ticketIsFieldVisible } from './ticketFieldVisibility';
import {
  buildEntityVisibilityValues,
  clausesFromCondition,
  isFieldVisible,
  serializeVisibilityClauses,
} from './customFieldVisibility';

describe('buildEntityVisibilityValues', () => {
  it('layers only the entity\'s own built-ins over the custom values', () => {
    const values = buildEntityVisibilityValues('product', { product_type: 'goods' }, { brand: 'X' });
    expect(values).toEqual({ brand: 'X', product_type: 'goods', status: '' });
    expect(values).not.toHaveProperty('priority');
    expect(values).not.toHaveProperty('type');
  });

  it('layers a contact\'s two Phase 3 built-ins and nothing from another entity', () => {
    // `customer_type_id` / `region_id` are the only contact built-ins; a
    // ticket's `type` must never leak in.
    expect(
      buildEntityVisibilityValues('contact', { type: 'Incident', customer_type_id: 'ct-1' }, { gender: 'L' })
    ).toEqual({ gender: 'L', customer_type_id: 'ct-1', region_id: '' });
  });

  it('lets a built-in name win over a colliding custom key', () => {
    const values = buildEntityVisibilityValues('quotation', { quotation_status: 'sent' }, {
      quotation_status: 'draft',
    });
    expect(values.quotation_status).toBe('sent');
  });

  it('collapses a missing built-in to "" rather than "undefined"', () => {
    expect(buildEntityVisibilityValues('product', undefined, null)).toEqual({ product_type: '', status: '' });
  });
});

describe('isFieldVisible (re-exported ticket evaluator)', () => {
  const values = buildEntityVisibilityValues('product', { product_type: 'goods' }, { brand: 'X' });

  it('is the ticket module\'s evaluator, not a copy', () => {
    expect(isFieldVisible).toBe(ticketIsFieldVisible);
  });

  it('evaluates eq / neq / in against a product built-in', () => {
    expect(isFieldVisible({ all: [{ field: 'product_type', op: 'eq', value: 'goods' }] }, values)).toBe(true);
    expect(isFieldVisible({ all: [{ field: 'product_type', op: 'neq', value: 'goods' }] }, values)).toBe(false);
    expect(
      isFieldVisible({ all: [{ field: 'product_type', op: 'in', value: ['goods', 'service'] }] }, values)
    ).toBe(true);
    expect(isFieldVisible({ all: [{ field: 'product_type', op: 'in', value: ['digital'] }] }, values)).toBe(false);
  });

  it('ANDs clauses and treats null as always visible', () => {
    expect(
      isFieldVisible(
        {
          all: [
            { field: 'product_type', op: 'eq', value: 'goods' },
            { field: 'brand', op: 'eq', value: 'Y' },
          ],
        },
        values
      )
    ).toBe(false);
    expect(isFieldVisible(null, values)).toBe(true);
    expect(isFieldVisible({ all: [] }, values)).toBe(true);
  });
});

describe('serializeVisibilityClauses', () => {
  it('drops incomplete clauses and trims values', () => {
    expect(
      serializeVisibilityClauses([
        { field: 'product_type', op: 'eq', value: ' goods ' },
        { field: '', op: 'eq', value: 'x' },
        { field: 'status', op: 'eq', value: '' },
      ])
    ).toEqual({ all: [{ field: 'product_type', op: 'eq', value: 'goods' }] });
  });

  it('turns an "in" clause into a de-blanked list and returns null when nothing is complete', () => {
    expect(serializeVisibilityClauses([{ field: 'status', op: 'in', value: ['active', ' ', ''] }])).toEqual({
      all: [{ field: 'status', op: 'in', value: ['active'] }],
    });
    expect(serializeVisibilityClauses([{ field: 'status', op: 'in', value: [] }])).toBeNull();
    expect(serializeVisibilityClauses([])).toBeNull();
  });

  it('collapses a list on an eq clause to its first value', () => {
    expect(serializeVisibilityClauses([{ field: 'status', op: 'eq', value: ['active', 'archived'] }])).toEqual({
      all: [{ field: 'status', op: 'eq', value: 'active' }],
    });
  });
});

describe('clausesFromCondition', () => {
  it('copies arrays so editing never mutates the stored definition', () => {
    const stored = { all: [{ field: 'status', op: 'in' as const, value: ['active'] }] };
    const clauses = clausesFromCondition(stored);
    (clauses[0].value as string[]).push('archived');
    expect(stored.all[0].value).toEqual(['active']);
    expect(clausesFromCondition(null)).toEqual([]);
  });
});
