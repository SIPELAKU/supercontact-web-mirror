import { describe, expect, it } from 'vitest';
import {
  clausesFromCriteria,
  criteriaSignature,
  customFieldKeyOf,
  describeCriteria,
  isCustomFieldClause,
  isNumericClause,
  isOperatorAllowed,
  operatorsForField,
  serializeSegmentClauses,
  type SegmentClauseDraft,
} from './segmentCriteria';
import { SEGMENT_FIELD_LABELS } from '@/lib/constants/commercial-context';

// `customer_type`, `region` and `sales_channel` clause values are ROW IDS, not
// codes: SegmentFacts carries raw UUIDs for all three and the API evaluator
// normalises a UUID to its canonical lower-case string, so a code could never
// match a fact (`tests/test_segment_criteria.py` pins the same shape).
const KORPORAT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const JABAR_ID = '9c1a4f2e-7b83-4d51-9f0a-2e6c8b1d4a70';
const JAKARTA_ID = 'b21d6e08-3f47-4a92-8c15-7d0e9a3f6b24';

describe('operatorsForField', () => {
  it('mirrors the API table for the seven base fields', () => {
    expect(operatorsForField('customer_type')).toEqual(['eq', 'in']);
    expect(operatorsForField('tags')).toEqual(['eq', 'in', 'contains']);
    expect(operatorsForField('region')).toEqual(['eq', 'in']);
    expect(operatorsForField('sales_channel')).toEqual(['eq', 'in']);
    expect(operatorsForField('lead_status')).toEqual(['eq', 'in']);
    expect(operatorsForField('accepted_quotations_count_365d')).toEqual(['eq', 'gte', 'lte']);
    expect(operatorsForField('accepted_quotations_amount_365d')).toEqual(['eq', 'gte', 'lte']);
  });

  it('gives every operator to a custom field with a key, and none to a bare prefix', () => {
    expect(operatorsForField('custom_fields.warna')).toEqual(['eq', 'in', 'gte', 'lte', 'contains']);
    expect(operatorsForField('custom_fields.')).toEqual([]);
  });

  it('gives an UNKNOWN field no operators at all, never the full set', () => {
    expect(operatorsForField('lifetime_value')).toEqual([]);
    expect(operatorsForField('')).toEqual([]);
    expect(isOperatorAllowed('lifetime_value', 'eq')).toBe(false);
  });

  it('refuses an operator the field does not allow', () => {
    expect(isOperatorAllowed('customer_type', 'contains')).toBe(false);
    expect(isOperatorAllowed('tags', 'gte')).toBe(false);
    expect(isOperatorAllowed('accepted_quotations_count_365d', 'in')).toBe(false);
    expect(isOperatorAllowed('accepted_quotations_count_365d', 'gte')).toBe(true);
  });
});

describe('custom field helpers', () => {
  it('splits a custom-field clause from a base field', () => {
    expect(isCustomFieldClause('custom_fields.warna')).toBe(true);
    expect(isCustomFieldClause('tags')).toBe(false);
    expect(customFieldKeyOf('custom_fields.warna')).toBe('warna');
    expect(customFieldKeyOf('custom_fields.')).toBeNull();
    expect(customFieldKeyOf('tags')).toBeNull();
  });
});

describe('isNumericClause', () => {
  it('is true for the two aggregates and for any gte/lte', () => {
    expect(isNumericClause('accepted_quotations_count_365d', 'eq')).toBe(true);
    expect(isNumericClause('accepted_quotations_amount_365d', 'eq')).toBe(true);
    expect(isNumericClause('custom_fields.tinggi', 'gte')).toBe(true);
    expect(isNumericClause('tags', 'lte')).toBe(true);
    expect(isNumericClause('tags', 'eq')).toBe(false);
  });
});

