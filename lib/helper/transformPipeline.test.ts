import { describe, it, expect } from 'vitest';
import { daysUntilDeletion, isDealExpired, transformPipelineResponse, type PipelineAPIItem } from './transformPipeline';

const item = (id: string, deal_stage: string, probability_of_close?: number): PipelineAPIItem => ({
  id,
  deal_name: id,
  deal_stage,
  probability_of_close,
  amount: 1000,
  avatar: '',
  contact: { id: `c-${id}`, name: `Client ${id}`, company: '' },
  user: { id: 'u1', fullname: 'Sari', email: 's@x.id', avatar_initial: 'S', avatar_url: null },
});

const idsIn = (stages: ReturnType<typeof transformPipelineResponse>, stage: string) =>
  stages.find((s) => s.name === stage)!.deals.map((d) => d.id);

describe('transformPipelineResponse: kanban order', () => {
  it('orders each column by probability of close won, highest first', () => {
    const stages = transformPipelineResponse({
      pipelines: [
        item('p20', 'Prospect', 20),
        item('p80', 'Prospect', 80),
        item('p40', 'Prospect', 40),
        item('p100', 'Prospect', 100),
      ],
    });

    expect(idsIn(stages, 'Prospect')).toEqual(['p100', 'p80', 'p40', 'p20']);
  });

  it('keeps the API order for deals with the same probability', () => {
    const stages = transformPipelineResponse({
      pipelines: [item('first', 'Qualified', 60), item('top', 'Qualified', 80), item('second', 'Qualified', 60)],
    });

    expect(idsIn(stages, 'Qualified')).toEqual(['top', 'first', 'second']);
  });

  it('sorts every column on its own, and puts a missing probability last', () => {
    const stages = transformPipelineResponse({
      pipelines: [
        item('n-none', 'Negotiation'),
        item('p-low', 'Prospect', 20),
        item('n-high', 'Negotiation', 100),
        item('p-high', 'Prospect', 80),
      ],
    });

    expect(idsIn(stages, 'Prospect')).toEqual(['p-high', 'p-low']);
    expect(idsIn(stages, 'Negotiation')).toEqual(['n-high', 'n-none']);
  });

  it('marks a deal expired from its expected close date, so the card can fade it', () => {
    const stages = transformPipelineResponse({
      pipelines: [
        { ...item('late', 'Prospect', 40), expected_close_date: '2020-01-01T00:00:00Z' },
        { ...item('ahead', 'Prospect', 20), expected_close_date: '2999-01-01T00:00:00Z' },
      ],
    });

    const deals = stages.find((s) => s.name === 'Prospect')!.deals;
    expect(deals.find((d) => d.id === 'late')?.is_expired).toBe(true);
    expect(deals.find((d) => d.id === 'ahead')?.is_expired).toBe(false);
  });

  it('still totals each column', () => {
    const stages = transformPipelineResponse({
      pipelines: [item('a', 'Proposal', 20), item('b', 'Proposal', 80)],
    });

    expect(stages.find((s) => s.name === 'Proposal')!.value).toBe(2000);
  });
});

describe('isDealExpired', () => {
  // 26 Oct 2026, mid-afternoon local time.
  const now = new Date(2026, 9, 26, 15, 0, 0);

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
  // 26 Oct 2026, mid-afternoon local time.
  const now = new Date(2026, 9, 26, 15, 0, 0);

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

  it('is filled in by the transform for expired deals only', () => {
    const stages = transformPipelineResponse({
      pipelines: [
        { ...item('late', 'Prospect', 40), expected_close_date: '2020-01-01T00:00:00Z' },
        { ...item('ahead', 'Prospect', 20), expected_close_date: '2999-01-01T00:00:00Z' },
      ],
    });
    const deals = stages.find((s) => s.name === 'Prospect')!.deals;

    expect(deals.find((d) => d.id === 'late')?.days_until_deletion).toBeLessThan(0);
    expect(deals.find((d) => d.id === 'ahead')?.days_until_deletion).toBeUndefined();
  });
});
