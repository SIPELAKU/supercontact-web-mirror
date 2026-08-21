"use client";

import { useMemo, useState } from "react";
import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
} from "@mui/material";
import { Star } from "lucide-react";
import { useAgentsPerformance } from "@/lib/hooks/useSupportAnalytics";
import { AgentPerformanceItem, SupportAnalyticsParams } from "@/lib/api/support-analytics";
import { DASH, formatMinutes } from "./shared";

type SortKey = Exclude<keyof AgentPerformanceItem, "agent_id">;
type SortDir = "asc" | "desc";

interface ColumnDef {
    key: SortKey;
    label: string;
    align: "left" | "right";
}

const COLUMNS: ColumnDef[] = [
    { key: "agent_name", label: "Agent", align: "left" },
    { key: "tickets_total", label: "Tickets", align: "right" },
    { key: "tickets_resolved", label: "Resolved", align: "right" },
    { key: "avg_resolution_minutes", label: "Avg Resolution", align: "right" },
    { key: "avg_ticket_frt_minutes", label: "Ticket FRT", align: "right" },
    { key: "tickets_reopened", label: "Reopens", align: "right" },
    { key: "conversations_total", label: "Convos", align: "right" },
    { key: "conversations_closed", label: "Convos Closed", align: "right" },
    { key: "avg_conversation_frt_minutes", label: "Convo FRT", align: "right" },
    { key: "csat_avg", label: "CSAT", align: "right" },
    { key: "qa_avg_pct", label: "QA Score", align: "right" },
];

// Nulls always sort last regardless of direction, so "no data" agents
// never crowd the top of the board.
function compareItems(a: AgentPerformanceItem, b: AgentPerformanceItem, key: SortKey, dir: SortDir): number {
    const av = a[key];
    const bv = b[key];
    if (av === null || av === undefined) return bv === null || bv === undefined ? 0 : 1;
    if (bv === null || bv === undefined) return -1;
    let cmp: number;
    if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
    } else {
        cmp = (av as number) - (bv as number);
    }
    return dir === "asc" ? cmp : -cmp;
}

function num(value: number | null | undefined): React.ReactNode {
    return value === null || value === undefined ? DASH : value;
}

function mins(value: number | null | undefined): React.ReactNode {
    return formatMinutes(value) ?? DASH;
}

function qaBarColor(pct: number): string {
    return pct >= 90 ? "#16a34a" : pct >= 70 ? "#ea580c" : "#dc2626";
}

export function AgentsTab({ params }: { params: SupportAnalyticsParams }) {
    const { data, isLoading } = useAgentsPerformance(params);
    const [sortKey, setSortKey] = useState<SortKey>("tickets_total");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const items = useMemo(() => {
        const raw = data?.data?.items ?? [];
        return [...raw].sort((a, b) => compareItems(a, b, sortKey, sortDir));
    }, [data, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            // Names read naturally ascending; metrics start at the top.
            setSortDir(key === "agent_name" ? "asc" : "desc");
        }
    };

    return (
        <Paper sx={{ borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, px: 3, pt: 3, pb: 1 }}>
                Agent Performance
            </Typography>
            <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 980 }}>
                    <TableHead>
                        <TableRow>
                            {COLUMNS.map((col) => (
                                <TableCell
                                    key={col.key}
                                    align={col.align}
                                    sx={{ fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}
                                >
                                    <TableSortLabel
                                        active={sortKey === col.key}
                                        direction={sortKey === col.key ? sortDir : "desc"}
                                        onClick={() => handleSort(col.key)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                                        No agent activity for this period
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((agent) => (
                                <TableRow key={agent.agent_id} hover>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {agent.agent_name || DASH}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{num(agent.tickets_total)}</TableCell>
                                    <TableCell align="right">{num(agent.tickets_resolved)}</TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{mins(agent.avg_resolution_minutes)}</TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{mins(agent.avg_ticket_frt_minutes)}</TableCell>
                                    <TableCell align="right">{num(agent.tickets_reopened)}</TableCell>
                                    <TableCell align="right">{num(agent.conversations_total)}</TableCell>
                                    <TableCell align="right">{num(agent.conversations_closed)}</TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{mins(agent.avg_conversation_frt_minutes)}</TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                        {agent.csat_avg === null || agent.csat_avg === undefined ? (
                                            DASH
                                        ) : (
                                            <span className="inline-flex items-center gap-1">
                                                <Star size={14} fill="#eab308" color="#eab308" />
                                                <span className="font-medium">{agent.csat_avg.toFixed(1)}</span>
                                                <span className="text-gray-400">({agent.csat_count ?? 0})</span>
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap", minWidth: 140 }}>
                                        {agent.qa_avg_pct === null || agent.qa_avg_pct === undefined ? (
                                            DASH
                                        ) : (
                                            <Box className="flex items-center justify-end gap-2">
                                                <div className="h-2 w-16 rounded-full bg-gray-100">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, agent.qa_avg_pct))}%`,
                                                            backgroundColor: qaBarColor(agent.qa_avg_pct),
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-medium">{agent.qa_avg_pct.toFixed(0)}%</span>
                                                <span className="text-gray-400">({agent.qa_review_count ?? 0})</span>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
