import { describe, it, expect } from 'vitest';
import type { PipelineBoardStage } from '@/lib/api/pipelines';
import { daysUntilDeletion, isClosedStage, isDealExpired, mapBoardStages, type PipelineAPIItem } from './transformPipeline';

const item = (id: string, deal_stage: string, probability_of_close?: number): PipelineAPIItem => ({
  id,
  deal_name: id,
  deal_stage,
  probability_of_close,
  amount: '1000.00',
  avatar: '',
  contact: { id: `c-${id}`, name: `Client ${id}`, company: '' },
  user: { id: 'u1', fullname: 'Sari', email: 's@x.id', avatar_initial: 'S', avatar_url: null },
});

const column = (name: string, deals: PipelineAPIItem[], extra: Partial<PipelineBoardStage> = {}): PipelineBoardStage => ({
  name,
  outcome: 'open',
  display_order: 1,
  count: deals.length,
  total_amount: '0',
  deals,
  next_cursor: null,
  ...extra,
});

// 26 Oct 2026, mid-afternoon local time.
const now = new Date(2026, 9, 26, 15, 0, 0);

describe('mapBoardStages (GET /pipelines/board)', () => {
  it("keeps the API's column order, including a stage outside the default six", () => {
    const stages = mapBoardStages([column('Prospect', []), column('Demo', []), column('Closed - Won', [])]);

    expect(stages.map((s) => s.name)).toEqual(['Prospect', 'Demo', 'Closed - Won']);
  });

  it("keeps the API's order inside a column - the API sorts, the board does not re-sort", () => {
    const stages = mapBoardStages([column('Prospect', [item('p40', 'Prospect', 40), item('p80', 'Prospect', 80)])]);

    expect(stages[0].deals.map((d) => d.id)).toEqual(['p40', 'p80']);
  });

  it("takes the header's count and total from the API, not from the loaded deals", () => {
    const stages = mapBoardStages([
      column('Prospect', [item('a', 'Prospect'), item('b', 'Prospect')], {
        count: 134,
        total_amount: '101121550.00',
        next_cursor: 'cursor-1',
      }),
    ]);

    expect(stages[0]).toMatchObject({ count: 134, value: 101121550, nextCursor: 'cursor-1' });
    expect(stages[0].deals).toHaveLength(2);
  });

  it('has nothing more to load when the API sends no cursor', () => {
    expect(mapBoardStages([column('Qualified', [])])[0].nextCursor).toBeNull();
  });

  it('reads the Decimal amount of each deal as a number', () => {
    const stages = mapBoardStages([column('Proposal', [{ ...item('a', 'Proposal'), amount: '1500.50' }])]);

    expect(stages[0].deals[0].amount).toBe(1500.5);
  });

  it('still marks expired deals from their expected close date, with the deletion countdown', () => {
    const stages = mapBoardStages(
      [
        column('Prospect', [
          { ...item('late', 'Prospect'), expected_close_date: '2026-10-25T00:00:00Z' },
          { ...item('ahead', 'Prospect'), expected_close_date: '2999-01-01T00:00:00Z' },
        ]),
      ],
      now
    );
    const deals = stages[0].deals;

    expect(deals.find((d) => d.id === 'late')).toMatchObject({ is_expired: true, days_until_deletion: 29 });
    expect(deals.find((d) => d.id === 'ahead')).toMatchObject({ is_expired: false, days_until_deletion: undefined });
  });
});

describe('isDealExpired', () => {
  it('is expired once the expected close date has passed', () => {
    expect(isDealExpired('2026-10-25T00:00:00Z', 'Prospect', now)).toBe(true);
    expect(isDealExpired('2026-09-16T00:00:00Z', 'Negotiation', now)).toBe(true);
  });

  it('is not expired on the close date itself, nor before it', () => {
    expect(isDealExpired('2026-10-26T00:00:00Z', 'Prospect', now)).toBe(false);
    expect(isDealExpired('2026-11-03T00:00:00Z', 'Proposal', now)).toBe(false);
  });

  it('never expires a closed deal, won or lost', () => {
    expect(isDealExpired('2020-01-01T00:00:00Z', 'Closed - Won', now)).toBe(false);
    expect(isDealExpired('2020-01-01T00:00:00Z', 'Closed - Lost', now)).toBe(false);
  });

  it('is not expired without a close date', () => {
    expect(isDealExpired(undefined, 'Prospect', now)).toBe(false);
    expect(isDealExpired('', 'Prospect', now)).toBe(false);
  });
});

describe('daysUntilDeletion', () => {
  it('counts down to 30 days after the expected close date', () => {
    expect(daysUntilDeletion('2026-10-25T00:00:00Z', now)).toBe(29); // deleted 24 Nov
    expect(daysUntilDeletion('2026-10-06T00:00:00Z', now)).toBe(10); // deleted 5 Nov
  });

  it('is 1 the day before, 0 on the day, and negative once the day has passed', () => {
    expect(daysUntilDeletion('2026-09-27T00:00:00Z', now)).toBe(1);
    expect(daysUntilDeletion('2026-09-26T00:00:00Z', now)).toBe(0);
    expect(daysUntilDeletion('2026-09-16T00:00:00Z', now)).toBe(-10);
  });

  it('counts calendar days across a month end', () => {
    expect(daysUntilDeletion('2026-10-02T00:00:00Z', now)).toBe(6); // deleted 1 Nov
  });
});

describe('isClosedStage', () => {
  it('treats Won and Lost as closed (final), however the name is written', () => {
    expect(isClosedStage('Closed - Won')).toBe(true);
    expect(isClosedStage('Closed - Lost')).toBe(true);
    expect(isClosedStage('closed-won')).toBe(true);
    expect(isClosedStage(' Closed-Lost ')).toBe(true);
  });

  it('treats every open stage, and a missing one, as not closed', () => {
    for (const stage of ['Prospect', 'Qualified', 'Negotiation', 'Proposal', '', null, undefined]) {
      expect(isClosedStage(stage)).toBe(false);
    }
  });
});
