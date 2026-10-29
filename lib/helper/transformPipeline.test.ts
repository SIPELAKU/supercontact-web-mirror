import { describe, it, expect } from 'vitest';
import type { PipelineBoardStage } from '@/lib/api/pipelines';
import { isClosedStage, mapBoardStages, type PipelineAPIItem } from './transformPipeline';

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

  it('takes expired and the deletion countdown from the API, not from the close date', () => {
    const stages = mapBoardStages([
      column('Prospect', [
        // Close date long past, but the API counts 30 days from the day it expired.
        { ...item('expired', 'Prospect'), expected_close_date: '2026-03-01T00:00:00Z', status: 'expired', days_until_deletion: 26 },
        { ...item('due-today', 'Prospect'), status: 'expired', days_until_deletion: 0 },
        { ...item('active', 'Prospect'), expected_close_date: '2020-01-01T00:00:00Z', status: 'active', days_until_deletion: null },
      ]),
    ]);
    const deals = stages[0].deals;

    expect(deals.find((d) => d.id === 'expired')).toMatchObject({ is_expired: true, days_until_deletion: 26 });
    expect(deals.find((d) => d.id === 'due-today')).toMatchObject({ is_expired: true, days_until_deletion: 0 });
    expect(deals.find((d) => d.id === 'active')).toMatchObject({ is_expired: false, days_until_deletion: undefined });
  });

  it('has no countdown when the API does not send one yet (older API)', () => {
    const stages = mapBoardStages([column('Prospect', [{ ...item('old', 'Prospect'), status: 'expired' }])]);

    expect(stages[0].deals[0]).toMatchObject({ is_expired: true, days_until_deletion: undefined });
  });

  it('never marks a won or lost deal expired, whatever its stage is called', () => {
    const stages = mapBoardStages([column('AJB', [{ ...item('won', 'AJB'), expected_close_date: '2020-01-01T00:00:00Z', status: 'won' }])]);

    expect(stages[0].deals[0].is_expired).toBe(false);
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
