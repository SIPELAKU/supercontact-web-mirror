"use client";

import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppSelect } from "@/components/ui/app-select";
import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import {
  exportDashboard,
  fetchDashboardSummary,
  fetchProductPerformance,
  fetchSalesFunnel,
  fetchTopDeals,
  type DashboardDateParams,
  type DashboardSummary,
  type FunnelPeriodData,
  type ProductItem,
  type TopDealItem
} from "@/lib/api/sales-dashboard";
import { formatRupiah } from "@/lib/helper/currency";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Tooltip as MuiTooltip,
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
import { Download, UserRoundCheck, UserRoundSearch, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

// ── Helpers ─────────────────────────────────────────────────────────────

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusStyle(status: string): { color: string; bg: string } {
  const s = status.toLowerCase();
  if (s.includes("won")) return { color: "#16a34a", bg: "#dcfce7" };
  if (s.includes("lost")) return { color: "#dc2626", bg: "#fee2e2" };
  if (s.includes("pending") || s.includes("negotiation") || s.includes("proposal"))
    return { color: "#ea580c", bg: "#fff7ed" };
  return { color: "#6b7280", bg: "#f3f4f6" };
}

// ── Component ───────────────────────────────────────────────────────────

export default function DashboardClient() {
  // ─── Filter state ─────────────────────────────────────────────────
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [quickFilter, setQuickFilter] = useState<"last30" | "thisMonth">("thisMonth");
  const [exportFormat, setExportFormat] = useState<string>("");

  // ─── Data state ───────────────────────────────────────────────────
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [funnelPeriods, setFunnelPeriods] = useState<FunnelPeriodData[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [topDeals, setTopDeals] = useState<TopDealItem[]>([]);

  // ─── UI state ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  // Funnel independent filter
  const [funnelView, setFunnelView] = useState<"weekly" | "monthly">("weekly");
  const [funnelLoading, setFunnelLoading] = useState(true);
  // Product independent filter (default: This Month)
  const [productDateFrom, setProductDateFrom] = useState<Date | null>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [productDateTo, setProductDateTo] = useState<Date | null>(() => new Date());
  const [productsLoading, setProductsLoading] = useState(true);


  // Avoid fetch on mount running twice in StrictMode
  const mountFetched = useRef(false);

  // ─── Compute params ───────────────────────────────────────────────
  function getParams(): DashboardDateParams {
    // Custom date range takes priority
    if (dateFrom && dateTo) {
      return { date_from: toDateStr(dateFrom), date_to: toDateStr(dateTo) };
    }
    // Quick filter fallback
    const now = new Date();
    if (quickFilter === "last30") {
      const from = new Date();
      from.setDate(now.getDate() - 30);
      return { date_from: toDateStr(from), date_to: toDateStr(now) };
    }
    // thisMonth
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { date_from: toDateStr(from), date_to: toDateStr(now) };
  }

  function getProductParams(): DashboardDateParams {
    if (productDateFrom && productDateTo) {
      return { date_from: toDateStr(productDateFrom), date_to: toDateStr(productDateTo) };
    }
    // Default fallback (e.g. This Month)
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { date_from: toDateStr(from), date_to: toDateStr(now) };
  }

  // ─── Fetch ────────────────────────────────────────────────────────
  async function fetchAll() {
    setLoading(true);
    setProductsLoading(true);
    setFunnelLoading(true);
    setError(null);
    try {
      // Parallel fetch
      const params = getParams();
      console.log("[Dashboard] fetching with params:", params);

      const [summaryRes, funnelRes, productsRes, topDealsRes] = await Promise.all([
        fetchDashboardSummary(params),
        fetchSalesFunnel({ ...params, group_by: funnelView }),
        fetchProductPerformance({ ...getProductParams(), limit: 50 }),
        fetchTopDeals({ ...params, limit: 5 }),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (funnelRes.success) setFunnelPeriods(funnelRes.data);
      if (productsRes.success) setProducts(productsRes.data.items);
      if (topDealsRes.success) setTopDeals(topDealsRes.data.items);

      // Handle errors if any
      const errs = [summaryRes, funnelRes, productsRes, topDealsRes]
        .filter((r) => !r.success)
        .map((r) => r.error?.message || "Unknown error");

      if (errs.length > 0) {
        console.warn("Some dashboard parts failed:", errs);
        if (!summaryRes.success) setError(errs[0]);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.response?.data?.error?.message ||
        err?.message ||
        "Gagal memuat data dashboard"
      );
    } finally {
      setLoading(false);
      setProductsLoading(false);
      setFunnelLoading(false);
    }
  }

  async function fetchProductsOnly() {
    setProductsLoading(true);
    try {
      const res = await fetchProductPerformance({ ...getProductParams(), limit: 50 });
      if (res.success) setProducts(res.data.items);
    } catch (err) {
      console.error("Product fetch error:", err);
    } finally {
      setProductsLoading(false);
    }
  }

  async function fetchFunnelOnly() {
    setFunnelLoading(true);
    try {
      const res = await fetchSalesFunnel({ ...getParams(), group_by: funnelView });
      if (res.success) setFunnelPeriods(res.data);
    } catch (err) {
      console.error("Funnel fetch error:", err);
    } finally {
      setFunnelLoading(false);
    }
  }

  // Fetch on mount
  useEffect(() => {
    if (!mountFetched.current) {
      mountFetched.current = true;
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when quick filter changes (ignore initial)
  const quickFilterInit = useRef(true);
  useEffect(() => {
    if (quickFilterInit.current) {
      quickFilterInit.current = false;
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickFilter]);

  // Re-fetch when date range is complete (both from & to set)
  const dateRangeInit = useRef(true);
  useEffect(() => {
    if (dateRangeInit.current) {
      dateRangeInit.current = false;
      return;
    }
    // Only fetch when both dates are selected
    if (dateFrom && dateTo) {
      fetchAll();
    }
    // Also fetch when cleared (falls back to quick filter)
    if (!dateFrom && !dateTo && !dateRangeInit.current) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, quickFilter]);

  // Re-fetch products when date changes
  const productDateInit = useRef(true);
  useEffect(() => {
    if (productDateInit.current) {
      productDateInit.current = false;
      return;
    }
    fetchProductsOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDateFrom, productDateTo]);

  // Re-fetch funnel when view changes
  const funnelViewInit = useRef(true);
  useEffect(() => {
    if (funnelViewInit.current) {
      funnelViewInit.current = false;
      return;
    }
    fetchFunnelOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelView]);

  // ─── Export handler ───────────────────────────────────────────────
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

  // ─── Date picker onChange ─────────────────────────────────────────
  const handleDateChange = (val: any) => {
    if (Array.isArray(val)) {
      setDateFrom(val[0] || null);
      setDateTo(val[1] || null);
    } else {
      setDateFrom(null);
      setDateTo(null);
    }
  };

  // ─── Chart data ───────────────────────────────────────────────────
  // Aggregate funnel periods by summing all the periods
  const funnelChartData = funnelPeriods.length > 0
    ? (() => {
      const agg = funnelPeriods.reduce(
        (acc, p) => ({
          prospect: acc.prospect + p.prospect,
          qualified: acc.qualified + p.qualified,
          negotiation: acc.negotiation + p.negotiation,
          proposal: acc.proposal + p.proposal,
          closed_won: acc.closed_won + p.closed_won,
          closed_lost: acc.closed_lost + p.closed_lost,
        }),
        { prospect: 0, qualified: 0, negotiation: 0, proposal: 0, closed_won: 0, closed_lost: 0 }
      );
      return [
        { stage: "Prospect", count: agg.prospect },
        { stage: "Qualified", count: agg.qualified },
        { stage: "Negotiation", count: agg.negotiation },
        { stage: "Proposal", count: agg.proposal },
        { stage: "Closed - Won", count: agg.closed_won },
        { stage: "Closed - Lost", count: agg.closed_lost },
      ];
    })()
    : [];

  const productChartData = products
    .filter((p) => p.total_value > 0)
    .slice(0, 10)
    .map((p) => ({
      name: p.product_name.length > 18 ? p.product_name.slice(0, 18) + "…" : p.product_name,
      fullName: p.product_name,
      value: Math.round(p.total_value),
    }));

  // ─── Stat cards ───────────────────────────────────────────────────
  const statCards: UserStatType[] = summary
    ? [
      {
        title: "Total Sales Value",
        stats: (() => {
          const val = formatRupiah(summary.total_sales_value);
          return val.length > 18 ? (
            <MuiTooltip title={val}>
              <span>{val.slice(0, 18) + "..."}</span>
            </MuiTooltip>
          ) : (
            val
          );
        })(),
        avatarIcon: UsersRound,
        avatarColor: "#666cff",
        avatarBgColor: "#e6e7ff",
        trend: summary.total_sales_growth.trend === "down" ? "negative" : "positive",
        trendNumber: `${Math.abs(summary.total_sales_growth.percent).toFixed(0)}%`,
        subtitle: "vs Last period",
      },
      {
        title: "Top Deals Value",
        stats: `${summary.top_deals_count} Deals`,
        avatarIcon: UserRoundCheck,
        avatarColor: "#72e128",
        avatarBgColor: "#e8fadc",
        trend: summary.top_deals_growth.trend === "down" ? "negative" : "positive",
        trendNumber: `${Math.abs(summary.top_deals_growth.percent).toFixed(0)} Deals`,
        subtitle: "vs Last period",
      },
      {
        title: "Average Deal Size",
        stats: (() => {
          const val = formatRupiah(summary.average_deal_size);
          return val.length > 18 ? (
            <MuiTooltip title={val}>
              <span>{val.slice(0, 18) + "..."}</span>
            </MuiTooltip>
          ) : (
            val
          );
        })(),
        avatarIcon: UserRoundSearch,
        avatarColor: "#fdb528",
        avatarBgColor: "#fef3dc",
        trend: summary.average_deal_growth.trend === "down" ? "negative" : "positive",
        trendNumber: `${Math.abs(summary.average_deal_growth.percent).toFixed(0)}%`,
        subtitle: "vs Last period",
      },
    ]
    : [];

  // Period label for display
  const periodLabel =
    dateFrom && dateTo
      ? `${toDateStr(dateFrom)} - ${toDateStr(dateTo)}`
      : quickFilter === "last30"
        ? "Last 30 days"
        : "This Month";

  // ═════════════════════════════ RENDER ═════════════════════════════

  return (
    <>
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
                  maxDate={new Date()}
                // AppDatePicker height is managed via minHeight: 48px in its style
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
                  // Force height to match date picker
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

      {/* ── ERROR ──────────────────────────────────────────────────── */}
      {error && (
        <Card sx={{ mb: 3, borderRadius: "16px", border: "1px solid #fecaca", bgcolor: "#fef2f2" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography color="error" variant="body2">
              ⚠️ {error}
            </Typography>
            <Button size="small" onClick={() => fetchAll()} sx={{ mt: 1, textTransform: "none" }}>
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── STAT CARDS ─────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {loading
          ? [1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Card sx={{ borderRadius: "12px", height: 120, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <CircularProgress size={24} />
                </CardContent>
              </Card>
            </Grid>
          ))
          : statCards.map((item, i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <CardStatistik {...item} />
            </Grid>
          ))}
      </Grid>

      {/* ── SALES FUNNEL ───────────────────────────────────────────── */}
      <Card sx={{ borderRadius: "16px", mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold">Sales Funnel</Typography>
              <Typography variant="body2" color="text.secondary">
                Daily sales performance ({funnelView === "weekly" ? "Weekly" : "Monthly"})
              </Typography>
            </Box>
            <Tabs
              value={funnelView}
              onChange={(_, val) => setFunnelView(val)}
              sx={{
                minHeight: "unset",
                p: "3px",
                bgcolor: "#f0f2f5",
                borderRadius: "8px",
                "& .MuiTabs-indicator": { display: "none" },
              }}
            >
              {[
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
              ].map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  sx={{
                    minHeight: "unset",
                    py: 0.8,
                    px: 2,
                    fontSize: "13px",
                    fontWeight: 500,
                    textTransform: "none",
                    borderRadius: "6px",
                    color: "#6b7280",
                    "&.Mui-selected": {
                      color: "#111827",
                      bgcolor: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ height: 320 }}>
            {funnelLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={28} />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#666" }} angle={-20} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                  <RechartsTooltip formatter={(value: number) => [value, "Count"]} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" fill="#4fd1c5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── PRODUCT PERFORMANCE (horizontal bar) ───────────────────── */}
      <Card sx={{ borderRadius: "16px", mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">Product Performance</Typography>
            <Box width={250}>
              <AppDatePicker
                mode="range"
                placeholder="Select date range"
                isBgWhite
                value={[productDateFrom, productDateTo]}
                maxDate={new Date()}
                onChange={(val) => {
                  if (Array.isArray(val)) {
                    setProductDateFrom(val[0]);
                    setProductDateTo(val[1]);
                  }
                }}
              />
            </Box>
          </Box>

          {productsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={250}>
              <CircularProgress size={28} />
            </Box>
          ) : productChartData.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <Typography color="text.secondary">No product data available</Typography>
            </Box>
          ) : (
            <Box sx={{ height: Math.max(productChartData.length * 45, 200) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productChartData} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#999" }}
                    tickFormatter={(val: number) =>
                      new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(val)
                    }
                  />
                  <YAxis type="category" dataKey="name" width={130} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#555" }} />
                  <RechartsTooltip
                    formatter={(value: number) => [formatRupiah(value), "Value"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── TOP DEAL TABLE ─────────────────────────────────────────── */}
      <Card sx={{ borderRadius: "16px", mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box mb={2}>
            <Typography variant="h6" fontWeight="bold">Top Deal</Typography>
            <Typography variant="body2" color="text.secondary">Top 5 by Value</Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress size={28} />
            </Box>
          ) : topDeals.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <Typography color="text.secondary">No deals data available</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#EEF2FD" }}>
                    {["Date", "Salesperson", "Customer", "Deal Value", "Status"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topDeals.map((deal, i) => {
                    const st = getStatusStyle(deal.status);
                    return (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8f9fa" } }}>
                        <TableCell><Typography variant="body2" fontSize="13px">{formatDisplayDate(deal.date)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontSize="13px">{deal.salesperson}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontSize="13px">{deal.customer || "-"}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontSize="13px" fontWeight={500}>{formatRupiah(deal.deal_value)}</Typography></TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              px: 1.5, py: 0.5,
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: st.color,
                              bgcolor: st.bg,
                              border: `1px solid ${st.color}30`,
                            }}
                          >
                            {deal.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}
