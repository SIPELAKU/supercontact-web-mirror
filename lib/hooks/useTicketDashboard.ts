// lib/hooks/useTicketDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    fetchTicketDashboardSummary,
    fetchTicketSlaCompliance,
    fetchTicketVolume,
    fetchTicketResolutionTrend,
    TicketDashboardParams,
} from "@/lib/api/ticket-dashboard";

export function useTicketDashboardSummary(params: TicketDashboardParams) {
    return useQuery({
        queryKey: ["ticket-dashboard-summary", params],
        queryFn: () => fetchTicketDashboardSummary(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useTicketSlaCompliance(params: TicketDashboardParams) {
    return useQuery({
        queryKey: ["ticket-dashboard-sla-compliance", params],
        queryFn: () => fetchTicketSlaCompliance(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useTicketVolume(params: TicketDashboardParams) {
    return useQuery({
        queryKey: ["ticket-dashboard-volume", params],
        queryFn: () => fetchTicketVolume(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useTicketResolutionTrend(params: TicketDashboardParams) {
    return useQuery({
        queryKey: ["ticket-dashboard-resolution-trend", params],
        queryFn: () => fetchTicketResolutionTrend(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}
