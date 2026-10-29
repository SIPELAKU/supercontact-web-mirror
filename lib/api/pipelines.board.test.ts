import { beforeEach, describe, expect, it, vi } from 'vitest';

// The kanban loads from `GET /pipelines/board` (every column at once) and
// `GET /pipelines/board/column` ("Load more"). FastAPI reads a list as the key
// repeated, and each cursor only works with the filters it was made for.

const get = vi.hoisted(() => vi.fn());
vi.mock('@/lib/utils/axiosClient', () => ({ default: { get } }));

import { fetchPipelineBoard, fetchPipelineBoardColumn, isStaleCursorError, toBoardQuery } from './pipelines';

const sent = (call = 0) => ({
  path: get.mock.calls[call][0] as string,
  query: (get.mock.calls[call][1].params as URLSearchParams).toString(),
});

const filters = {
  search: 'Budi',
  assigned_to: ['u1', 'u2'],
  date_from: '2026-10-01T00:00:00+07:00',
  date_to: '2026-10-31T23:59:59+07:00',
};

describe('toBoardQuery', () => {
  it('repeats the key for each list value, as FastAPI expects', () => {
    const query = toBoardQuery({ assigned_to: ['u1', 'u2'] }).toString();

    expect(query).toBe('assigned_to=u1&assigned_to=u2');
    expect(query).not.toContain('%5B%5D'); // not axios' `assigned_to[]=`
  });

  it('leaves out empty values', () => {
    expect(toBoardQuery({ search: '  ', assigned_to: [], date_from: undefined, date_to: null, per_stage: 20 }).toString())
      .toBe('per_stage=20');
  });
});

describe('fetchPipelineBoard', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { success: true, data: { stats: {}, stages: [{ name: 'Prospect' }] } } });
  });

  it('loads the whole board in one request, with every filter', async () => {
    const board = await fetchPipelineBoard(filters);

    expect(get).toHaveBeenCalledTimes(1);
    expect(sent().path).toBe('/pipelines/board');
    expect(sent().query).toBe(
      'search=Budi&assigned_to=u1&assigned_to=u2' +
      '&date_from=2026-10-01T00%3A00%3A00%2B07%3A00&date_to=2026-10-31T23%3A59%3A59%2B07%3A00&per_stage=5'
    );
    expect(board.stages).toEqual([{ name: 'Prospect' }]);
  });

  it('asks for no stage, so every column comes back (the stage filter is in the browser)', async () => {
    await fetchPipelineBoard({});

    expect(sent().query).toBe('per_stage=5');
  });
});

describe('fetchPipelineBoardColumn', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { success: true, data: { deals: [{ id: 'd21' }], next_cursor: null } } });
  });

  it("loads one column's next deals with the board's filters and that column's cursor", async () => {
    const page = await fetchPipelineBoardColumn(filters, 'Closed - Won', 'abc==');

    expect(sent().path).toBe('/pipelines/board/column');
    const query = new URLSearchParams(sent().query);
    expect(query.get('deal_stage')).toBe('Closed - Won');
    expect(query.get('cursor')).toBe('abc==');
    expect(query.get('limit')).toBe('5');
    expect(query.getAll('assigned_to')).toEqual(['u1', 'u2']);
    expect(query.get('search')).toBe('Budi');
    expect(query.get('date_from')).toBe(filters.date_from);
    expect(query.get('date_to')).toBe(filters.date_to);
    expect(page).toEqual({ deals: [{ id: 'd21' }], next_cursor: null });
  });
});

describe('isStaleCursorError', () => {
  const apiError = (status: number, field?: string) => ({
    response: { status, data: { success: false, error: { code: 'VALIDATION_ERROR', details: field ? { field } : null } } },
  });

  it('is a 400 on the cursor', () => {
    expect(isStaleCursorError(apiError(400, 'cursor'))).toBe(true);
  });

  it('is not any other error', () => {
    expect(isStaleCursorError(apiError(400, 'date_from'))).toBe(false);
    expect(isStaleCursorError(apiError(400))).toBe(false);
    expect(isStaleCursorError(apiError(500, 'cursor'))).toBe(false);
    expect(isStaleCursorError(new Error('Network Error'))).toBe(false);
    expect(isStaleCursorError(undefined)).toBe(false);
  });
});
