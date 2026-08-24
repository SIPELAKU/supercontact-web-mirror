"use client";

import { useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Inbox, Percent, Send, Star } from "lucide-react";
import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import { ChartCard, PRIMARY_COLOR } from "@/components/support/tickets/dashboard/TicketDashboardClient";
import { useCsatSummary } from "@/lib/hooks/useSupportAnalytics";
import { SupportAnalyticsParams } from "@/lib/api/support-analytics";
import { ChartEmptyState, DASH } from "./shared";

export function CsatTab({ params }: { params: SupportAnalyticsParams }) {
    const { data, isLoading } = useCsatSummary(params);
    const summary = data?.data;

    // Always render the full 1..5 scale so a period with, say, only 4s and
    // 5s still shows the empty low buckets.
    const histogram = useMemo(() => {
        const byRating = new Map((summary?.histogram ?? []).map((h) => [h.rating, h.count]));
        return [1, 2, 3, 4, 5].map((rating) => ({
            rating: `${rating}★`,
            count: byRating.get(rating) ?? 0,
        }));
    }, [summary]);

    const hasResponses = (summary?.answered ?? 0) > 0 || (summary?.histogram ?? []).some((h) => h.count > 0);
    const trend = summary?.trend ?? [];

    const statCards: UserStatType[] = [
        {
            title: "Surveys Sent",
            stats: summary?.sent ?? 0,
            avatarIcon: Send,
            avatarColor: "#5479EE",
            avatarBgColor: "#EEF2FD",
            trend: "positive",
            trendNumber: "-",
            subtitle: "in selected period",
            isLoading,
        },
        {
            title: "Responses",
            stats: summary?.answered ?? 0,
            avatarIcon: Inbox,
            avatarColor: "#0891b2",
            avatarBgColor: "#E0F7FA",
            trend: "positive",
            trendNumber: "-",
            subtitle: "surveys answered",
            isLoading,
        },
        {
            title: "Response Rate",
            stats: `${(summary?.response_rate_pct ?? 0).toFixed(1)}%`,
            avatarIcon: Percent,
            avatarColor: "#ea580c",
            avatarBgColor: "#FFF1E6",
            trend: "positive",
            trendNumber: "-",
            subtitle: "answered / sent",
            isLoading,
        },
        {
            title: "Avg Rating",
            stats:
                summary?.avg_rating === null || summary?.avg_rating === undefined
                    ? DASH
                    : `${summary.avg_rating.toFixed(1)} / 5`,
            avatarIcon: Star,
            avatarColor: "#eab308",
            avatarBgColor: "#FEF9C3",
            trend: "positive",
            trendNumber: "-",
            subtitle: "across responses",
            isLoading,
        },
    ];

    return (
        <div className="space-y-6">
            <Grid container spacing={3}>
                {statCards.map((card, i) => (
                    <Grid item xs={12} sm={6} lg={3} key={i}>
                        <CardStatistik {...card} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Rating Distribution">
                        {!hasResponses ? (
                            <ChartEmptyState />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={histogram}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" name="Responses" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </Grid>

                {/* Responses and avg rating live on different scales, so they
                    get two stacked mini charts sharing the same date axis
                    instead of a dual-axis overlay. */}
                <Grid item xs={12} md={6}>
                    <ChartCard title="CSAT Trend">
                        {trend.length === 0 ? (
                            <ChartEmptyState />
                        ) : (
                            <div className="flex flex-col gap-1">
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Responses per day
                                </Typography>
                                <ResponsiveContainer width="100%" height={105}>
                                    <LineChart data={trend} syncId="csat-trend">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" hide />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                                        <RechartsTooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="answered"
                                            name="Responses"
                                            stroke={PRIMARY_COLOR}
                                            strokeWidth={2}
                                            dot={{ r: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
                                    Average rating
                                </Typography>
                                <ResponsiveContainer width="100%" height={120}>
                                    <LineChart data={trend} syncId="csat-trend">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} width={32} />
                                        <RechartsTooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="avg_rating"
                                            name="Avg rating"
                                            stroke="#a16207"
                                            strokeWidth={2}
                                            dot={{ r: 2 }}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ChartCard>
                </Grid>
            </Grid>
        </div>
    );
}