describe('serializeSegmentClauses', () => {
  it('produces the exact API shape and trims values', () => {
    expect(
      serializeSegmentClauses([
        { field: 'customer_type', operator: 'eq', value: `  ${KORPORAT_ID}  ` },
      ])
    ).toEqual({ all: [{ field: 'customer_type', operator: 'eq', value: KORPORAT_ID }] });
  });

  it('drops incomplete clauses: no field, empty value, empty "in" list', () => {
    const drafts: SegmentClauseDraft[] = [
      { field: 'tags', operator: 'eq', value: 'vip' },
      { field: '', operator: 'eq', value: 'x' },
      { field: 'region', operator: 'eq', value: '   ' },
      { field: 'lead_status', operator: 'in', value: ['', '  '] },
    ];
    expect(serializeSegmentClauses(drafts)).toEqual({
      all: [{ field: 'tags', operator: 'eq', value: 'vip' }],
    });
  });

  it('returns null when nothing is complete, never an empty {all: []}', () => {
    // `{"all": []}` matches NOBODY (spec A14), so writing one by accident
    // would silently make a segment inert rather than refuse the save.
    expect(serializeSegmentClauses([])).toBeNull();
    expect(serializeSegmentClauses([{ field: 'tags', operator: 'eq', value: '' }])).toBeNull();
    expect(serializeSegmentClauses([{ field: '', operator: 'in', value: [] }])).toBeNull();
  });

  it('de-blanks an "in" list and keeps it a list', () => {
    expect(
      serializeSegmentClauses([
        { field: 'lead_status', operator: 'in', value: ['New', ' ', 'Qualified', ''] },
      ])
    ).toEqual({ all: [{ field: 'lead_status', operator: 'in', value: ['New', 'Qualified'] }] });
  });

  it('collapses a list on a single-value operator to its first entry', () => {
    expect(
      serializeSegmentClauses([{ field: 'region', operator: 'eq', value: [JABAR_ID, JAKARTA_ID] }])
    ).toEqual({ all: [{ field: 'region', operator: 'eq', value: JABAR_ID }] });
  });

  it('drops a clause whose operator the field does not allow', () => {
    // The builder cannot offer these pairs; a criteria loaded from an older
    // build could still carry one, and the server would 400 on it.
    expect(
      serializeSegmentClauses([
        { field: 'customer_type', operator: 'contains', value: 'Korp' },
        { field: 'tags', operator: 'gte', value: '3' },
        { field: 'accepted_quotations_count_365d', operator: 'in', value: ['1', '2'] },
      ])
    ).toBeNull();
  });

  it('drops a clause naming an unknown field', () => {
    expect(
      serializeSegmentClauses([{ field: 'lifetime_value' as any, operator: 'gte', value: '10' }])
    ).toBeNull();
  });

  it('drops a bare `custom_fields.` with no key but keeps a real one', () => {
    expect(
      serializeSegmentClauses([
        { field: 'custom_fields.', operator: 'eq', value: 'x' },
        { field: 'custom_fields.warna', operator: 'contains', value: ' merah ' },
      ])
    ).toEqual({ all: [{ field: 'custom_fields.warna', operator: 'contains', value: 'merah' }] });
  });

  it('serialises numeric comparisons as NUMBERS, not strings', () => {
    const criteria = serializeSegmentClauses([
      { field: 'accepted_quotations_count_365d', operator: 'gte', value: ' 2 ' },
      { field: 'accepted_quotations_amount_365d', operator: 'lte', value: '1500000.50' },
    ]);
    expect(criteria).toEqual({
      all: [
        { field: 'accepted_quotations_count_365d', operator: 'gte', value: 2 },
        { field: 'accepted_quotations_amount_365d', operator: 'lte', value: 1500000.5 },
      ],
    });
    expect(typeof criteria!.all[0].value).toBe('number');
  });

  it('drops a numeric comparison whose value is not a number', () => {
    // The server refuses a non-numeric gte/lte with a 400 on the clause index.
    expect(
      serializeSegmentClauses([
        { field: 'accepted_quotations_count_365d', operator: 'gte', value: 'dua' },
        { field: 'custom_fields.tinggi', operator: 'lte', value: '' },
      ])
    ).toBeNull();
  });

  it('keeps every complete clause, up to the ten the API allows', () => {
    const drafts: SegmentClauseDraft[] = Array.from({ length: 10 }, (_, index) => ({
      field: 'tags',
      operator: 'eq' as const,
      value: `tag-${index}`,
    }));
    expect(serializeSegmentClauses(drafts)!.all).toHaveLength(10);
  });
});

