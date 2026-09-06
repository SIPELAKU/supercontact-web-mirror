import { describe, it, expect } from 'vitest';
import {
  QUOTATION_STATUS,
  QUOTATION_STATUSES,
  QUOTATION_STATUS_OPTIONS,
  canDecideApproval,
  canDecideQuotation,
  canDeleteQuotation,
  canEditQuotation,
  canRecallQuotation,
  canReviseQuotation,
  canSendQuotation,
  canSubmitForApproval,
  displayQuotationStatus,
  expiredQuotationUpperBound,
  normalizeQuotationStatus,
  quotationDeleteBlockedReason,
  quotationEditBlockedReason,
  quotationListFilterQuery,
  quotationReviseBlockedReason,
  quotationStatusMeta,
} from './quotation-status';

/**
 * The API's canonical vocabulary (app/models/quotation_model.py
 * CANONICAL_STATUSES). If the server ever gains or renames a value this list
 * must change with it - the test is the reminder.
 */
const API_STATUSES = ['draft', 'pending_approval', 'sent', 'accepted', 'rejected', 'expired'];

describe('QUOTATION_STATUSES', () => {
  it('covers exactly the six API values, no more and no fewer', () => {
    expect(Object.keys(QUOTATION_STATUSES).sort()).toEqual([...API_STATUSES].sort());
    expect(Object.values(QUOTATION_STATUS).sort()).toEqual([...API_STATUSES].sort());
  });

  it('lists the filter options in a sensible order with their own value', () => {
    expect(QUOTATION_STATUS_OPTIONS.map((o) => o.value)).toEqual(API_STATUSES);
    for (const option of QUOTATION_STATUS_OPTIONS) {
      expect(option.label).toBeTruthy();
      expect(QUOTATION_STATUSES[option.value as keyof typeof QUOTATION_STATUSES]).toBe(option);
    }
  });
});

describe('normalizeQuotationStatus', () => {
  it('maps the legacy spellings the way the API remap does', () => {
    expect(normalizeQuotationStatus('Pending')).toBe('sent');
    expect(normalizeQuotationStatus('Accepted')).toBe('accepted');
  });

  it('leaves canonical values alone', () => {
    for (const value of API_STATUSES) {
      expect(normalizeQuotationStatus(value)).toBe(value);
    }
  });

  it('returns an unknown value untouched rather than guessing', () => {
    expect(normalizeQuotationStatus('Rejected')).toBe('Rejected');
    expect(normalizeQuotationStatus('bogus')).toBe('bogus');
  });

  it('treats empty input as no status', () => {
    expect(normalizeQuotationStatus('')).toBe('');
    expect(normalizeQuotationStatus(null)).toBe('');
    expect(normalizeQuotationStatus(undefined)).toBe('');
  });
});

describe('quotationStatusMeta', () => {
  it('resolves legacy spellings to the canonical chip', () => {
    expect(quotationStatusMeta('Pending')).toBe(QUOTATION_STATUSES.sent);
    expect(quotationStatusMeta('Accepted')).toBe(QUOTATION_STATUSES.accepted);
  });

  it('gives an unknown value its raw label and a neutral chip', () => {
    expect(quotationStatusMeta('weird')).toEqual({
      value: 'weird',
      label: 'weird',
      color: 'default',
    });
  });
});

