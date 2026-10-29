import { beforeEach, describe, expect, it, vi } from 'vitest';

// The kanban loads from `GET /pipelines/board` (every column, with counts,
// totals and the stats) and pages a column with `GET /pipelines/board/column`.
// The "Assigned To" filter lists users with an active deal
// (`GET /pipelines/active-users`) and must refresh after every write that can
// change that list - not only when the page first loads.

const api = vi.hoisted(() => ({
  createPipeline: vi.fn(),
  updatePipeline: vi.fn(),
  updatePipelineStage: vi.fn(),
  fetchPipelineBoard: vi.fn(),
  fetchPipelineBoardColumn: vi.fn(),
  fetchActiveUsers: vi.fn(),
  isStaleCursorError: vi.fn(),
}));
vi.mock('@/lib/api/pipelines', () => api);

import { useGetPipelineStore } from './index';

const stat = { value: 0, percent: 0, trend: 'up' };
const stats = { total_pipeline: stat, avg_pipeline: stat, winrate_pipeline: stat };
const store = () => useGetPipelineStore.getState();
const filterNames = () => store().listActiveUser.map((u) => u.label);

const deal = (id: string, deal_stage = 'Prospect') => ({
  id,
  deal_stage,
  amount: '1000.00',
  probability_of_close: 60,
  contact: { id: `c-${id}`, name: `Client ${id}`, company: '' },
  user: { id: 'u1', fullname: 'Sari', email: 's@x.id', avatar_initial: 'S', avatar_url: null },
});

const column = (name: string, ids: string[], extra: Record<string, unknown> = {}) => ({
  name,
  outcome: 'open',
  display_order: 1,
  count: ids.length,
  total_amount: String(ids.length * 1000),
  deals: ids.map((id) => deal(id, name)),
  next_cursor: null,
  ...extra,
});

const board = (...stages: ReturnType<typeof column>[]) => ({ stats, stages });

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
};

const lastBoardFilters = () => api.fetchPipelineBoard.mock.calls.at(-1)?.[0];
const prospect = () => store().listPipeline.find((s) => s.name === 'Prospect')!;

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  api.fetchPipelineBoard.mockResolvedValue(board());
  api.fetchActiveUsers.mockResolvedValue({ data: { users: [] } });
  api.isStaleCursorError.mockImplementation((err: { staleCursor?: boolean }) => err?.staleCursor === true);
  useGetPipelineStore.setState({
    listPipeline: [],
    listActiveUser: [],
    boardFilters: null,
    loadingMoreStages: {},
    loading: false,
    refreshing: false,
    searchFilter: '',
    salespersonFilter: 'all',
    dateRangeFilter: 'all',
    dealStatusFilter: 'all',
    scopeUserId: null,
  });
});

describe('pipeline store: Assigned To filter refresh', () => {
  beforeEach(() => {
    api.fetchActiveUsers.mockResolvedValue({ data: { users: [{ id: 'u1', fullname: 'Tim SmartSales' }] } });
  });

  it('adds the new assignee to the filter right after Add Deal - no reload needed', async () => {
    await store().fetchActiveUser();
    expect(filterNames()).toEqual(['All', 'Tim SmartSales']);

    // The deal was assigned to afif, who had no deal before.
    api.createPipeline.mockResolvedValue({ success: true });
    api.fetchActiveUsers.mockResolvedValue({
      data: { users: [{ id: 'u1', fullname: 'Tim SmartSales' }, { id: 'u2', fullname: 'afif' }] },
    });

    const result = await store().postFormPipeline({} as never);

    expect(result.success).toBe(true);
    expect(filterNames()).toEqual(['All', 'Tim SmartSales', 'Afif']);
  });

  it('refreshes the filter after Update Deal and after a stage move', async () => {
    api.updatePipeline.mockResolvedValue({ success: true });
    await store().updateFormPipeline({} as never, 'deal-1');
    expect(api.fetchActiveUsers).toHaveBeenCalledTimes(1);

    api.updatePipelineStage.mockResolvedValue({});
    await store().updateStagePipeline('deal-1', 'Qualified');
    expect(api.fetchActiveUsers).toHaveBeenCalledTimes(2);
  });

  it('does not refresh the filter when the save fails', async () => {
    api.createPipeline.mockResolvedValue({ success: false, error: 'Bad request' });

    await store().postFormPipeline({} as never);

    expect(api.fetchActiveUsers).not.toHaveBeenCalled();
  });

  it('a silent refresh never turns on the board loading', async () => {
    const seen: boolean[] = [];
    const unsubscribe = useGetPipelineStore.subscribe((s) => seen.push(s.loading));

    await store().fetchActiveUser({ isSilent: true });
    unsubscribe();

    expect(seen).not.toContain(true);
    expect(filterNames()).toEqual(['All', 'Tim SmartSales']);
  });
});

