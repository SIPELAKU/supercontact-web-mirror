"use client";

import { useState } from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Ticket, Clock, CheckCircle2, TimerReset } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppSelect } from "@/components/ui/app-select";
import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import {
    useTicketDashboardSummary,
    useTicketSlaCompliance,
    useTicketVolume,
    useTicketResolutionTrend,
} from "@/lib/hooks/useTicketDashboard";

// Matches TicketPriorityBadge.tsx's existing High/Medium/Low color
// semantics - this dimension already has an established meaning in this
// app, so it's reused rather than assigning a fresh categorical palette.
const PRIORITY_COLORS: Record<string, string> = {
    High: "#dc2626",
    Medium: "#ea580c",
    Low: "#2563eb",
};
const PRIMARY_COLOR = "#5479EE"; // matches the app's existing brand/action color

const SCOPE_OPTIONS = [
    { value: "team", label: "My Team" },
    { value: "all", label: "All Branches" },
    { value: "my", label: "My Tickets" },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Paper sx={{ p: 3, borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {title}
            </Typography>
            {children}
        </Paper>
    );
}

function ComplianceBar({ label, pct, met, total }: { label: string; pct: number; met: number; total: number }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-800">
                    {pct.toFixed(1)}% ({met}/{total})
                </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                    className="h-2 rounded-full"
                    style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: pct >= 90 ? "#16a34a" : pct >= 70 ? "#ea580c" : "#dc2626",
                    }}
                />
            </div>
        </div>
    );
}

export function TicketDashboardClient() {
    const [scope, setScope] = useState<"my" | "team" | "all">("team");
    const params = { scope };

    const { data: summaryData, isLoading: isSummaryLoading } = useTicketDashboardSummary(params);
    const { data: slaData } = useTicketSlaCompliance(params);
    const { data: volumeData } = useTicketVolume(params);
    const { data: trendData } = useTicketResolutionTrend(params);

    const summary = summaryData?.data;
    const sla = slaData?.data;
    const volume = volumeData?.data;
    const trend = trendData?.data;

    const statCards: UserStatType[] = [
        {
            title: "Total Tickets",
            stats: summary?.total_tickets ?? 0,
            avatarIcon: Ticket,
            avatarColor: "#5479EE",
            avatarBgColor: "#EEF2FD",
            trend: summary?.total_tickets_growth.trend === "down" ? "negative" : "positive",
            trendNumber: `${Math.abs(summary?.total_tickets_growth.percent ?? 0).toFixed(0)}%`,
            subtitle: "vs previous period",
            isLoading: isSummaryLoading,
        },
        {
            title: "Open Tickets",
            stats: summary?.open_tickets ?? 0,
            avatarIcon: TimerReset,
            avatarColor: "#ea580c",
            avatarBgColor: "#FFF1E6",
            trend: "positive",
            trendNumber: "-",
            subtitle: "currently unresolved",
            isLoading: isSummaryLoading,
        },
        {
            title: "Avg Resolution Time",
            stats: `${Math.round(summary?.avg_resolution_minutes ?? 0)}m`,
            avatarIcon: Clock,
            avatarColor: "#0891b2",
            avatarBgColor: "#E0F7FA",
            trend: summary?.avg_resolution_growth.trend === "up" ? "negative" : "positive",
            trendNumber: `${Math.abs(summary?.avg_resolution_growth.percent ?? 0).toFixed(0)}%`,
            subtitle: "vs previous period",
            isLoading: isSummaryLoading,
        },
        {
            title: "SLA Compliance",
            stats: `${(summary?.sla_compliance_pct ?? 0).toFixed(1)}%`,
            avatarIcon: CheckCircle2,
            avatarColor: "#16a34a",
            avatarBgColor: "#EAF7ED",
            trend: summary?.sla_compliance_growth.trend === "down" ? "negative" : "positive",
            trendNumber: `${Math.abs(summary?.sla_compliance_growth.percent ?? 0).toFixed(0)}%`,
            subtitle: "vs previous period",
            isLoading: isSummaryLoading,
        },
    ];

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Ticket Dashboard"
                breadcrumbs={[{ label: "Support" }, { label: "Dashboard" }]}
            />

            <div className="flex justify-end">
                <div className="w-48">
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={scope}
                        options={SCOPE_OPTIONS}
                        onChange={(e) => setScope(e.target.value as "my" | "team" | "all")}
                    />
                </div>
            </div>

            <Grid container spacing={3}>
                {statCards.map((card, i) => (
                    <Grid item xs={12} sm={6} lg={3} key={i}>
                        <CardStatistik {...card} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Volume by Priority">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={volume?.by_priority || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                                    {(volume?.by_priority || []).map((entry, idx) => (
                                        <Cell key={idx} fill={PRIORITY_COLORS[entry.label] || PRIMARY_COLOR} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="Volume by Category">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={volume?.by_category || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="Resolution Time Trend (weekly avg, minutes)">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={trend?.items || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="period_start" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <RechartsTooltip />
                                <Line
                                    type="monotone"
                                    dataKey="avg_resolution_minutes"
                                    stroke={PRIMARY_COLOR}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="SLA Compliance Breakdown">
                        <Box className="flex flex-col gap-5 py-2">
                            <ComplianceBar
                                label="First Response"
                                pct={sla?.first_response_compliance_pct ?? 0}
                                met={sla?.first_response_met ?? 0}
                                total={sla?.first_response_total ?? 0}
                            />
                            <ComplianceBar
                                label="Resolution"
                                pct={sla?.resolution_compliance_pct ?? 0}
                                met={sla?.resolution_met ?? 0}
                                total={sla?.resolution_total ?? 0}
                            />
                        </Box>
                    </ChartCard>
                </Grid>
            </Grid>
        </div>
    );
}