describe('displayQuotationStatus', () => {
  const today = new Date(2026, 8, 4, 10, 30); // 4 Sep 2026, mid-morning

  it('hints Kedaluwarsa for a sent quotation whose expiry has passed', () => {
    const shown = displayQuotationStatus('sent', '2026-09-01T00:00:00Z', today);
    expect(shown.value).toBe('expired');
    expect(shown.label).toBe('Kedaluwarsa');
  });

  it('keeps a sent quotation that expires today or later as Terkirim', () => {
    expect(displayQuotationStatus('sent', '2026-09-04T00:00:00Z', today).value).toBe('sent');
    expect(displayQuotationStatus('sent', '2026-12-31T00:00:00Z', today).value).toBe('sent');
  });

  it('never re-labels a non-sent quotation, however old', () => {
    expect(displayQuotationStatus('draft', '2020-01-01', today).value).toBe('draft');
    expect(displayQuotationStatus('accepted', '2020-01-01', today).value).toBe('accepted');
    expect(displayQuotationStatus('rejected', '2020-01-01', today).value).toBe('rejected');
  });

  it('ignores a missing or unparsable expiry', () => {
    expect(displayQuotationStatus('sent', null, today).value).toBe('sent');
    expect(displayQuotationStatus('sent', 'not a date', today).value).toBe('sent');
  });

  it('applies the hint to the legacy Pending spelling too', () => {
    expect(displayQuotationStatus('Pending', '2026-01-01', today).value).toBe('expired');
  });
});

describe('quotationListFilterQuery (list filter -> GET /quotations)', () => {
  const today = new Date(2026, 8, 4, 10, 30); // 4 Sep 2026, mid-morning, local
  const midnightToday = new Date(2026, 8, 4).getTime();

  it('passes a canonical status and the date range through untouched', () => {
    expect(quotationListFilterQuery('draft', ['2026-09-01', '2026-09-30'], today)).toEqual({
      quotation_status: 'draft',
      date_from: '2026-09-01',
      date_to: '2026-09-30',
    });
    // Either side of the range may be empty ("sejak" / "sampai").
    expect(quotationListFilterQuery('sent', ['2026-09-01', undefined], today)).toEqual({
      quotation_status: 'sent',
      date_from: '2026-09-01',
      date_to: undefined,
    });
  });

  it('folds a bookmarked legacy spelling onto its canonical value', () => {
    expect(quotationListFilterQuery('Pending', undefined, today).quotation_status).toBe('sent');
    expect(quotationListFilterQuery('Accepted', undefined, today).quotation_status).toBe('accepted');
  });

  it('sends no status when the filter is empty', () => {
    expect(quotationListFilterQuery(undefined, undefined, today).quotation_status).toBeUndefined();
    expect(quotationListFilterQuery('', ['2026-09-01', '2026-09-30'], today)).toEqual({
      quotation_status: undefined,
      date_from: '2026-09-01',
      date_to: '2026-09-30',
    });
  });

  it('translates the client-only expired into sent plus a date_to cap', () => {
    // The API never stores `expired` (spec A14); sent verbatim it matched nothing.
    const q = quotationListFilterQuery('expired', undefined, today);
    expect(q.quotation_status).toBe('sent');
    expect(q.date_from).toBeUndefined();
    expect(new Date(q.date_to!).getTime()).toBe(midnightToday - 1);
  });

  it('caps at the millisecond before local midnight today', () => {
    expect(expiredQuotationUpperBound(today)).toBe(new Date(midnightToday - 1).toISOString());
  });

  it('keeps an earlier user date_to, tightens a later one, keeps date_from', () => {
    const earlier = quotationListFilterQuery('expired', ['2026-01-01', '2026-08-01'], today);
    expect(earlier).toEqual({ quotation_status: 'sent', date_from: '2026-01-01', date_to: '2026-08-01' });

    const later = quotationListFilterQuery('expired', ['2026-01-01', '2026-12-31'], today);
    expect(later.quotation_status).toBe('sent');
    expect(later.date_from).toBe('2026-01-01');
    expect(new Date(later.date_to!).getTime()).toBe(midnightToday - 1);

    // Unparsable user input falls back to the cap rather than to nothing.
    const junk = quotationListFilterQuery('expired', [undefined, 'not a date'], today);
    expect(new Date(junk.date_to!).getTime()).toBe(midnightToday - 1);
  });

  it('filters as Kedaluwarsa exactly the rows the chip shows as Kedaluwarsa', () => {
    const { date_to } = quotationListFilterQuery('expired', undefined, today);
    const cap = new Date(date_to!).getTime();
    const samples = [
      '2026-09-01T00:00:00Z',
      '2026-09-03T00:00:00Z', // how the form stores a date picked in the UI
      '2026-09-03T15:00:00Z', // a stored time of day; a bare YYYY-MM-DD cap would miss it
      new Date(midnightToday - 1).toISOString(),
      new Date(midnightToday).toISOString(),
      '2026-09-04T00:00:00Z',
      '2026-09-10T00:00:00Z',
    ];
    for (const expireDate of samples) {
      const chipSaysExpired = displayQuotationStatus('sent', expireDate, today).value === 'expired';
      // QuotationRepository.get_all: `Quotation.expire_date <= date_to`
      const serverMatches = new Date(expireDate).getTime() <= cap;
      expect(serverMatches, expireDate).toBe(chipSaysExpired);
    }
  });
});

