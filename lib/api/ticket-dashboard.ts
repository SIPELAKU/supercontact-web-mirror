// lib/api/ticket-dashboard.ts
import api from "@/lib/utils/axiosClient";

export interface TicketDashboardParams {
    date_from?: string;
    date_to?: string;
    scope?: "my" | "team" | "all";
}

export interface GrowthData {
    percent: number;
    trend: "up" | "down" | "flat";
}

export interface TicketDashboardSummary {
    total_tickets: number;
    total_tickets_growth: GrowthData;
    open_tickets: number;
    avg_resolution_minutes: number;
    avg_resolution_growth: GrowthData;
    sla_compliance_pct: number;
    sla_compliance_growth: GrowthData;
}

export interface SlaComplianceData {
    first_response_total: number;
    first_response_met: number;
    first_response_compliance_pct: number;
    resolution_total: number;
    resolution_met: number;
    resolution_compliance_pct: number;
}

export interface VolumeItem {
    label: string;
    count: number;
}

export interface TicketVolumeData {
    by_category: VolumeItem[];
    by_priority: VolumeItem[];
}

export interface ResolutionTrendItem {
    period_start: string;
    avg_resolution_minutes: number;
    ticket_count: number;
}

export interface ResolutionTrendData {
    items: ResolutionTrendItem[];
}

function buildQuery(params: TicketDashboardParams): string {
    const query = new URLSearchParams();
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    if (params.scope) query.set("scope", params.scope);
    const qs = query.toString();
    return qs ? `?${qs}` : "";
}

export async function fetchTicketDashboardSummary(
    params: TicketDashboardParams
): Promise<{ data: TicketDashboardSummary }> {
    const res = await api.get(`/ticket-dashboard/summary${buildQuery(params)}`);
    return res.data;
}

export async function fetchTicketSlaCompliance(
    params: TicketDashboardParams
): Promise<{ data: SlaComplianceData }> {
    const res = await api.get(`/ticket-dashboard/sla-compliance${buildQuery(params)}`);
    return res.data;
}

export async function fetchTicketVolume(
    params: TicketDashboardParams
): Promise<{ data: TicketVolumeData }> {
    const res = await api.get(`/ticket-dashboard/volume${buildQuery(params)}`);
    return res.data;
}

export async function fetchTicketResolutionTrend(
    params: TicketDashboardParams
): Promise<{ data: ResolutionTrendData }> {
    const res = await api.get(`/ticket-dashboard/resolution-trend${buildQuery(params)}`);
    return res.data;
}
