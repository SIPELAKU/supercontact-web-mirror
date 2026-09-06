import { describe, it, expect } from 'vitest';
import {
  APPROVAL_ALREADY_DECIDED,
  DISCOUNT_POLICY_VIOLATION,
  NO_ELIGIBLE_APPROVER,
  POLICY_COMPANY_ROW_EXISTS,
  QUOTATION_ALREADY_REVISED,
  QUOTATION_APPROVAL_REQUIRED,
  QUOTATION_DELIVERY_FAILED,
  QUOTATION_LOCKED,
  WHATSAPP_TEMPLATE_NOT_APPROVED,
  mapQuotationError,
  mapQuotationException,
  quotationErrorPlacement,
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
      fieldsHeader: {},
      message: 'Only draft quotations can be updated',
      // Phase 4: every mapped error now carries where it belongs on screen,
      // and the raw details so a screen can read a code-specific key.
      placement: 'toast',
      details: {},
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

/**
 * Phase 1: header-level custom fields are refused with `details.errors[]`
 * ({ field, message }), the `_as_validation_error` shape - a different key
 * from the per-row `details.items[]`. These pin the `fieldsHeader` mapping.
 */
describe('mapQuotationError - header custom fields (details.errors[])', () => {
  it('maps each entry under its field_key', () => {
    const result = mapQuotationError(
      {
        entity_type: 'quotation',
        errors: [
          { field: 'po_number', message: "Custom field 'PO Number' is required" },
          { field: 'priority', message: "Invalid value for 'Priority' - must be one of [low, high]" },
        ],
      },
      "Custom field 'PO Number' is required",
      'VALIDATION_ERROR'
    );
    expect(result.fieldsHeader).toEqual({
      po_number: "Custom field 'PO Number' is required",
      priority: "Invalid value for 'Priority' - must be one of [low, high]",
    });
    expect(result.byRow).toEqual({});
    expect(result.header).toBeUndefined();
    expect(result.message).toBe("Custom field 'PO Number' is required");
  });

  it('puts the unknown-keys error under custom_fields and field-less entries under "_"', () => {
    const result = mapQuotationError({
      errors: [
        { field: 'custom_fields', message: 'Unknown custom field(s): foo' },
        { message: 'custom_fields must be a JSON object' },
        { field: '  ', message: 'blank field' },
      ],
    });
    expect(result.fieldsHeader.custom_fields).toBe('Unknown custom field(s): foo');
    expect(result.fieldsHeader._).toBe('custom_fields must be a JSON object; blank field');
  });

  it('joins several messages on one field', () => {
    const result = mapQuotationError({
      errors: [
        { field: 'po_number', message: 'a' },
        { field: 'po_number', message: 'b' },
      ],
    });
    expect(result.fieldsHeader.po_number).toBe('a; b');
  });

  it('is empty when there are no header errors and leaves row mapping untouched', () => {
    const result = mapQuotationError({
      items: [{ index: 0, errors: [{ field: 'quantity', message: 'q' }] }],
    });
    expect(result.fieldsHeader).toEqual({});
    expect(result.fieldsByRow[0].quantity).toBe('q');
    expect(mapQuotationError(undefined).fieldsHeader).toEqual({});
    expect(mapQuotationError({ errors: 'garbage' }).fieldsHeader).toEqual({});
  });

  it('keeps `header` semantics: only details.header sets it', () => {
    const result = mapQuotationError(
      { errors: [{ field: 'discount_value', message: 'too much' }] },
      'too much',
      'VALIDATION_ERROR'
    );
    expect(result.header).toBeUndefined();
    expect(result.fieldsHeader.discount_value).toBe('too much');
  });
});

/**
 * Phase 2: a manual override is refused per ROW, in the same indexed
 * `details.items[]` shape, under the field the seller actually used -
 * `unit_price` for the price control and `override_reason` for its reason.
 * Both names are in `ProductsServicesTable`'s FIELD_SLOTS, so the message lands
 * beside the control instead of in the unlabelled red paragraph at the bottom
 * of the row. No mapper change was needed; these pin that.
 */
describe('mapQuotationError - manual override refusals (Phase 2)', () => {
  it('routes an override that the winning price list forbids under unit_price', () => {
    const sentence = 'Daftar harga yang berlaku pada baris ini tidak mengizinkan harga manual';
    const result = mapQuotationError(
      {
        items: [
          { index: 1, product_id: 'p-2', errors: [{ field: 'unit_price', message: sentence }] },
        ],
      },
      'Some items are invalid',
      'VALIDATION_ERROR'
    );
    expect(result.fieldsByRow[1].unit_price).toBe(sentence);
    expect(result.fieldsByRow[1].override_reason).toBeUndefined();
    expect(result.byRow[1]).toBe(`unit_price: ${sentence}`);
  });

  it('distinguishes the "tenant has no price list at all" refusal, still under unit_price', () => {
    const sentence =
      'Harga manual belum tersedia: tenant ini belum punya daftar harga yang mengizinkannya';
    const result = mapQuotationError(
      { items: [{ index: 0, errors: [{ field: 'unit_price', message: sentence }] }] },
      'Some items are invalid'
    );
    expect(result.fieldsByRow[0].unit_price).toBe(sentence);
  });

  it('routes a missing reason under override_reason', () => {
    const result = mapQuotationError(
      {
        items: [
          {
            index: 2,
            errors: [{ field: 'override_reason', message: 'Alasan override wajib diisi' }],
          },
        ],
      },
      'Some items are invalid'
    );
    expect(result.fieldsByRow[2].override_reason).toBe('Alasan override wajib diisi');
    expect(result.fieldsByRow[2].unit_price).toBeUndefined();
  });

  it('keeps both override fields separate when one row breaks both rules', () => {
    const result = mapQuotationError({
      items: [
        {
          index: 0,
          errors: [
            { field: 'unit_price', message: 'harga tidak diizinkan' },
            { field: 'override_reason', message: 'Alasan override wajib diisi' },
          ],
        },
      ],
    });
    expect(result.fieldsByRow[0]).toEqual({
      unit_price: 'harga tidak diizinkan',
      override_reason: 'Alasan override wajib diisi',
    });
  });

  it('lands a policy refusal measured against the resolved price under unit_price, not discount', () => {
    // An override IS a seller discount for the policy: the server relabels the
    // violation so the refusal appears under the control that caused it.
    const sentence = 'Diskon 40% melebihi batas kebijakan diskon perusahaan (maks 25%)';
    const result = mapQuotationError(
      {
        policy: { id: 'pol-1', applies_to: 'company', max_discount_percent: '25.00' },
        items: [
          {
            index: 0,
            product_id: 'p-1',
            effective_discount_percent: '40.00',
            errors: [{ field: 'unit_price', message: sentence }],
          },
        ],
      },
      sentence,
      DISCOUNT_POLICY_VIOLATION
    );
    expect(result.code).toBe(DISCOUNT_POLICY_VIOLATION);
    expect(result.fieldsByRow[0].unit_price).toBe(sentence);
    expect(result.fieldsByRow[0].discount).toBeUndefined();
    expect(result.header).toBeUndefined();
  });
});

// ── Phase 4: every new code lands on a control, not only in a toast ────────
//
// The failure this pins is a specific one: a governance refusal that arrives
// as a toast and nothing else leaves the seller staring at a form with no
// indication of WHAT to change or WHO to ask. Each code below has an owner.

describe('quotationErrorPlacement', () => {
  it('routes the approval codes to the header, where the whole quotation is', () => {
    // Both are statements about the quotation and about the tenant's setup -
    // NO_ELIGIBLE_APPROVER in particular is about the workspace having nobody
    // else with the grant, which no single line can express.
    expect(quotationErrorPlacement(QUOTATION_APPROVAL_REQUIRED)).toBe('header');
    expect(quotationErrorPlacement(NO_ELIGIBLE_APPROVER)).toBe('header');
    expect(quotationErrorPlacement(POLICY_COMPANY_ROW_EXISTS)).toBe('header');
  });

  it('routes "the row moved under you" codes to the status area', () => {
    expect(quotationErrorPlacement(APPROVAL_ALREADY_DECIDED)).toBe('status');
    expect(quotationErrorPlacement(QUOTATION_LOCKED)).toBe('status');
    expect(quotationErrorPlacement(QUOTATION_ALREADY_REVISED)).toBe('status');
  });

  it('routes the delivery codes into the send dialog', () => {
    expect(quotationErrorPlacement(WHATSAPP_TEMPLATE_NOT_APPROVED)).toBe('delivery');
    expect(quotationErrorPlacement(QUOTATION_DELIVERY_FAILED)).toBe('delivery');
  });

  it('keeps the discount bands per row, where the offending line is', () => {
    expect(quotationErrorPlacement(DISCOUNT_POLICY_VIOLATION)).toBe('rows');
  });

  it('falls back to a toast for anything it does not know', () => {
    expect(quotationErrorPlacement('SOMETHING_NEW')).toBe('toast');
    expect(quotationErrorPlacement(null)).toBe('toast');
    expect(quotationErrorPlacement(undefined)).toBe('toast');
  });
});

describe('mapQuotationError carries the placement and the raw details', () => {
  it('marks a locked-row refusal as a status message and keeps the status', () => {
    const result = mapQuotationError(
      { quotation_status: 'pending_approval' },
      'Quotation sedang menunggu persetujuan',
      QUOTATION_LOCKED
    );
    expect(result.placement).toBe('status');
    expect(result.code).toBe(QUOTATION_LOCKED);
    expect(result.details?.quotation_status).toBe('pending_approval');
    expect(result.byRow).toEqual({});
  });

  it('keeps the child revision so the UI can point at it instead of retrying', () => {
    // A5: the server refuses a second revision and NAMES the one that exists.
    const result = mapQuotationError(
      { revision_id: 'abc-123', revision_number: 'QUO-2026-0007-R2' },
      'Quotation ini sudah punya revisi',
      QUOTATION_ALREADY_REVISED
    );
    expect(result.placement).toBe('status');
    expect(result.details?.revision_id).toBe('abc-123');
    expect(result.details?.revision_number).toBe('QUO-2026-0007-R2');
  });

  it('maps the MARGIN band per row, exactly like the percent band', () => {
    // The margin band is not a new code: DISCOUNT_POLICY_VIOLATION widened
    // (spec E1), so the per-row placement the form already honours keeps
    // working with no caller change.
    const result = mapQuotationError(
      {
        policy: { id: 'p1', applies_to: 'role', min_margin_percent: '20.00' },
        items: [
          {
            index: 2,
            product_id: 'prod-9',
            margin_percent: '4.50',
            errors: [{ field: 'discount', message: 'Margin 4,5% di bawah batas 20%' }],
          },
        ],
      },
      'Margin di bawah batas kebijakan',
      DISCOUNT_POLICY_VIOLATION
    );
    expect(result.placement).toBe('rows');
    expect(result.byRow[2]).toBe('discount: Margin 4,5% di bawah batas 20%');
    expect(result.fieldsByRow[2]).toEqual({ discount: 'Margin 4,5% di bawah batas 20%' });
    expect(result.details?.items?.[0]?.margin_percent).toBe('4.50');
  });

  it('lets real per-row entries beat an unknown code rather than hiding them', () => {
    const result = mapQuotationError(
      { items: [{ index: 0, errors: [{ field: 'quantity', message: 'harus > 0' }] }] },
      'Some items are invalid',
      'A_CODE_THIS_BUILD_DOES_NOT_KNOW'
    );
    expect(result.placement).toBe('rows');
    expect(result.byRow[0]).toBe('quantity: harus > 0');
  });

  it('reads the code straight off a thrown error', () => {
    const err = Object.assign(new Error('Tidak ada penyetuju lain di workspace ini'), {
      code: NO_ELIGIBLE_APPROVER,
      details: {},
    });
    const mapped = mapQuotationException(err);
    expect(mapped.code).toBe(NO_ELIGIBLE_APPROVER);
    expect(mapped.placement).toBe('header');
    expect(mapped.message).toBe('Tidak ada penyetuju lain di workspace ini');
  });
});
