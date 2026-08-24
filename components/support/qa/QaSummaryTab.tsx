"use client";

import { AlertCircle, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useQaSummary } from "@/lib/hooks/useQa";
import { PctBadge, ScoreBar } from "./qaShared";

/** Per-agent QA aggregate: review count + average score percentage. */
export function QaSummaryTab() {
    const { data: rows = [], isLoading, isError, refetch } = useQaSummary();

    if (isLoading) {
        return (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-4">
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                        <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-16 animate-pulse rounded-full bg-gray-100" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-16 text-center shadow-sm">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-sm text-gray-600">Failed to load the QA summary.</p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="rounded-lg bg-[#5479EE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F66E0]"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="No QA data yet"
                description="Published reviews aggregate here into a per-agent quality score."
            />
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[36rem] text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-3">Agent</th>
                        <th className="px-4 py-3 text-right">Reviews</th>
                        <th className="w-1/2 px-4 py-3">Average score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => {
                        const avg = Math.max(0, Math.min(100, Math.round(row.avg_pct ?? 0)));
                        return (
                            <tr key={row.agent_id} className="hover:bg-gray-50/60">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {row.agent_name || "Unknown agent"}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                                    {row.review_count}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <ScoreBar value={avg} className="flex-1" />
                                        <PctBadge value={avg} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
