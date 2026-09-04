import { describe, it, expect } from 'vitest';
import {
  DISCOUNT_POLICY_VIOLATION,
  mapQuotationError,
  mapQuotationException,
} from './quotation-errors';

/**
 * The form used to read `validationErrors.items[i]` by array position. The
 * API reports errors by the row's `index`, and only for the rows that are
 * wrong - so a bad third row landed under the first row's discount input.
 * These pin the index-based mapping.
 */
describe('mapQuotationError', () => {
  it('places each item error under its own row index, not its array position', () => {
    const result = mapQuotationError(
      {
        items: [
          { index: 2, errors: [{ field: 'quantity', message: 'Input should be greater than 0' }] },
          { index: 0, errors: [{ field: 'discount', message: 'Too much' }] },
        ],
      },
      'Some items are invalid',
      'VALIDATION_ERROR'
    );
    expect(result.byRow).toEqual({
      2: 'quantity: Input should be greater than 0',
      0: 'discount: Too much',
    });
    expect(result.fieldsByRow[2].quantity).toBe('Input should be greater than 0');
    expect(result.fieldsByRow[0].discount).toBe('Too much');
    expect(result.byRow[1]).toBeUndefined();
    expect(result.header).toBeUndefined();
    expect(result.message).toBe('Some items are invalid');
    expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('falls back to the array position when an entry carries no index', () => {
    const result = mapQuotationError({
      items: [{ errors: [{ field: 'discount', message: 'a' }] }, { errors: [{ field: 'discount', message: 'b' }] }],
    });
    expect(result.byRow).toEqual({ 0: 'discount: a', 1: 'discount: b' });
  });

  it('keeps the unknown-key `price` entry readable under the right row', () => {
    const result = mapQuotationError(
      {
        items: [{ index: 1, errors: [{ field: 'price', message: 'Extra inputs are not permitted' }] }],
      },
      'Some items are invalid'
    );
    expect(result.byRow).toEqual({ 1: 'price: Extra inputs are not permitted' });
    expect(result.fieldsByRow[1]).toEqual({ price: 'Extra inputs are not permitted' });
  });

  it('handles the malformed-JSON entry shape (field is null)', () => {
    const result = mapQuotationError(
      {
        items: [{ index: 3, input: '{oops', errors: [{ field: null, message: 'Malformed JSON string' }] }],
      },
      'Some items are invalid'
    );
    expect(result.byRow).toEqual({ 3: 'Malformed JSON string' });
    expect(result.fieldsByRow[3]).toEqual({ _: 'Malformed JSON string' });
  });

  it('surfaces a policy refusal on the offending rows with the policy sentence', () => {
    const sentence = 'Diskon 30% melebihi batas kebijakan diskon perusahaan (maks 25%)';
    const result = mapQuotationError(
      {
        policy: { id: null, applies_to: 'company', max_discount_percent: '25.00' },
        items: [
          {
            index: 1,
            product_id: 'p-2',
            effective_discount_percent: '30.00',
            errors: [{ field: 'discount', message: sentence }],
          },
        ],
      },
      sentence,
      DISCOUNT_POLICY_VIOLATION
    );
    expect(result.code).toBe(DISCOUNT_POLICY_VIOLATION);
    expect(result.message).toBe(sentence);
    expect(result.byRow).toEqual({ 1: `discount: ${sentence}` });
    expect(result.fieldsByRow[1].discount).toBe(sentence);
    expect(result.header).toBeUndefined();
  });

  it('puts the message under the header discount when details.header is present', () => {
    const sentence = 'Diskon 30% melebihi batas kebijakan diskon perusahaan (maks 25%)';
    const result = mapQuotationError(
      {
        policy: { id: 'pol-1', applies_to: 'company', max_discount_percent: '25.00' },
        header: { discount_type: 'percent', discount_value: '30.00', effective_percent: '30.00' },
        items: [],
      },
      sentence,
      DISCOUNT_POLICY_VIOLATION
    );
    expect(result.header).toBe(sentence);
    expect(result.byRow).toEqual({});
  });

  it('joins several errors on one row and marks an error-less entry with the message', () => {
    const result = mapQuotationError(
      {
        items: [
          {
            index: 0,
            errors: [
              { field: 'quantity', message: 'q bad' },
              { field: 'discount', message: 'd bad' },
            ],
          },
          { index: 4 },
        ],
      },
      'Some items are invalid'
    );
    expect(result.byRow[0]).toBe('quantity: q bad; discount: d bad');
    expect(result.byRow[4]).toBe('Some items are invalid');
  });

  it('degrades to a bare message when there are no details at all', () => {
    expect(mapQuotationError(undefined, 'Only draft quotations can be updated')).toEqual({
      byRow: {},
      fieldsByRow: {},
      message: 'Only draft quotations can be updated',
    });
    expect(mapQuotationError(null, '').message).toBe('Quotation tidak dapat diproses');
    expect(mapQuotationError('garbage', undefined).byRow).toEqual({});
  });
});

describe('mapQuotationException', () => {
  it('reads details, message and code straight off the thrown error', () => {
    const err = Object.assign(new Error('Some items are invalid'), {
      code: 'VALIDATION_ERROR',
      details: { items: [{ index: 0, errors: [{ field: 'price', message: 'Extra inputs are not permitted' }] }] },
    });
    const result = mapQuotationException(err);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.byRow[0]).toBe('price: Extra inputs are not permitted');
  });

  it('survives a non-Error throw', () => {
    expect(mapQuotationException(undefined).message).toBe('Quotation tidak dapat diproses');
    expect(mapQuotationException('boom').byRow).toEqual({});
  });
});