describe('pipeline store: a sales user only sees their own deals', () => {
  it('limits every load to the scoped user, whatever filter is picked', async () => {
    useGetPipelineStore.setState({ scopeUserId: 'staff-1', salespersonFilter: 'someone-else' });

    await store().fetchPipeline();
    expect(lastBoardFilters().assigned_to).toEqual(['staff-1']);

    await store().fetchPipeline({ isSilent: true });
    expect(lastBoardFilters().assigned_to).toEqual(['staff-1']);

    // After a save, the store reloads the board too.
    api.createPipeline.mockResolvedValue({ success: true });
    await store().postFormPipeline({} as never);
    expect(lastBoardFilters().assigned_to).toEqual(['staff-1']);
  });

  it('lets a manager see everyone, or filter by one user', async () => {
    await store().fetchPipeline();
    expect(lastBoardFilters().assigned_to).toBeUndefined();

    useGetPipelineStore.setState({ salespersonFilter: 'staff-1' });
    await store().fetchPipeline();
    expect(lastBoardFilters().assigned_to).toEqual(['staff-1']);
  });

  it('skips loading the Assigned To filter for a scoped user (it is hidden)', async () => {
    useGetPipelineStore.setState({ scopeUserId: 'staff-1' });

    await store().fetchActiveUser();

    expect(api.fetchActiveUsers).not.toHaveBeenCalled();
  });
});

describe('pipeline store: loading the board', () => {
  it('sends search, Assigned To and the date range in one request', async () => {
    useGetPipelineStore.setState({ searchFilter: '  Budi ', salespersonFilter: 'u1', dateRangeFilter: 'this_month' });

    await store().fetchPipeline();

    expect(api.fetchPipelineBoard).toHaveBeenCalledTimes(1);
    expect(lastBoardFilters()).toEqual({
      search: 'Budi',
      assigned_to: ['u1'],
      date_from: expect.stringMatching(/-01T00:00:00\+07:00$/),
      date_to: expect.stringMatching(/T23:59:59\+07:00$/),
    });
  });

  it('sends the Status filter as `status`, and nothing for "All"', async () => {
    useGetPipelineStore.setState({ dealStatusFilter: 'expired' });
    await store().fetchPipeline();
    expect(lastBoardFilters()).toEqual({ status: ['expired'] });

    useGetPipelineStore.setState({ dealStatusFilter: 'all' });
    await store().fetchPipeline();
    expect(lastBoardFilters()).toEqual({});
  });

  it('sends no filter at all for "All" and an empty search', async () => {
    await store().fetchPipeline();

    expect(lastBoardFilters()).toEqual({});
  });

  it("shows the API's columns with their count, total and cursor, and the stats", async () => {
    api.fetchPipelineBoard.mockResolvedValue(
      board(column('Prospect', ['p1'], { count: 134, total_amount: '5000.50', next_cursor: 'c1' }), column('Qualified', []))
    );

    await store().fetchPipeline();

    expect(store().listPipeline.map((s) => s.name)).toEqual(['Prospect', 'Qualified']);
    expect(prospect()).toMatchObject({ count: 134, value: 5000.5, nextCursor: 'c1' });
    expect(prospect().deals.map((d) => d.id)).toEqual(['p1']);
    expect(store().stats.map((m) => m.label)).toEqual(['Total Pipeline Value', 'Average Deal Size', 'Win Rate']);
  });

  it('drops an older response that arrives after a newer one', async () => {
    const slow = deferred<ReturnType<typeof board>>();
    api.fetchPipelineBoard
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValueOnce(board(column('Prospect', ['new'])));

    const first = store().fetchPipeline();
    await store().fetchPipeline({ isSilent: true });
    slow.resolve(board(column('Prospect', ['old'])));
    await first;

    expect(prospect().deals.map((d) => d.id)).toEqual(['new']);
    expect(store().loading).toBe(false);
    expect(store().refreshing).toBe(false);
  });

  it('tells whether its board is the one in the store', async () => {
    expect(await store().fetchPipeline()).toBe(true);

    api.fetchPipelineBoard.mockRejectedValueOnce(new Error('Network Error'));
    expect(await store().fetchPipeline()).toBe(false);

    const slow = deferred<ReturnType<typeof board>>();
    api.fetchPipelineBoard.mockReturnValueOnce(slow.promise);
    const older = store().fetchPipeline();
    await store().fetchPipeline({ isSilent: true });
    slow.resolve(board());
    expect(await older).toBe(false);
  });

  it('a stage move says whether the board reloaded with it, and throws when the save fails', async () => {
    api.updatePipelineStage.mockResolvedValue({});
    expect(await store().updateStagePipeline('deal-1', 'Qualified')).toBe(true);

    api.fetchPipelineBoard.mockRejectedValueOnce(new Error('Network Error'));
    expect(await store().updateStagePipeline('deal-1', 'Proposal')).toBe(false);

    api.updatePipelineStage.mockRejectedValue(new Error('400'));
    await expect(store().updateStagePipeline('deal-1', 'Closed - Won')).rejects.toThrow('400');
  });

  it('a silent reload shows "refreshing", never the skeleton', async () => {
    const seen: Array<[boolean, boolean]> = [];
    const unsubscribe = useGetPipelineStore.subscribe((s) => seen.push([s.loading, s.refreshing]));

    await store().fetchPipeline({ isSilent: true });
    unsubscribe();

    expect(seen.some(([loading]) => loading)).toBe(false);
    expect(seen.some(([, refreshing]) => refreshing)).toBe(true);
    expect(store().refreshing).toBe(false);
  });
});

