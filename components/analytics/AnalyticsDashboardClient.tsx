"use client";

import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppSelect } from "@/components/ui/app-select";
import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import PageHeader from "@/components/ui/page-header";
import {
  exportDashboard,
  type DashboardDateParams,
} from "@/lib/api/sales-dashboard";
import {
  useAnalyticsSummary,
  useRanking,
  useRecentActivity,
  useSalesTrend,
  useTeamPerformance,
} from "@/lib/hooks/useAnalyticsDashboard";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from "@mui/material";
import {
  Activity,
  DollarSign,
  Download,
  Target,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Color palette for chart lines
const LINE_COLORS = [
  '#3b82f6', '#ec4899', '#eab308', '#10b981', '#8b5cf6',
  '#f97316', '#06b6d4', '#ef4444', '#84cc16', '#a855f7',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Loading placeholder component
function SectionLoading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
      <CircularProgress size={32} />
    </Box>
  );
}

export default function AnalyticsDashboardClient() {
  const today = new Date();

  // ── Universal Filter state ──────────────────────────────────────────────
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [quickFilter, setQuickFilter] = useState<"last30" | "thisMonth">("thisMonth");
  const [exportFormat, setExportFormat] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  // ── Team Performance independent date filter ────────────────────────────
  const [teamDateFrom, setTeamDateFrom] = useState<Date | null>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [teamDateTo, setTeamDateTo] = useState<Date | null>(() => new Date());

  // ── Compute universal date params ───────────────────────────────────────
  function getParams(): DashboardDateParams {
    if (dateFrom && dateTo) {
      return { date_from: toDateStr(dateFrom), date_to: toDateStr(dateTo) };
    }
    const now = new Date();
    if (quickFilter === "last30") {
      const from = new Date();
      from.setDate(now.getDate() - 30);
      return { date_from: toDateStr(from), date_to: toDateStr(now) };
    }
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { date_from: toDateStr(from), date_to: toDateStr(now) };
  }

  function getTeamParams() {
    if (teamDateFrom && teamDateTo) {
      return { date_from: toDateStr(teamDateFrom), date_to: toDateStr(teamDateTo) };
    }
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { date_from: toDateStr(from), date_to: toDateStr(now) };
  }

  const params = getParams();
  const dateFromStr = params.date_from;
  const dateToStr = params.date_to;

  const teamParams = getTeamParams();

  // ── API Hooks (wired to filter) ─────────────────────────────────────────
  const { data: summaryRes, isLoading: summaryLoading } = useAnalyticsSummary(dateFromStr, dateToStr);
  const { data: trendRes, isLoading: trendLoading } = useSalesTrend("weekly", dateFromStr, dateToStr);
  const { data: teamRes, isLoading: teamLoading } = useTeamPerformance(teamParams.date_from, teamParams.date_to);
  const { data: rankingRes, isLoading: rankingLoading } = useRanking(10);
  const { data: activityRes, isLoading: activityLoading } = useRecentActivity(5);

  const summary = summaryRes?.data;
  const trendItems = trendRes?.data?.items ?? [];
  const teamItems = teamRes?.data?.items ?? [];
  const rankingItems = rankingRes?.data?.items ?? [];
  const activityItems = activityRes?.data?.items ?? [];

  // ── Export handler ──────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDashboard({
        ...getParams(),
        format: (exportFormat as "csv" | "excel") || "csv",
      });
    } catch (err: any) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  // ── Date picker onChange ────────────────────────────────────────────────
  const handleDateChange = (val: any) => {
    if (Array.isArray(val)) {
      setDateFrom(val[0] || null);
      setDateTo(val[1] || null);
    } else {
      setDateFrom(null);
      setDateTo(null);
    }
  };

  // ── Derive stat cards from summary ─────────────────────────────────────
  const analyticsCardData: UserStatType[] = useMemo(() => {
    if (!summary) return [];

    const trendMap = (t: string): "positive" | "negative" =>
      t === "down" ? "negative" : "positive";

    return [
      {
        title: 'Total Sales',
        stats: formatCurrency(summary.total_sales.value),
        avatarIcon: DollarSign,
        avatarColor: '#9c27b0',
        avatarBgColor: '#f3e5f5',
        trend: trendMap(summary.total_sales.trend),
        trendNumber: `${Math.abs(summary.total_sales.percent)}%`,
        subtitle: 'vs previous period'
      },
      {
        title: 'Conversion Rate',
        stats: `${summary.conversion_rate.value}%`,
        avatarIcon: Target,
        avatarColor: '#e91e63',
        avatarBgColor: '#fce4ec',
        trend: trendMap(summary.conversion_rate.trend),
        trendNumber: `${Math.abs(summary.conversion_rate.percent)}%`,
        subtitle: 'vs previous period'
      },
      {
        title: 'Top Performer',
        stats: summary.top_performer?.fullname ?? '-',
        avatarIcon: Users,
        avatarColor: '#4caf50',
        avatarBgColor: '#e8f5e8',
        trend: 'positive' as const,
        trendNumber: '0%',
        subtitle: summary.top_performer
          ? `${formatCurrency(summary.top_performer.total_sales)} / ${summary.top_performer.deals_count} Deals`
          : 'No data'
      },
      {
        title: 'Average Deal Size',
        stats: formatCurrency(summary.avg_deal_size.value),
        avatarIcon: Activity,
        avatarColor: '#ff9800',
        avatarBgColor: '#fff3e0',
        trend: trendMap(summary.avg_deal_size.trend),
        trendNumber: `${Math.abs(summary.avg_deal_size.percent)}%`,
        subtitle: 'vs previous period'
      }
    ];
  }, [summary]);

  // ── Derive dynamic series keys from sales trend data ───────────────────
  const seriesKeys = useMemo(() => {
    if (trendItems.length === 0) return [];
    const keys = new Set<string>();
    trendItems.forEach((item) => {
      Object.keys(item).forEach((k) => {
        if (k !== "month") keys.add(k);
      });
    });
    return Array.from(keys);
  }, [trendItems]);

  // ── Derive max value for team performance bar ──────────────────────────
  const teamMaxValue = useMemo(() => {
    if (teamItems.length === 0) return 100;
    return Math.max(...teamItems.map((m) => m.value), 1);
  }, [teamItems]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        breadcrumbs={[
          { label: "Analytics" },
          { label: "Dashboard" },
        ]}
      />

      {/* ── FILTERS ────────────────────────────────────────────────── */}
      <Card sx={{ borderRadius: "16px", mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Filters
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Top Row: Date Range + Format Select */}
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              <Box sx={{ flex: 1 }}>
                <AppDatePicker
                  mode="range"
                  value={[dateFrom, dateTo]}
                  isBgWhite
                  onChange={handleDateChange}
                  placeholder="Select By Date Range"
                  label=""
                  maxDate={today}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <AppSelect
                  value={exportFormat}
                  onChange={(e: any) => setExportFormat(e.target.value as string)}
                  placeholder="Select Format"
                  isBgWhite
                  options={[
                    { label: "CSV", value: "csv" },
                    { label: "Excel", value: "excel" },
                  ]}
                  height="48px"
                />
              </Box>
            </Box>

            {/* Divider */}
            <Divider sx={{ mx: -3 }} />

            {/* Bottom Row: Export + Quick Filters */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={16} /> : <Download size={16} />}
                disabled={exporting || !exportFormat}
                onClick={handleExport}
                sx={{
                  height: "40px",
                  px: 2,
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "#D1D5DB",
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: "14px",
                  "&:hover": { borderColor: "#9CA3AF", bgcolor: "#f9fafb" },
                }}
              >
                Export
              </Button>

              <Tabs
                value={quickFilter}
                onChange={(_, val) => {
                  setQuickFilter(val);
                  setDateFrom(null);
                  setDateTo(null);
                }}
                sx={{
                  minHeight: "unset",
                  p: "3px",
                  bgcolor: "#f0f2f5",
                  borderRadius: "8px",
                  "& .MuiTabs-indicator": { display: "none" },
                }}
              >
                {[
                  { label: "Last 30 days", value: "last30" },
                  { label: "This Month", value: "thisMonth" },
                ].map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    disableRipple
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      minHeight: "32px",
                      minWidth: "auto",
                      px: 2,
                      py: "6px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#64748B",
                      "&.Mui-selected": {
                        color: "#0F172A",
                        bgcolor: "#FFF",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {summaryLoading ? (
        <SectionLoading />
      ) : (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {analyticsCardData.map((item, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <CardStatistik {...item} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sales Trend Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Sales Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data trend performance (This Week)
              </Typography>
            </Box>
          </Box>

          {/* Per-person total summary + legend */}
          {seriesKeys.length > 0 && trendItems.length > 0 && (
            <Box
              display="flex"
              gap={3}
              flexWrap="wrap"
              alignItems="center"
              sx={{
                mb: 2,
                py: 1.5,
                px: 2,
                bgcolor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
              }}
            >
              {seriesKeys.map((key, idx) => {
                const total = trendItems.reduce(
                  (sum, item) => sum + (Number(item[key]) || 0),
                  0
                );
                return (
                  <Box key={key} display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        bgcolor: LINE_COLORS[idx % LINE_COLORS.length],
                        borderRadius: '50%',
                      }}
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#374151' }}>
                      {formatCurrency(total)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {key}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {trendLoading ? (
            <SectionLoading />
          ) : trendItems.length === 0 || seriesKeys.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <Typography variant="body2" color="text.secondary">No sales trend data available</Typography>
            </Box>
          ) : (
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendItems}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#999' }}
                    tickFormatter={(val: number) =>
                      new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(val)
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  {seriesKeys.map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                      strokeWidth={3}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Team Performance Overview ──────────────────────────────── */}
      <Card sx={{ borderRadius: "16px", mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Team Performance Overview
            </Typography>
            <Box width={250}>
              <AppDatePicker
                mode="range"
                placeholder="Select date range"
                isBgWhite
                value={[teamDateFrom, teamDateTo]}
                maxDate={today}
                onChange={(val) => {
                  if (Array.isArray(val)) {
                    setTeamDateFrom(val[0]);
                    setTeamDateTo(val[1]);
                  }
                }}
              />
            </Box>
          </Box>

          {teamLoading ? (
            <SectionLoading />
          ) : teamItems.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <Typography variant="body2" color="text.secondary">No team performance data available</Typography>
            </Box>
          ) : (
            <>
              <Stack spacing={3}>
                {teamItems.map((member, index) => (
                  <Box key={index}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        {formatCurrency(member.value)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((member.value / teamMaxValue) * 100, 100)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: '#f5f5f5',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          bgcolor: '#2196f3'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>

              {/* X-axis labels */}
              <Box display="flex" justifyContent="space-between" mt={2} px={1}>
                <Typography variant="caption" color="text.secondary">Rp 0</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(teamMaxValue / 4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(teamMaxValue / 2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency((teamMaxValue * 3) / 4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(teamMaxValue)}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Performance Ranking */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Performance Ranking
          </Typography>
          {rankingLoading ? (
            <SectionLoading />
          ) : rankingItems.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <Typography variant="body2" color="text.secondary">No ranking data available</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow className="bg-[#EEF2FD]!">
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Total Sales</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Conversion Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Deals Closed</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Rank</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingItems.map((person, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {person.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {person.totalSales}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {person.conversionRate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {person.dealsClosedCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {person.rank}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Recent Activity
            </Typography>
            {/* <Button variant="text" size="small">
              View All
            </Button> */}
          </Box>
          {activityLoading ? (
            <SectionLoading />
          ) : activityItems.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <Typography variant="body2" color="text.secondary">No recent activity</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {activityItems.map((activity, index) => (
                <Paper key={index} sx={{ p: 2, bgcolor: '#fafafa' }}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        mt: 1,
                        bgcolor: activity.status === 'success' ? '#4caf50' :
                          activity.status === 'info' ? '#2196f3' : '#ff9800'
                      }}
                    />
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          {activity.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {activity.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
