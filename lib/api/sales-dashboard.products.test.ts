import { beforeEach, describe, expect, it, vi } from 'vitest';

// Product Performance pages through `GET /sales/dashboard/products` with the
// usual `page` + `limit`, like the other paged lists.

const get = vi.hoisted(() => vi.fn());
vi.mock('@/lib/utils/axiosClient', () => ({ default: { get } }));

import { fetchProductPerformance } from './sales-dashboard';
import { productPerformanceKey } from '@/lib/hooks/useSalesDashboard';

describe('fetchProductPerformance', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { success: true, data: { items: [], total: 0, page: 2, limit: 25, total_pages: 0 } } });
  });

  it('asks for one page of the period', async () => {
    await fetchProductPerformance({ date_from: '2026-10-01', date_to: '2026-10-28', page: 2, limit: 25 });

    expect(get).toHaveBeenCalledWith('/sales/dashboard/products', {
      params: { date_from: '2026-10-01', date_to: '2026-10-28', page: 2, limit: 25 },
    });
  });

  it('sends no dates for All time', async () => {
    await fetchProductPerformance({ page: 1, limit: 10 });

    expect(get.mock.calls[0][1].params).toEqual({ page: 1, limit: 10 });
  });
});

describe('productPerformanceKey', () => {
  it('sits under "sales-dashboard", which a pipeline stage change invalidates', () => {
    expect(productPerformanceKey({}, 1, 10)[0]).toBe('sales-dashboard');
  });

  it('differs per period, page and page size', () => {
    const keys = [
      productPerformanceKey({}, 1, 10),
      productPerformanceKey({ date_from: '2026-10-01', date_to: '2026-10-28' }, 1, 10),
      productPerformanceKey({}, 2, 10),
      productPerformanceKey({}, 1, 25),
    ].map((k) => JSON.stringify(k));
    expect(new Set(keys).size).toBe(4);
  });
});
