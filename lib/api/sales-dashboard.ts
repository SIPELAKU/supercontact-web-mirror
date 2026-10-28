import api from "@/lib/utils/axiosClient";

// ── Types ───────────────────────────────────────────────────────────────

export interface DashboardDateParams {
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
}

// /summary
export interface GrowthInfo {
  percent: number;
  trend: "up" | "down" | "flat";
}

export interface DashboardSummary {
  total_sales_value: number;
  total_sales_growth: GrowthInfo;
  top_deals_count: number;
  top_deals_growth: GrowthInfo;
  average_deal_size: number;
  average_deal_growth: GrowthInfo;
}

// /funnel
export interface FunnelPeriodData {
  prospect: number;
  qualified: number;
  negotiation: number;
  proposal: number;
  closed_won: number;
  closed_lost: number;
  period_start: string;
}

// Aggregated funnel (single period or summed)
export interface FunnelData {
  prospect: number;
  qualified: number;
  negotiation: number;
  proposal: number;
  closed_won: number;
  closed_lost: number;
}

// /products
export interface ProductItem {
  product_id: string;
  product_name: string;
  /** Units sold in Won deals. New in BE 1.149.0 (DEV); missing on older APIs. */
  quantity_sold: number;
  /** Price x quantity. The API orders the items by this. */
  total_value: number;
  /** Won deals with this product. */
  total_deals: number;
}

export interface ProductPerformanceData {
  items: ProductItem[];
  /**
   * Pagination, being added by the BE in the same shape as the other lists
   * (`page`, `limit` in; these out). Absent until then.
   */
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

// /top-deals
export interface TopDealItem {
  date: string;
  salesperson: string;
  customer: string;
  deal_value: number;
  status: string;
}

export interface TopDealsData {
  items: TopDealItem[];
}

// Generic API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
}

// ── API Functions ───────────────────────────────────────────────────────

/**
 * GET /sales/dashboard/summary
 */
export async function fetchDashboardSummary(params?: DashboardDateParams & { top_deals_limit?: number }) {
  const response = await api.get<ApiResponse<DashboardSummary>>("/sales/dashboard/summary", { params });
  return response.data;
}

/**
 * GET /sales/dashboard/funnel
 */
export async function fetchSalesFunnel(params?: DashboardDateParams & { group_by?: "daily" | "weekly" | "monthly" }) {
  const response = await api.get<ApiResponse<FunnelPeriodData[]>>("/sales/dashboard/funnel", { params });
  return response.data;
}

/**
 * GET /sales/dashboard/products. `page` (1-based) + `limit` = one page of the
 * list, like the other paged endpoints.
 */
export async function fetchProductPerformance(params?: DashboardDateParams & { limit?: number; page?: number }) {
  const response = await api.get<ApiResponse<ProductPerformanceData>>("/sales/dashboard/products", { params });
  return response.data;
}

/**
 * GET /sales/dashboard/top-deals
 */
export async function fetchTopDeals(params?: DashboardDateParams & { limit?: number }) {
  const response = await api.get<ApiResponse<TopDealsData>>("/sales/dashboard/top-deals", { params });
  return response.data;
}

/**
 * GET /sales/dashboard/export — downloads CSV or Excel
 */
// ─── Export Function ────────────────────────────────────────────────────

/**
 * GET /sales/dashboard/export
 * Handles CSV (direct download) and Excel (client-side conversion from CSV)
 */

export async function exportDashboard(
  params?: DashboardDateParams & { format?: "csv" | "excel" }
): Promise<void> {
  const format = params?.format || "csv";
  
  // Always fetch raw CSV text first
  const response = await api.get("/sales/dashboard/export", {
    params: { ...params, format: "csv" }, // Force backend to give CSV
    responseType: "text",
  });

  if (format === "excel") {
    // Client-side conversion: CSV -> Excel
    const csvData = response.data;
    // Loaded on demand - only the Excel branch of this export needs SheetJS.
    const XLSX = await import("xlsx");
    const wb = XLSX.read(csvData, { type: "string" });
    XLSX.writeFile(wb, "sales_dashboard.xlsx");
    return;
  }

  // Default CSV handling
  // Extract filename or use default
  const contentDisposition = response.headers["content-disposition"] as string | undefined;
  let filename = "sales_dashboard.csv";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) filename = match[1];
  }

  // Create blob and download
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
