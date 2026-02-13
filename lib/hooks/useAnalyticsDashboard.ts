// lib/hooks/useAnalyticsDashboard.ts
"use client";

import {
    fetchAnalyticsSummary,
    fetchRanking,
    fetchRecentActivity,
    fetchSalesTrend,
    fetchTeamPerformance,
} from "@/lib/api/analytics-dashboard";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook for GET /analytics/dashboard/summary
 */
export function useAnalyticsSummary(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["analytics-summary", dateFrom, dateTo],
    queryFn: () =>
      fetchAnalyticsSummary({
        date_from: dateFrom,
        date_to: dateTo,
      }),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for GET /analytics/dashboard/sales-trend
 */
export function useSalesTrend(
  period?: "daily" | "weekly" | "monthly",
  dateFrom?: string,
  dateTo?: string,
  limit?: number
) {
  return useQuery({
    queryKey: ["analytics-sales-trend", period, dateFrom, dateTo, limit],
    queryFn: () =>
      fetchSalesTrend({
        period,
        date_from: dateFrom,
        date_to: dateTo,
        limit,
      }),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for GET /analytics/dashboard/team-performance
 */
export function useTeamPerformance(
  dateFrom?: string,
  dateTo?: string,
  limit?: number
) {
  return useQuery({
    queryKey: ["analytics-team-performance", dateFrom, dateTo, limit],
    queryFn: () =>
      fetchTeamPerformance({
        date_from: dateFrom,
        date_to: dateTo,
        limit,
      }),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for GET /analytics/dashboard/ranking
 */
export function useRanking(limit?: number) {
  return useQuery({
    queryKey: ["analytics-ranking", limit],
    queryFn: () => fetchRanking({ limit }),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for GET /analytics/dashboard/recent-activity
 */
export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: ["analytics-recent-activity", limit],
    queryFn: () => fetchRecentActivity({ limit }),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
