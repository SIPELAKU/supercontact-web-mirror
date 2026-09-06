import { describe, expect, it } from 'vitest';
import {
  CRM_IMPORT_LEVELS,
  LINKABLE_SALES_CHANNEL_TYPES,
  REGION_LEVEL_LABELS,
  REGION_LEVEL_OPTIONS,
  SALES_CHANNEL_TYPE_LABELS,
  SALES_CHANNEL_TYPE_OPTIONS,
  SEGMENT_CLAUSE_OPERATOR_LABELS,
  SEGMENT_CUSTOM_FIELD_OPS,
  SEGMENT_FIELD_LABELS,
  SEGMENT_FIELD_OPS,
  SEGMENT_FIELD_OPTIONS,
  canLinkOmnichannelAccount,
  omnichannelLinkDisabledReason,
} from './commercial-context';
import { TARGET_TYPE_LABELS, TARGET_TYPE_OPTIONS } from './price-list';

// These are the `Record<>` tripwires spec I1/I3 asks for: a union that grows
// without its labels is a tsc error, and these assertions pin the CONTENT the
// compiler cannot check - that the maps mirror the API's own constants.

describe('sales channel types', () => {
  it('carries the API\'s seven values, and only those', () => {
    expect(Object.keys(SALES_CHANNEL_TYPE_LABELS).sort()).toEqual(
      ['direct', 'email', 'field_sales', 'marketplace', 'reseller', 'web_widget', 'whatsapp'].sort()
    );
    expect(SALES_CHANNEL_TYPE_OPTIONS).toHaveLength(7);
    expect(SALES_CHANNEL_TYPE_OPTIONS.every((option) => option.label.trim().length > 0)).toBe(true);
  });

  it('lets exactly the three overlapping types carry an omnichannel account', () => {
    // The sales `channel_type` vocabulary and the omnichannel `ChannelType`
    // one overlap in exactly these three (spec A25).
    expect([...LINKABLE_SALES_CHANNEL_TYPES].sort()).toEqual(['email', 'web_widget', 'whatsapp']);
    expect(canLinkOmnichannelAccount('whatsapp')).toBe(true);
    expect(canLinkOmnichannelAccount('web_widget')).toBe(true);
    expect(canLinkOmnichannelAccount('email')).toBe(true);
    expect(canLinkOmnichannelAccount('marketplace')).toBe(false);
    expect(canLinkOmnichannelAccount('reseller')).toBe(false);
    expect(canLinkOmnichannelAccount('field_sales')).toBe(false);
    expect(canLinkOmnichannelAccount('direct')).toBe(false);
  });

  it('gives every refusing type a READABLE reason, never a silent disable', () => {
    expect(omnichannelLinkDisabledReason('whatsapp')).toBeNull();
    for (const type of ['marketplace', 'reseller', 'field_sales', 'direct'] as const) {
      const reason = omnichannelLinkDisabledReason(type);
      expect(reason).toBeTruthy();
      expect(reason).toContain(SALES_CHANNEL_TYPE_LABELS[type]);
    }
  });
});

describe('region levels', () => {
  it('carries the API\'s five values, and only those', () => {
    expect(Object.keys(REGION_LEVEL_LABELS).sort()).toEqual(
      ['country', 'custom', 'kabupaten', 'kecamatan', 'province'].sort()
    );
    expect(REGION_LEVEL_OPTIONS).toHaveLength(5);
  });

  it('scans the three geography levels the CRM importer knows', () => {
    // `custom` and `country` are never matched from crm_companies text.
    expect([...CRM_IMPORT_LEVELS]).toEqual(['province', 'kabupaten', 'kecamatan']);
    for (const level of CRM_IMPORT_LEVELS) {
      expect(REGION_LEVEL_LABELS[level]).toBeTruthy();
    }
  });
});

describe('segment criteria whitelist', () => {
  it('offers exactly the seven base fields the API allows', () => {
    expect(SEGMENT_FIELD_OPTIONS.map((option) => option.value).sort()).toEqual(
      [
        'accepted_quotations_amount_365d',
        'accepted_quotations_count_365d',
        'customer_type',
        'lead_status',
        'region',
        'sales_channel',
        'tags',
      ].sort()
    );
  });

  it('keeps SEGMENT_FIELD_OPS, the options list and the labels in step', () => {
    const opsKeys = Object.keys(SEGMENT_FIELD_OPS).sort();
    expect(SEGMENT_FIELD_OPTIONS.map((option) => option.value).sort()).toEqual(opsKeys);
    expect(Object.keys(SEGMENT_FIELD_LABELS).sort()).toEqual(opsKeys);
  });

  it('gives every field at least one operator, all from the closed five', () => {
    const known = Object.keys(SEGMENT_CLAUSE_OPERATOR_LABELS);
    expect(known.sort()).toEqual(['contains', 'eq', 'gte', 'in', 'lte']);
    for (const [field, ops] of Object.entries(SEGMENT_FIELD_OPS)) {
      expect(ops.length, field).toBeGreaterThan(0);
      for (const op of ops) expect(known).toContain(op);
    }
    for (const op of SEGMENT_CUSTOM_FIELD_OPS) expect(known).toContain(op);
  });

  it('gives the two aggregates numeric operators and no set operator', () => {
    for (const field of ['accepted_quotations_count_365d', 'accepted_quotations_amount_365d'] as const) {
      expect(SEGMENT_FIELD_OPS[field]).toEqual(['eq', 'gte', 'lte']);
      expect(SEGMENT_FIELD_OPTIONS.find((option) => option.value === field)?.numeric).toBe(true);
    }
  });

  it('marks only the aggregates numeric, so the rest get pickers', () => {
    const numeric = SEGMENT_FIELD_OPTIONS.filter((option) => option.numeric).map((o) => o.value);
    expect(numeric.sort()).toEqual(['accepted_quotations_amount_365d', 'accepted_quotations_count_365d']);
  });

  it('states what tags and lead_status actually read (spec A0.2)', () => {
    // A13's "tags means leads.tag" fallback was WITHDRAWN by the owner on
    // 2026-09-05: contact tags are real rows, so `tags` reads the contact's
    // own tag set, case-insensitively. `lead_status` still reads the leads.
    // The hint is where a user learns which is which, so it is pinned.
    const tagsHint = SEGMENT_FIELD_OPTIONS.find((o) => o.value === 'tags')?.hint ?? '';
    expect(tagsHint).toContain('kontak');
    expect(tagsHint).not.toContain('lead');
    expect(SEGMENT_FIELD_OPTIONS.find((o) => o.value === 'lead_status')?.hint).toContain('lead');
  });
});

describe('assignment target types (Phase 3 widening)', () => {
  it('labels all six kinds the assignment enum now carries', () => {
    expect(Object.keys(TARGET_TYPE_LABELS).sort()).toEqual(
      ['contact', 'crm_company', 'customer_type', 'region', 'sales_channel', 'segment'].sort()
    );
    expect(TARGET_TYPE_OPTIONS).toHaveLength(6);
    expect(TARGET_TYPE_OPTIONS.every((option) => option.label.trim().length > 0)).toBe(true);
  });
});
