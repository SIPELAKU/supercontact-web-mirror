import { describe, expect, it } from 'vitest';
import type { ProductItem } from '@/lib/api/sales-dashboard';
import {
  PRODUCT_CHART_TOP,
  PRODUCT_RANGE_OPTIONS,
  productChartRows,
  productRangeParams,
  productTableTotal,
} from './productPerformance';

// 28 Oct 2026, mid-afternoon local time.
const now = new Date(2026, 9, 28, 15, 0, 0);

describe('productRangeParams (Product Performance filter)', () => {
  it('offers All time, the presets and Custom range', () => {
    expect(PRODUCT_RANGE_OPTIONS.map((o) => o.label)).toEqual([
      'All time', 'This month', 'Last 3 months', 'Last 6 months', 'Last 1 year', 'Custom range',
    ]);
  });

  it('sends no dates for All time', () => {
    expect(productRangeParams('all', [null, null], now)).toEqual({});
  });

  it('this month runs from the 1st to today', () => {
    expect(productRangeParams('this_month', [null, null], now)).toEqual({ date_from: '2026-10-01', date_to: '2026-10-28' });
  });

  it('last 3/6 months and last 1 year end today and span exactly that long', () => {
    expect(productRangeParams('last_3_months', [null, null], now)).toEqual({ date_from: '2026-07-29', date_to: '2026-10-28' });
    expect(productRangeParams('last_6_months', [null, null], now)).toEqual({ date_from: '2026-04-29', date_to: '2026-10-28' });
    expect(productRangeParams('last_1_year', [null, null], now)).toEqual({ date_from: '2025-10-29', date_to: '2026-10-28' });
  });

  it('a custom range uses the picked days, and waits until both are picked', () => {
    const from = new Date(2026, 8, 1);
    const to = new Date(2026, 8, 15);
    expect(productRangeParams('custom', [from, to], now)).toEqual({ date_from: '2026-09-01', date_to: '2026-09-15' });
    expect(productRangeParams('custom', [from, null], now)).toBeNull();
  });
});

const item = (name: string, quantity_sold: number | undefined, total_value = 1000, total_deals = 1): ProductItem =>
  ({ product_id: name, product_name: name, quantity_sold, total_value, total_deals }) as ProductItem;

describe('productChartRows (the bars)', () => {
  it('puts the most units sold first, whatever the API order (by value)', () => {
    const rows = productChartRows([item('Mahal', 2, 9_000_000), item('Laris', 40, 400_000), item('Sedang', 10, 1_000_000)]);
    expect(rows.map((r) => [r.fullName, r.quantity])).toEqual([['Laris', 40], ['Sedang', 10], ['Mahal', 2]]);
  });

  it('leaves out products with no units sold, or no quantity from an older API', () => {
    expect(productChartRows([item('A', 0), item('B', undefined), item('C', 3)]).map((r) => r.fullName)).toEqual(['C']);
  });

  it('charts only the top 4 on the card, keeps the Won deals for the tooltip, and shortens long names', () => {
    const many = Array.from({ length: 12 }, (_, i) => item(`P${i}`, i + 1));
    expect(PRODUCT_CHART_TOP).toBe(4);
    expect(productChartRows(many).map((r) => r.quantity)).toEqual([12, 11, 10, 9]);

    const [row] = productChartRows([item('Paket Langganan Tahunan Premium', 5, 1234.6, 3)]);
    expect(row).toEqual({ name: 'Paket Langganan Ta…', fullName: 'Paket Langganan Tahunan Premium', quantity: 5, deals: 3 });
  });
});

describe('Detail table paging', () => {
  it('pages through the total the API sends', () => {
    expect(productTableTotal({ items: [item('A', 1)], total: 137, page: 1, limit: 10, total_pages: 14 })).toBe(137);
  });

  it('until the API sends a total, the page it returned is the whole list', () => {
    expect(productTableTotal({ items: [item('A', 1), item('B', 2)] })).toBe(2);
    expect(productTableTotal(undefined)).toBe(0);
  });
});