describe('pipeline store: Load more on a column', () => {
  const loadBoard = async () => {
    useGetPipelineStore.setState({ searchFilter: 'Budi' });
    api.fetchPipelineBoard.mockResolvedValue(
      board(column('Prospect', ['p1', 'p2'], { count: 30, total_amount: '30000', next_cursor: 'c1' }), column('Qualified', ['q1']))
    );
    await store().fetchPipeline();
  };

  it("appends the next deals and takes the column's new cursor; count and total stay", async () => {
    await loadBoard();
    api.fetchPipelineBoardColumn.mockResolvedValue({ deals: [deal('p3'), deal('p4')], next_cursor: 'c2' });

    await store().loadMoreDeals('Prospect');

    expect(prospect().deals.map((d) => d.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(prospect()).toMatchObject({ nextCursor: 'c2', count: 30, value: 30000 });
    expect(store().listPipeline[1].deals.map((d) => d.id)).toEqual(['q1']);
    expect(store().loadingMoreStages.Prospect).toBe(false);
  });

  it("resends the board's own filters, even if a filter changed since", async () => {
    await loadBoard();
    api.fetchPipelineBoardColumn.mockResolvedValue({ deals: [], next_cursor: null });
    useGetPipelineStore.setState({ searchFilter: 'typed but not loaded yet' });

    await store().loadMoreDeals('Prospect');

    expect(api.fetchPipelineBoardColumn).toHaveBeenCalledWith({ search: 'Budi' }, 'Prospect', 'c1');
  });

  it('keeps the Status filter on Load More', async () => {
    useGetPipelineStore.setState({ dealStatusFilter: 'expired' });
    await loadBoard();
    api.fetchPipelineBoardColumn.mockResolvedValue({ deals: [], next_cursor: null });

    await store().loadMoreDeals('Prospect');

    expect(api.fetchPipelineBoardColumn).toHaveBeenCalledWith({ search: 'Budi', status: ['expired'] }, 'Prospect', 'c1');
  });

  it('never shows a card twice', async () => {
    await loadBoard();
    api.fetchPipelineBoardColumn.mockResolvedValue({ deals: [deal('p2'), deal('p3')], next_cursor: null });

    await store().loadMoreDeals('Prospect');

    expect(prospect().deals.map((d) => d.id)).toEqual(['p1', 'p2', 'p3']);
    expect(prospect().nextCursor).toBeNull();
  });

  it('does nothing for a column that is fully loaded', async () => {
    await loadBoard();

    await store().loadMoreDeals('Qualified');

    expect(api.fetchPipelineBoardColumn).not.toHaveBeenCalled();
  });

  it('reloads the board quietly when the API rejects the cursor', async () => {
    await loadBoard();
    api.fetchPipelineBoardColumn.mockRejectedValue({ staleCursor: true });
    api.fetchPipelineBoard.mockClear();

    await store().loadMoreDeals('Prospect');

    expect(api.fetchPipelineBoard).toHaveBeenCalledTimes(1);
    expect(store().loading).toBe(false);
    expect(store().loadingMoreStages.Prospect).toBeFalsy();
  });

  it('drops a page that arrives after the board was reloaded', async () => {
    await loadBoard();
    const page = deferred<{ deals: ReturnType<typeof deal>[]; next_cursor: string | null }>();
    api.fetchPipelineBoardColumn.mockReturnValue(page.promise);

    const loading = store().loadMoreDeals('Prospect');
    expect(store().loadingMoreStages.Prospect).toBe(true);
    api.fetchPipelineBoard.mockResolvedValue(board(column('Prospect', ['fresh'], { next_cursor: 'c9' })));
    await store().fetchPipeline({ isSilent: true });
    page.resolve({ deals: [deal('from-old-board')], next_cursor: 'c2' });
    await loading;

    expect(prospect().deals.map((d) => d.id)).toEqual(['fresh']);
    expect(prospect().nextCursor).toBe('c9');
  });

  it('passes any other error on, and frees the button', async () => {
    await loadBoard();
    api.fetchPipelineBoardColumn.mockRejectedValue(new Error('Network Error'));

    await expect(store().loadMoreDeals('Prospect')).rejects.toThrow('Network Error');

    expect(store().loadingMoreStages.Prospect).toBe(false);
    expect(prospect().deals.map((d) => d.id)).toEqual(['p1', 'p2']);
  });
});