describe('capabilities mirror the API guards', () => {
  it('only draft is editable', () => {
    expect(canEditQuotation('draft')).toBe(true);
    for (const value of ['sent', 'accepted', 'rejected', 'expired', 'pending_approval', 'Pending', 'Accepted']) {
      expect(canEditQuotation(value)).toBe(false);
    }
    expect(quotationEditBlockedReason('draft')).toBeUndefined();
    expect(quotationEditBlockedReason('sent')).toMatch(/Draft/);
  });

  it('only sent (including legacy Pending) can be accepted or rejected', () => {
    expect(canDecideQuotation('sent')).toBe(true);
    expect(canDecideQuotation('Pending')).toBe(true);
    for (const value of ['draft', 'accepted', 'rejected', 'expired', 'Accepted']) {
      expect(canDecideQuotation(value)).toBe(false);
    }
  });
});

// ── Phase 4 governance capabilities ────────────────────────────────────────
//
// These mirror server guards one-for-one (spec E5/E6/E8). The point of the
// suite is that the UI is neither STRICTER than the server (an action the user
// is entitled to but cannot see) nor LOOSER (a button that can only 400).

describe('canSubmitForApproval', () => {
  it('is true only for a draft', () => {
    expect(canSubmitForApproval('draft')).toBe(true);
    for (const value of ['pending_approval', 'sent', 'accepted', 'rejected', 'expired']) {
      expect(canSubmitForApproval(value)).toBe(false);
    }
  });

  it('reads the legacy spellings through the normaliser', () => {
    // `Pending` means "sent to the customer", never "draft" - submitting it
    // for approval would be nonsense.
    expect(canSubmitForApproval('Pending')).toBe(false);
    expect(canSubmitForApproval('Accepted')).toBe(false);
  });
});

describe('canRecallQuotation', () => {
  it('is true only while pending AND only for the requester', () => {
    expect(canRecallQuotation('pending_approval', true)).toBe(true);
    // A17: a second person does not cancel someone else's request; they
    // approve or reject it.
    expect(canRecallQuotation('pending_approval', false)).toBe(false);
    for (const value of ['draft', 'sent', 'accepted', 'rejected', 'expired']) {
      expect(canRecallQuotation(value, true)).toBe(false);
    }
  });
});

describe('canDecideApproval', () => {
  it('needs the status, the grant, and NOT being the requester', () => {
    expect(canDecideApproval('pending_approval', true, false)).toBe(true);
    // The requester of an ORDINARY request still sees no button: that
    // decision can only ever 403.
    expect(canDecideApproval('pending_approval', true, true)).toBe(false);
    expect(canDecideApproval('pending_approval', false, false)).toBe(false);
    expect(canDecideApproval('draft', true, false)).toBe(false);
    expect(canDecideApproval('sent', true, false)).toBe(false);
  });

  it('lets the requester decide a SELF-APPROVED row (A17, owner amendment)', () => {
    // The tenant had no second `quotations:approve` holder, so the request was
    // routed to its own requester and the row says so. Hiding the button here
    // is what left every staging tenant - and production's Superjob - with a
    // `pending_approval` quotation whose only escape was recall.
    expect(canDecideApproval('pending_approval', true, true, true)).toBe(true);
    // The grant is still required, and so is the status.
    expect(canDecideApproval('pending_approval', false, true, true)).toBe(false);
    expect(canDecideApproval('draft', true, true, true)).toBe(false);
    // Absent argument keeps the old, stricter behaviour.
    expect(canDecideApproval('pending_approval', true, true)).toBe(false);
  });
});

