// lib/api/support-analytics.ts
// Phase 10 Increment A - Support Analytics read-only endpoints.
// Cloned from lib/api/ticket-dashboard.ts (same ResponseModel `.data`
// envelope, same date_from/date_to ISO-date query params).
import api from "@/lib/utils/axiosClient";

export interface SupportAnalyticsParams {
    date_from?: string;
    date_to?: string;
}

// ---- /support-analytics/conversations/summary ----

export interface ChannelCount {
    channel_type: string;
    count: number;
}

export interface ConversationsSummary {
    total: number;
    open: number;
    solved: number;
    closed: number;
    avg_first_response_minutes: number | null;
    by_channel: ChannelCount[];
}

// ---- /support-analytics/conversations/volume-trend ----

export interface ConversationVolumePoint {
    date: string;
    total: number;
    solved: number;
}

export interface ConversationsVolumeTrend {
    points: ConversationVolumePoint[];
}

// ---- /support-analytics/conversations/sla ----

export interface ConversationsSla {
    first_response_breaches: number;
    resolution_breaches: number;
    sampled_conversations: number;
    compliance_pct: number | null;
    note: string;
}

// ---- /support-analytics/agents/performance ----

export interface AgentPerformanceItem {
    agent_id: string;
    agent_name: string;
    tickets_total: number | null;
    tickets_resolved: number | null;
    avg_resolution_minutes: number | null;
    avg_ticket_frt_minutes: number | null;
    tickets_reopened: number | null;
    conversations_total: number | null;
    conversations_closed: number | null;
    avg_conversation_frt_minutes: number | null;
    csat_count: number | null;
    csat_avg: number | null;
    qa_review_count: number | null;
    qa_avg_pct: number | null;
}

export interface AgentsPerformance {
    items: AgentPerformanceItem[];
}

// ---- /support-analytics/csat/summary ----

export interface CsatHistogramBucket {
    rating: number;
    count: number;
}

export interface CsatTrendPoint {
    date: string;
    answered: number;
    avg_rating: number | null;
}

export interface CsatSummary {
    sent: number;
    answered: number;
    response_rate_pct: number;
    avg_rating: number | null;
    histogram: CsatHistogramBucket[];
    trend: CsatTrendPoint[];
}

// ---- /support-analytics/deflections/summary ----

export interface DeflectionsSummary {
    total: number;
    suggested: number;
    deflected: number;
    escalated: number;
    deflection_rate_pct: number;
    used_llm_count: number;
}

function buildQuery(params: SupportAnalyticsParams): string {
    const query = new URLSearchParams();
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    const qs = query.toString();
    return qs ? `?${qs}` : "";
}

export async function fetchConversationsSummary(
    params: SupportAnalyticsParams
): Promise<{ data: ConversationsSummary }> {
    const res = await api.get(`/support-analytics/conversations/summary${buildQuery(params)}`);
    return res.data;
}

export async function fetchConversationsVolumeTrend(
    params: SupportAnalyticsParams
): Promise<{ data: ConversationsVolumeTrend }> {
    const res = await api.get(`/support-analytics/conversations/volume-trend${buildQuery(params)}`);
    return res.data;
}

export async function fetchConversationsSla(
    params: SupportAnalyticsParams
): Promise<{ data: ConversationsSla }> {
    const res = await api.get(`/support-analytics/conversations/sla${buildQuery(params)}`);
    return res.data;
}

export async function fetchAgentsPerformance(
    params: SupportAnalyticsParams
): Promise<{ data: AgentsPerformance }> {
    const res = await api.get(`/support-analytics/agents/performance${buildQuery(params)}`);
    return res.data;
}

export async function fetchCsatSummary(
    params: SupportAnalyticsParams
): Promise<{ data: CsatSummary }> {
    const res = await api.get(`/support-analytics/csat/summary${buildQuery(params)}`);
    return res.data;
}

export async function fetchDeflectionsSummary(
    params: SupportAnalyticsParams
): Promise<{ data: DeflectionsSummary }> {
    const res = await api.get(`/support-analytics/deflections/summary${buildQuery(params)}`);
    return res.data;
}