describe('clausesFromCriteria', () => {
  it('round-trips a serialised criteria back into editable rows', () => {
    const criteria = serializeSegmentClauses([
      { field: 'customer_type', operator: 'eq', value: KORPORAT_ID },
      { field: 'lead_status', operator: 'in', value: ['New', 'Qualified'] },
      { field: 'accepted_quotations_count_365d', operator: 'gte', value: '2' },
    ])!;
    const rows = clausesFromCriteria(criteria);
    expect(rows).toEqual([
      { field: 'customer_type', operator: 'eq', value: KORPORAT_ID },
      { field: 'lead_status', operator: 'in', value: ['New', 'Qualified'] },
      { field: 'accepted_quotations_count_365d', operator: 'gte', value: '2' },
    ]);
    expect(serializeSegmentClauses(rows)).toEqual(criteria);
  });

  it('copies arrays so editing never mutates the loaded segment', () => {
    const stored = { all: [{ field: 'lead_status' as const, operator: 'in' as const, value: ['New'] }] };
    const rows = clausesFromCriteria(stored);
    (rows[0].value as string[]).push('Lost');
    expect(stored.all[0].value).toEqual(['New']);
  });

  it('is empty for null, undefined and a criteria with no clauses', () => {
    expect(clausesFromCriteria(null)).toEqual([]);
    expect(clausesFromCriteria(undefined)).toEqual([]);
    expect(clausesFromCriteria({ all: [] })).toEqual([]);
  });

  it('repairs a stored clause whose operator the field no longer allows', () => {
    const rows = clausesFromCriteria({
      all: [{ field: 'customer_type', operator: 'contains' as any, value: 'Korp' }],
    });
    // First operator the field allows, so the row is visible and fixable
    // instead of the screen throwing on an unrenderable operator.
    expect(rows[0].operator).toBe('eq');
  });

  it('coerces a stored scalar under "in" into a one-item list', () => {
    expect(clausesFromCriteria({ all: [{ field: 'tags', operator: 'in', value: 'vip' as any }] })).toEqual([
      { field: 'tags', operator: 'in', value: ['vip'] },
    ]);
  });

  it('renders a stored NUMBER back as the number input\'s string', () => {
    expect(
      clausesFromCriteria({
        all: [{ field: 'accepted_quotations_amount_365d', operator: 'gte', value: 1500000.5 }],
      })
    ).toEqual([{ field: 'accepted_quotations_amount_365d', operator: 'gte', value: '1500000.5' }]);
  });
});

describe('criteria order is never load-bearing', () => {
  it('serialises a shuffled clause list to the same AND, member for member', () => {
    // The API stores criteria in JSONB and AND is commutative, so the same
    // clauses in another order must mean the same segment (spec E2 rule 8).
    const drafts: SegmentClauseDraft[] = [
      { field: 'customer_type', operator: 'eq', value: KORPORAT_ID },
      { field: 'region', operator: 'in', value: [JABAR_ID] },
      { field: 'accepted_quotations_count_365d', operator: 'gte', value: '2' },
    ];
    const forward = serializeSegmentClauses(drafts)!;
    const reversed = serializeSegmentClauses([...drafts].reverse())!;
    expect([...reversed.all].reverse()).toEqual(forward.all);
    expect(reversed.all).toHaveLength(forward.all.length);
  });
});

describe('criteriaSignature', () => {
  it('ignores the key order Postgres hands the criteria back in', () => {
    // jsonb normalises object keys by (length, bytes), so a clause written
    // {field, operator, value} comes back {field, value, operator}. Comparing
    // JSON.stringify of the two made every freshly loaded segment look dirty.
    const asStored = { all: [{ field: 'tags', value: 'VIP', operator: 'eq' } as any] };
    const asWritten = { all: [{ field: 'tags', operator: 'eq', value: 'VIP' } as any] };
    expect(criteriaSignature(asStored)).toBe(criteriaSignature(asWritten));
  });

  it('matches the round trip through the builder, so an untouched segment is clean', () => {
    const stored = {
      all: [
        { field: 'customer_type', value: KORPORAT_ID, operator: 'eq' },
        { field: 'region', value: [JABAR_ID, JAKARTA_ID], operator: 'in' },
        { field: 'accepted_quotations_count_365d', value: 2, operator: 'gte' },
      ],
    } as any;
    expect(criteriaSignature(serializeSegmentClauses(clausesFromCriteria(stored)))).toBe(
      criteriaSignature(stored)
    );
  });

  it('still sees a real edit', () => {
    const before = { all: [{ field: 'tags', operator: 'eq', value: 'VIP' } as any] };
    const after = { all: [{ field: 'tags', operator: 'eq', value: 'Reseller' } as any] };
    expect(criteriaSignature(before)).not.toBe(criteriaSignature(after));
    expect(criteriaSignature(null)).toBe(criteriaSignature({ all: [] }));
  });
});

describe('describeCriteria', () => {
  const labelFor = (field: string) => SEGMENT_FIELD_LABELS[field as keyof typeof SEGMENT_FIELD_LABELS] ?? field;

  it('names the fields a segment reads', () => {
    expect(
      describeCriteria(
        { all: [{ field: 'customer_type', operator: 'eq', value: 'X' }, { field: 'region', operator: 'eq', value: 'Y' }] },
        labelFor
      )
    ).toBe('Tipe pelanggan dan Wilayah');
  });

  it('says an empty criteria matches nobody, never "everyone"', () => {
    expect(describeCriteria({ all: [] }, labelFor)).toBe('Tidak cocok dengan siapa pun');
    expect(describeCriteria(null, labelFor)).toBe('Tidak cocok dengan siapa pun');
  });
});
