// lib/hooks/useSupportAnalytics.ts
// Phase 10 Increment A - cloned from lib/hooks/useTicketDashboard.ts:
// 60s staleTime, keyed by params, no refetch-on-focus.
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    fetchConversationsSummary,
    fetchConversationsVolumeTrend,
    fetchConversationsSla,
    fetchAgentsPerformance,
    fetchCsatSummary,
    fetchDeflectionsSummary,
    SupportAnalyticsParams,
} from "@/lib/api/support-analytics";

export function useConversationsSummary(params: SupportAnalyticsParams) {
    return useQuery({
        queryKey: ["support-analytics-conversations-summary", params],
        queryFn: () => fetchConversationsSummary(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useConversationsVolumeTrend(params: SupportAnalyticsParams) {
    return useQuery({
        queryKey: ["support-analytics-conversations-volume-trend", params],
        queryFn: () => fetchConversationsVolumeTrend(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useConversationsSla(params: SupportAnalyticsParams) {
    return useQuery({
        queryKey: ["support-analytics-conversations-sla", params],
        queryFn: () => fetchConversationsSla(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useAgentsPerformance(params: SupportAnalyticsParams) {
    return useQuery({
        queryKey: ["support-analytics-agents-performance", params],
        queryFn: () => fetchAgentsPerformance(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useCsatSummary(params: SupportAnalyticsParams) {
    return useQuery({
        queryKey: ["support-analytics-csat-summary", params],
        queryFn: () => fetchCsatSummary(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useDeflectionsSummary(params: SupportAnalyticsParams) {
    return useQuery({
        queryKey: ["support-analytics-deflections-summary", params],
        queryFn: () => fetchDeflectionsSummary(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}