describe('canSendQuotation', () => {
  it('is true only for sent - which includes a just-approved quotation', () => {
    // A20: approval lands the row on `sent` BEFORE any delivery exists, which
    // is exactly the state the send action is for.
    expect(canSendQuotation('sent')).toBe(true);
    expect(canSendQuotation('Pending')).toBe(true);
    for (const value of ['draft', 'pending_approval', 'accepted', 'rejected', 'expired']) {
      expect(canSendQuotation(value)).toBe(false);
    }
  });
});

describe('canReviseQuotation', () => {
  it('allows sent, rejected and expired when there is no child yet', () => {
    for (const value of ['sent', 'rejected', 'expired']) {
      expect(canReviseQuotation(value, false)).toBe(true);
    }
  });

  it('refuses accepted, draft and pending_approval', () => {
    // `accepted` is a closed commitment; a draft or a pending row is simply
    // edited (or recalled and edited) instead.
    for (const value of ['accepted', 'draft', 'pending_approval']) {
      expect(canReviseQuotation(value, false)).toBe(false);
    }
  });

  it('refuses ANY status once a child revision exists', () => {
    // One live tip per chain (A5). Without the flag the UI would offer Revisi
    // on every `expired` row - and `expired` is produced ONLY by the supersede
    // path, so every one of them already has a child and the server would
    // answer 409 QUOTATION_ALREADY_REVISED every time.
    for (const value of ['sent', 'rejected', 'expired', 'accepted', 'draft']) {
      expect(canReviseQuotation(value, true)).toBe(false);
    }
  });
});

describe('canDeleteQuotation', () => {
  it('is true only for a draft, matching the new server guard', () => {
    // A21 / E6.3: seven production users hold `quotations:delete`, and before
    // this guard one of them could hard-delete a `sent` parent and orphan its
    // whole revision chain through ON DELETE SET NULL.
    expect(canDeleteQuotation('draft')).toBe(true);
    for (const value of ['pending_approval', 'sent', 'accepted', 'rejected', 'expired']) {
      expect(canDeleteQuotation(value)).toBe(false);
    }
  });
});

describe('blocked reasons name the next action, not just the refusal', () => {
  it('separates "waiting on someone else" from "superseded by a revision"', () => {
    expect(quotationEditBlockedReason('draft')).toBeUndefined();
    expect(quotationEditBlockedReason('pending_approval')).toMatch(/persetujuan/i);
    // The locked case points at Revisi - the actual way forward - while still
    // naming Draft as the only editable state.
    const locked = quotationEditBlockedReason('sent');
    expect(locked).toMatch(/Draft/);
    expect(locked).toMatch(/Revisi/i);
  });

  it('gives the delete guard its own two reasons', () => {
    expect(quotationDeleteBlockedReason('draft')).toBeUndefined();
    expect(quotationDeleteBlockedReason('pending_approval')).toMatch(/pengajuan/i);
    expect(quotationDeleteBlockedReason('sent')).toMatch(/draft/i);
  });

  it('names the existing child when a row was already revised', () => {
    expect(quotationReviseBlockedReason('sent', false)).toBeUndefined();
    expect(quotationReviseBlockedReason('sent', true)).toMatch(/sudah punya revisi/i);
    // "Already revised" wins over "wrong status": it is the more specific and
    // more actionable fact, and it is what the server reports too.
    expect(quotationReviseBlockedReason('accepted', true)).toMatch(/sudah punya revisi/i);
    expect(quotationReviseBlockedReason('accepted', false)).toMatch(/diterima/i);
    expect(quotationReviseBlockedReason('draft', false)).toMatch(/terkirim/i);
  });
});
