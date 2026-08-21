"use client";

import { Box, Grid, Typography } from "@mui/material";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Archive, Bot, CheckCircle2, Clock, MessageSquare, TimerReset } from "lucide-react";
import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import { ChartCard, PRIMARY_COLOR } from "@/components/support/tickets/dashboard/TicketDashboardClient";
import {
    useConversationsSummary,
    useConversationsVolumeTrend,
    useConversationsSla,
    useDeflectionsSummary,
} from "@/lib/hooks/useSupportAnalytics";
import { SupportAnalyticsParams } from "@/lib/api/support-analytics";
import { ChartEmptyState, DASH, formatMinutes } from "./shared";

const SOLVED_COLOR = "#16a34a"; // app's existing success green (CVD-checked against #5479EE)

function prettyChannel(raw: string): string {
    // Acronym channels stay fully uppercase ("sms" -> "SMS", not "Sms").
    if (raw.toLowerCase() === "sms") return "SMS";
    return raw
        .split(/[_\s-]+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

function slaColor(pct: number): string {
    return pct >= 90 ? "#16a34a" : pct >= 70 ? "#ea580c" : "#dc2626";
}

export function ConversationsTab({ params }: { params: SupportAnalyticsParams }) {
    const { data: summaryData, isLoading: isSummaryLoading } = useConversationsSummary(params);
    const { data: trendData } = useConversationsVolumeTrend(params);
    const { data: slaData } = useConversationsSla(params);
    const { data: deflectionsData } = useDeflectionsSummary(params);

    const summary = summaryData?.data;
    const points = trendData?.data?.points ?? [];
    const sla = slaData?.data;
    const deflections = deflectionsData?.data;

    const byChannel = (summary?.by_channel ?? []).map((c) => ({
        ...c,
        label: prettyChannel(c.channel_type),
    }));

    const avgFrt = formatMinutes(summary?.avg_first_response_minutes);

    const statCards: UserStatType[] = [
        {
            title: "Conversations",
            stats: summary?.total ?? 0,
            avatarIcon: MessageSquare,
            avatarColor: "#5479EE",
            avatarBgColor: "#EEF2FD",
            trend: "positive",
            trendNumber: "-",
            subtitle: "in selected period",
            isLoading: isSummaryLoading,
        },
        {
            title: "Open",
            stats: summary?.open ?? 0,
            avatarIcon: TimerReset,
            avatarColor: "#ea580c",
            avatarBgColor: "#FFF1E6",
            trend: "positive",
            trendNumber: "-",
            subtitle: "awaiting resolution",
            isLoading: isSummaryLoading,
        },
        {
            title: "Solved",
            stats: summary?.solved ?? 0,
            avatarIcon: CheckCircle2,
            avatarColor: "#16a34a",
            avatarBgColor: "#EAF7ED",
            trend: "positive",
            trendNumber: "-",
            subtitle: "in selected period",
            isLoading: isSummaryLoading,
        },
        {
            title: "Closed",
            stats: summary?.closed ?? 0,
            avatarIcon: Archive,
            avatarColor: "#64748b",
            avatarBgColor: "#F1F5F9",
            trend: "positive",
            trendNumber: "-",
            subtitle: "in selected period",
            isLoading: isSummaryLoading,
        },
        {
            title: "Avg First Response",
            stats: avgFrt ?? DASH,
            avatarIcon: Clock,
            avatarColor: "#0891b2",
            avatarBgColor: "#E0F7FA",
            trend: "positive",
            trendNumber: "-",
            subtitle: "across sampled convos",
            isLoading: isSummaryLoading,
        },
    ];

    const compliancePct = sla?.compliance_pct ?? null;

    return (
        <div className="space-y-6">
            <Grid container spacing={3}>
                {statCards.map((card, i) => (
                    <Grid item xs={12} sm={6} lg={2.4} key={i}>
                        <CardStatistik {...card} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Conversation Volume Trend">
                        {points.length === 0 ? (
                            <ChartEmptyState />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={points}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        name="Total"
                                        stroke={PRIMARY_COLOR}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="solved"
                                        name="Solved"
                                        stroke={SOLVED_COLOR}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="Volume by Channel">
                        {byChannel.length === 0 ? (
                            <ChartEmptyState />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={byChannel}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" name="Conversations" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="Conversation SLA">
                        <Box className="flex flex-col gap-4 py-2">
                            <div className="flex items-baseline gap-2">
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: compliancePct === null ? "text.disabled" : slaColor(compliancePct),
                                    }}
                                >
                                    {compliancePct === null ? DASH : `${compliancePct.toFixed(1)}%`}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    compliance
                                </Typography>
                            </div>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">First-response breaches</span>
                                    <span className="font-medium text-gray-800">{sla?.first_response_breaches ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Resolution breaches</span>
                                    <span className="font-medium text-gray-800">{sla?.resolution_breaches ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Conversations sampled</span>
                                    <span className="font-medium text-gray-800">{sla?.sampled_conversations ?? 0}</span>
                                </div>
                            </div>
                            {sla?.note && (
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {sla.note}
                                </Typography>
                            )}
                        </Box>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="Answer Bot Deflections">
                        <Box className="flex flex-col gap-4 py-2">
                            <div className="flex items-baseline gap-2">
                                <Bot size={22} className="text-gray-400 self-center" />
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    {(deflections?.deflection_rate_pct ?? 0).toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    deflection rate
                                </Typography>
                            </div>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PRIMARY_COLOR }} />
                                        Suggested
                                    </span>
                                    <span className="font-medium text-gray-800">{deflections?.suggested ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SOLVED_COLOR }} />
                                        Deflected
                                    </span>
                                    <span className="font-medium text-gray-800">{deflections?.deflected ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#ea580c" }} />
                                        Escalated
                                    </span>
                                    <span className="font-medium text-gray-800">{deflections?.escalated ?? 0}</span>
                                </div>
                            </div>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {deflections?.total ?? 0} bot interactions · {deflections?.used_llm_count ?? 0} used the LLM
                            </Typography>
                        </Box>
                    </ChartCard>
                </Grid>
            </Grid>
        </div>
    );
}
