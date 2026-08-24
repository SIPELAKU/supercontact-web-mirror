"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { AppSelect } from "@/components/ui/app-select";
import { cn } from "@/lib/utils";
import { useQaReviews } from "@/lib/hooks/useQa";
import type { QaReviewListItem, QaSubjectType } from "@/lib/api/qa";
import { QaReviewDetailDialog } from "./QaReviewDetailDialog";
import { PctBadge, QaAgentPicker, ReviewStatusPill, SUBJECT_TYPE_LABEL, pct, type QaAgentOption } from "./qaShared";

const PAGE_SIZE = 20;

const SUBJECT_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "All subjects" },
    { value: "ticket", label: "Tickets" },
    { value: "conversation", label: "Conversations" },
];

/** Paginated review list with agent + subject-type filters. A row opens the
 *  review detail dialog (editable while draft for support:qa:review holders). */
export function QaReviewsTab() {
    const [agent, setAgent] = useState<QaAgentOption | null>(null);
    const [subjectType, setSubjectType] = useState<string>("");
    const [page, setPage] = useState(0);
    const [openReviewId, setOpenReviewId] = useState<string | null>(null);

    const params = useMemo(
        () => ({
            agent_id: agent?.id || undefined,
            subject_type: (subjectType || undefined) as QaSubjectType | undefined,
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
        }),
        [agent, subjectType, page]
    );

    const { data, isLoading, isError, refetch, isFetching } = useQaReviews(params);
    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="w-full sm:max-w-xs">
                        <QaAgentPicker
                            value={agent}
                            onChange={(next) => {
                                setAgent(next);
                                setPage(0);
                            }}
                            placeholder="Filter by agent"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <AppSelect
                            isBgWhite
                            fullWidth
                            value={subjectType}
                            options={SUBJECT_FILTER_OPTIONS}
                            onChange={(e) => {
                                setSubjectType(e.target.value as string);
                                setPage(0);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-4">
                                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                                <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                                <div className="h-4 w-20 animate-pulse rounded-full bg-gray-100" />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p className="text-sm text-gray-600">Failed to load QA reviews.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg bg-[#5479EE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F66E0]"
                        >
                            Retry
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={ClipboardCheck}
                        title="No reviews found"
                        description="Try clearing filters, or create the first review with the New review button."
                        className="border-0"
                    />
                ) : (
                    <div className={cn("divide-y divide-gray-100", isFetching && "opacity-60 transition-opacity")}>
                        {items.map((item) => (
                            <ReviewRow key={item.id} item={item} onOpen={() => setOpenReviewId(item.id)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !isError && total > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        {total} review{total === 1 ? "" : "s"} · Page {page + 1} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                            disabled={page + 1 >= totalPages}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <QaReviewDetailDialog reviewId={openReviewId} onClose={() => setOpenReviewId(null)} />
        </div>
    );
}

function ReviewRow({ item, onOpen }: { item: QaReviewListItem; onOpen: () => void }) {
    const scorePct = pct(item.total_score, item.max_score);
    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">
                        {item.scorecard_name}
                    </span>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-gray-500">
                        {SUBJECT_TYPE_LABEL[item.subject_type] || item.subject_type}
                    </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                    Agent: {item.reviewed_agent_name || "—"} · Reviewer: {item.reviewer_name || "—"}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold tabular-nums text-gray-700">
                    {item.total_score} / {item.max_score}
                </span>
                <PctBadge value={scorePct} />
                <ReviewStatusPill status={item.status} />
                <span className="w-20 text-right text-xs text-gray-400">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                </span>
            </div>
        </button>
    );
}
