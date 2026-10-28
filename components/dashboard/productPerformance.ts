import { addDays, format, startOfMonth, subMonths } from "date-fns";
import type { DashboardDateParams, ProductItem, ProductPerformanceData } from "@/lib/api/sales-dashboard";

// The Product Performance card: how many units of each product were sold in
// Won deals (`quantity_sold`), over a range the user picks. The card charts
// the top few; its Detail modal lists them all, a page at a time.

/** Products charted on the card; the rest are in the Detail modal. */
export const PRODUCT_CHART_TOP = 4;

export type ProductRange = "all" | "this_month" | "last_3_months" | "last_6_months" | "last_1_year" | "custom";

export const PRODUCT_RANGE_OPTIONS: { value: ProductRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "this_month", label: "This month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "last_6_months", label: "Last 6 months" },
  { value: "last_1_year", label: "Last 1 year" },
  { value: "custom", label: "Custom range" },
];

export const DEFAULT_PRODUCT_RANGE: ProductRange = "this_month";

const MONTHS_BACK: Partial<Record<ProductRange, number>> = {
  last_3_months: 3,
  last_6_months: 6,
  last_1_year: 12,
};

const day = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * The dates the API filters by (the day a deal was won), worked out here as
 * the BE asked. All time sends none. "Last N months" ends today and spans
 * exactly N months. null = a custom range not picked in full yet (don't load).
 */
export function productRangeParams(
  range: ProductRange,
  custom: [Date | null, Date | null],
  now: Date = new Date()
): DashboardDateParams | null {
  if (range === "all") return {};
  if (range === "custom") {
    const [from, to] = custom;
    return from && to ? { date_from: day(from), date_to: day(to) } : null;
  }
  const months = MONTHS_BACK[range];
  const from = months ? addDays(subMonths(now, months), 1) : startOfMonth(now);
  return { date_from: day(from), date_to: day(now) };
}

export interface ProductChartRow {
  name: string;
  fullName: string;
  quantity: number;
  deals: number;
}

const NAME_MAX = 18;

/**
 * The bars: the most sold products first (the API orders by value, not by
 * units), only those with units sold, at most `limit`.
 */
export function productChartRows(items: ProductItem[], limit = PRODUCT_CHART_TOP): ProductChartRow[] {
  return items
    .map((p) => ({ ...p, quantity: Number(p.quantity_sold) || 0 }))
    .filter((p) => p.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((p) => ({
      name: p.product_name.length > NAME_MAX ? p.product_name.slice(0, NAME_MAX) + "…" : p.product_name,
      fullName: p.product_name,
      quantity: p.quantity,
      deals: p.total_deals ?? 0,
    }));
}

/**
 * Rows the Detail table pages through. The API is adding pagination in the
 * usual shape (`page`, `limit` -> `total`); until it sends `total`, the page
 * it returned is all there is (one page).
 */
export function productTableTotal(data: ProductPerformanceData | undefined): number {
  return data?.total ?? data?.items?.length ?? 0;
}
