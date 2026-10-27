import { describe, expect, it } from 'vitest';
import type { StageUI } from '@/lib/helper/transformPipeline';
import { filterStagesBySelection } from './stageFilter';

const stage = (name: string, dealIds: string[]): StageUI => ({
  id: name,
  name,
  value: 0,
  deals: dealIds.map((id) => ({ id }) as StageUI['deals'][number]),
});

const board = () => [
  stage('Prospect', ['p1', 'p2']),
  stage('Qualified', ['q1']),
  stage('Negotiation', ['n1']),
  stage('Closed - Won', ['w1']),
];

const dealsIn = (stages: StageUI[]) => Object.fromEntries(stages.map((s) => [s.name, s.deals.map((d) => d.id)]));

describe('filterStagesBySelection (kanban stage filter, multi-select)', () => {
  it('shows every column when nothing is picked ("All")', () => {
    const stages = board();
    expect(filterStagesBySelection(stages, [])).toBe(stages);
  });

  it('keeps the deals of every picked stage and empties the rest', () => {
    expect(dealsIn(filterStagesBySelection(board(), ['Prospect', 'Negotiation']))).toEqual({
      Prospect: ['p1', 'p2'],
      Qualified: [],
      Negotiation: ['n1'],
      'Closed - Won': [],
    });
  });

  it('never removes a column, so the board keeps its layout', () => {
    expect(filterStagesBySelection(board(), ['Qualified']).map((s) => s.name)).toEqual([
      'Prospect',
      'Qualified',
      'Negotiation',
      'Closed - Won',
    ]);
  });

  it('matches stage names however the dash is spaced or cased', () => {
    expect(dealsIn(filterStagesBySelection(board(), ['closed-won']))['Closed - Won']).toEqual(['w1']);
  });
});
