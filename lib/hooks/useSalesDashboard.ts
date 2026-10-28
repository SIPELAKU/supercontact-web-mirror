import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductPerformance, type DashboardDateParams } from "@/lib/api/sales-dashboard";

// Under the "sales-dashboard" prefix, which a pipeline stage change already
// invalidates (usePipelineStages).
export const productPerformanceKey = (params: DashboardDateParams | null, page: number, limit: number) =>
  ["sales-dashboard", "products", params, page, limit] as const;

/**
 * One page of Product Performance for the Detail modal. Waits while `params`
 * is null (a custom range not picked in full). The previous page stays on
 * screen while the next one loads.
 */
export function useProductPerformancePage(
  params: DashboardDateParams | null,
  page: number,
  limit: number,
  enabled = true
) {
  return useQuery({
    queryKey: productPerformanceKey(params, page, limit),
    queryFn: async () => {
      const res = await fetchProductPerformance({ ...params, page, limit });
      if (!res.success) throw new Error(res.error?.message || "Failed to load products");
      return res.data;
    },
    enabled: enabled && params !== null,
    placeholderData: keepPreviousData,
  });
}
