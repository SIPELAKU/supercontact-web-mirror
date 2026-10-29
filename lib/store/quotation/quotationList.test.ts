import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('@/lib/utils/axiosClient', () => ({ default: { get: (...args: unknown[]) => get(...args) } }));

import { buildQuotationListQuery, useGetQuotationstore } from './index';

/** A request the test resolves by hand, to control which answer lands first. */
function deferred() {
  let resolve!: (value: unknown) => void;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}

const page = (name: string) => ({
  data: { data: { quotations: [{ id: name }], page: 1, total: 1, total_pages: 1 } },
});

const store = () => useGetQuotationstore.getState();

beforeEach(() => {
  get.mockReset();
  useGetQuotationstore.setState({ listQuotations: [], loading: false, error: null });
});

describe('fetchQuotations', () => {
  it('sends one request when the same page is asked for twice at once', async () => {
    const answer = deferred();
    get.mockReturnValue(answer.promise);

    const first = store().fetchQuotations({ page: 1, limit: 25, quotation_status: 'all' });
    const second = store().fetchQuotations({ page: 1, limit: 25, quotation_status: 'all' });
    answer.resolve(page('a'));
    await Promise.all([first, second]);

    expect(get).toHaveBeenCalledTimes(1);
    expect(store().listQuotations).toEqual([{ id: 'a' }]);
    expect(store().loading).toBe(false);
  });

  it('keeps the newest answer when an older request returns last', async () => {
    const older = deferred();
    const newer = deferred();
    get.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);

    const a = store().fetchQuotations({ page: 1, limit: 25, search: 'ab' });
    const b = store().fetchQuotations({ page: 1, limit: 25, search: 'abc' });
    newer.resolve(page('abc'));
    await b;
    older.resolve(page('ab'));
    await a;

    expect(get).toHaveBeenCalledTimes(2);
    expect(store().listQuotations).toEqual([{ id: 'abc' }]);
    expect(store().loading).toBe(false);
  });

  it('ignores the error of a request that a newer one replaced', async () => {
    const older = deferred();
    get.mockReturnValueOnce(older.promise.then(() => Promise.reject(new Error('boom')))).mockResolvedValueOnce(page('new'));

    const a = store().fetchQuotations({ page: 1, limit: 25, search: 'x' });
    await store().fetchQuotations({ page: 1, limit: 25, search: 'xy' });
    older.resolve(null);
    await a;

    expect(store().error).toBeNull();
    expect(store().listQuotations).toEqual([{ id: 'new' }]);
  });

  it('sends the request again when forced, even while the same one is running', async () => {
    const answer = deferred();
    get.mockReturnValueOnce(answer.promise).mockResolvedValueOnce(page('after-write'));

    const a = store().fetchQuotations({ page: 1, limit: 25 });
    await store().fetchQuotations({ page: 1, limit: 25 }, { force: true });
    answer.resolve(page('before-write'));
    await a;

    expect(get).toHaveBeenCalledTimes(2);
    expect(store().listQuotations).toEqual([{ id: 'after-write' }]);
  });

  it('asks again once the previous request has finished', async () => {
    get.mockResolvedValue(page('a'));
    await store().fetchQuotations({ page: 1, limit: 25 });
    await store().fetchQuotations({ page: 1, limit: 25 });
    expect(get).toHaveBeenCalledTimes(2);
  });
});

describe('buildQuotationListQuery', () => {
  const state = {
    pagination: { page: 3, limit: 25, total: 0, totalPages: 1 },
    dateRangeFilter: 'all',
    statusFilter: 'all',
    searchQuery: '',
  };

  it('falls back to the stored page and limit, and leaves "all" out', () => {
    expect(buildQuotationListQuery({ quotation_status: 'all' }, state)).toEqual({ page: 3, limit: 25 });
  });

  it('sends the canonical status, the date range, the sort and the search', () => {
    expect(
      buildQuotationListQuery(
        { page: 1, limit: 25, quotation_status: 'Pending', date_to: '2026-10-28', sort_by: 'created_at', search: 'QUO' },
        state
      )
    ).toEqual({
      page: 1,
      limit: 25,
      quotation_status: 'sent',
      date_to: '2026-10-28',
      sort_by: 'created_at',
      sort_order: 'asc',
      search: 'QUO',
    });
  });
});
