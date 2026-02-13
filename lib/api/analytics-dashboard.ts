// lib/api/analytics-dashboard.ts
// Analytics Dashboard API functions

import api from "@/lib/utils/axiosClient";

// ── Types ───────────────────────────────────────────────────────────────

export interface AnalyticsDateParams {
  date_from?: string;
  date_to?: string;
}

// /summary
export interface MetricData {
  value: number;
  percent: number;
  trend: "up" | "down" | "flat";
}

export interface TopPerformerData {
  user_id: string;
  fullname: string;
  total_sales: number;
  deals_count: number;
}

export interface AnalyticsSummaryData {
  total_sales: MetricData;
  conversion_rate: MetricData;
  top_performer: TopPerformerData | null;
  avg_deal_size: MetricData;
}

// /sales-trend
export interface SalesTrendItem {
  month: string;
  [key: string]: string | number; // dynamic salesperson keys
}

export interface SalesTrendData {
  items: SalesTrendItem[];
}

// /team-performance
export interface TeamPerformanceItem {
  name: string;
  value: number;
}

export interface TeamPerformanceData {
  date_from: string;
  date_to: string;
  items: TeamPerformanceItem[];
}

// /ranking
export interface RankingItem {
  name: string;
  totalSales: string;
  conversionRate: string;
  dealsClosedCount: number;
  rank: number;
}

export interface RankingData {
  items: RankingItem[];
}

// /recent-activity
export interface ActivityItem {
  type: string;
  description: string;
  time: string;
  status: string;
}

export interface RecentActivityData {
  items: ActivityItem[];
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
 * GET /analytics/dashboard/summary
 */
export async function fetchAnalyticsSummary(params?: AnalyticsDateParams) {
  const response = await api.get<ApiResponse<AnalyticsSummaryData>>(
    "/analytics/dashboard/summary",
    { params }
  );
  return response.data;
}

/**
 * GET /analytics/dashboard/sales-trend
 */
export async function fetchSalesTrend(
  params?: AnalyticsDateParams & { period?: "daily" | "weekly" | "monthly"; limit?: number }
) {
  const response = await api.get<ApiResponse<SalesTrendData>>(
    "/analytics/dashboard/sales-trend",
    { params }
  );
  return response.data;
}

/**
 * GET /analytics/dashboard/team-performance
 */
export async function fetchTeamPerformance(
  params?: AnalyticsDateParams & { limit?: number }
) {
  const response = await api.get<ApiResponse<TeamPerformanceData>>(
    "/analytics/dashboard/team-performance",
    { params }
  );
  return response.data;
}

/**
 * GET /analytics/dashboard/ranking
 */
export async function fetchRanking(params?: { limit?: number }) {
  const response = await api.get<ApiResponse<RankingData>>(
    "/analytics/dashboard/ranking",
    { params }
  );
  return response.data;
}

/**
 * GET /analytics/dashboard/recent-activity
 */
export async function fetchRecentActivity(params?: { limit?: number }) {
  const response = await api.get<ApiResponse<RecentActivityData>>(
    "/analytics/dashboard/recent-activity",
    { params }
  );
  return response.data;
}
