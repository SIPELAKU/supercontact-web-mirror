"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { notify } from "@/lib/notifications";
import { usePermission } from "@/lib/hooks/usePermission";
import { useQaReview, useUpdateQaReview } from "@/lib/hooks/useQa";
import type { QaCriterion } from "@/lib/api/qa";
import { PctBadge, ReviewStatusPill, ScoreBar, SUBJECT_TYPE_LABEL, pct } from "./qaShared";

interface QaReviewDetailDialogProps {
    reviewId: string | null;
    onClose: () => void;
}

/** Review detail: the criteria snapshot with per-criterion scores (editable
 *  while the review is a draft and the viewer holds support:qa:review), a
 *  totals bar, the overall comment, and a Publish action. */
export function QaReviewDetailDialog({ reviewId, onClose }: QaReviewDetailDialogProps) {
    const { can } = usePermission();
    const canReview = can("support:qa:review");

    const { data: review, isLoading, isError } = useQaReview(reviewId);
    const updateMutation = useUpdateQaReview();

    const [scores, setScores] = useState<Record<string, string>>({});
    const [comment, setComment] = useState("");

    // Seed local edit state whenever a (new) review's detail arrives.
    useEffect(() => {
        if (review) {
            const seeded: Record<string, string> = {};
            for (const [key, value] of Object.entries(review.scores || {})) {
                seeded[key] = String(value);
            }
            setScores(seeded);
            setComment(review.overall_comment || "");
        }
    }, [review]);

    const criteria: QaCriterion[] = useMemo(() => review?.criteria || [], [review]);
    const editable = !!review && review.status === "draft" && canReview;

    const maxTotal = criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);
    const scoredTotal = criteria.reduce((sum, c) => {
        const v = Number(scores[c.key]);
        return sum + (scores[c.key] !== undefined && scores[c.key] !== "" && !Number.isNaN(v) ? v : 0);
    }, 0);
    const totalPct = pct(scoredTotal, maxTotal);

    const collectScores = (requireAll: boolean): Record<string, number> | null => {
        const out: Record<string, number> = {};
        for (const c of criteria) {
            const raw = scores[c.key];
            if (raw === undefined || raw === "") {
                if (requireAll) {
                    notify.warning("Validation Error", {
                        description: `Score every criterion before publishing ("${c.label}" is empty).`,
                    });
                    return null;
                }
                continue;
            }
            const value = Number(raw);
            if (!Number.isFinite(value) || value < 0 || value > c.max_points) {
                notify.warning("Validation Error", {
                    description: `"${c.label}" must be between 0 and ${c.max_points}.`,
                });
                return null;
            }
            out[c.key] = value;
        }
        return out;
    };

    const handleSave = async (publish: boolean) => {
        if (!review) return;
        const collected = collectScores(publish);
        if (!collected) return;
        try {
            await updateMutation.mutateAsync({
                id: review.id,
                data: {
                    scores: collected,
                    overall_comment: comment.trim() || undefined,
                    ...(publish ? { status: "published" as const } : {}),
                },
            });
            notify.success(publish ? "QA review published" : "QA review updated");
            if (publish) onClose();
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Failed to update QA review" });
        }
    };

    const subjectHref =
        review?.subject_type === "ticket" ? `/support/tickets/${review.subject_id}` : null;

    return (
        <Dialog open={!!reviewId} onOpenChange={onClose} maxWidth="sm">
            <DialogContent>
                <DialogHeader className="p-0 m-0">
                    <DialogTitle
                        className="text-[#5479EE] p-0 m-0"
                        style={{ fontSize: "22px", fontWeight: "bold", padding: 0, margin: 0 }}
                    >
                        QA Review
                    </DialogTitle>
                    {review && (
                        <p className="text-sm text-gray-500 mt-1">
                            {review.scorecard_name} · {SUBJECT_TYPE_LABEL[review.subject_type] || review.subject_type}
                        </p>
                    )}
                </DialogHeader>

                {isLoading ? (
                    <p className="py-8 text-center text-sm text-gray-400">Loading review...</p>
                ) : isError || !review ? (
                    <p className="py-8 text-center text-sm text-gray-500">
                        Failed to load this review. It may have been removed.
                    </p>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm">
                            <Meta label="Status" value={<ReviewStatusPill status={review.status} />} />
                            <Meta
                                label="Score"
                                value={
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="font-semibold tabular-nums text-gray-800">
                                            {scoredTotal} / {maxTotal}
                                        </span>
                                        <PctBadge value={totalPct} />
                                    </span>
                                }
                            />
                            <Meta label="Reviewed agent" value={review.reviewed_agent_name || "—"} />
                            <Meta label="Reviewer" value={review.reviewer_name || "—"} />
                            <Meta
                                label="Subject"
                                value={
                                    subjectHref ? (
                                        <Link
                                            href={subjectHref}
                                            className="inline-flex items-center gap-1 font-medium text-[#5479EE] hover:underline"
                                        >
                                            {SUBJECT_TYPE_LABEL[review.subject_type]}
                                            <ExternalLink size={12} />
                                        </Link>
                                    ) : (
                                        SUBJECT_TYPE_LABEL[review.subject_type] || review.subject_type
                                    )
                                }
                            />
                            <Meta
                                label="Created"
                                value={review.created_at ? new Date(review.created_at).toLocaleString() : "—"}
                            />
                        </div>

                        {/* Totals bar */}
                        <ScoreBar value={totalPct} className="h-2" />

                        {/* Criteria (snapshot) */}
                        <div className="space-y-2">
                            {criteria.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                                    This review has no criteria snapshot.
                                </p>
                            ) : (
                                criteria.map((c, i) => {
                                    const raw = scores[c.key];
                                    const value = raw === undefined || raw === "" ? null : Number(raw);
                                    return (
                                        <div key={c.key}>
                                            {c.section && (i === 0 || criteria[i - 1]?.section !== c.section) && (
                                                <p className="mb-1 mt-2 text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                                                    {c.section}
                                                </p>
                                            )}
                                            <div className="rounded-lg border border-gray-200 bg-white p-2.5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span
                                                        className="min-w-0 flex-1 truncate text-sm text-gray-800"
                                                        title={c.label}
                                                    >
                                                        {c.label}
                                                    </span>
                                                    {editable ? (
                                                        <div className="flex shrink-0 items-center gap-1.5">
                                                            <AppInput
                                                                isBgWhite
                                                                type="number"
                                                                inputProps={{ min: 0, max: c.max_points }}
                                                                value={raw ?? ""}
                                                                onChange={(e) =>
                                                                    setScores((prev) => ({
                                                                        ...prev,
                                                                        [c.key]: e.target.value,
                                                                    }))
                                                                }
                                                                className="w-20"
                                                            />
                                                            <span className="text-xs text-gray-400">
                                                                / {c.max_points}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-700">
                                                            {value === null ? "—" : value} / {c.max_points}
                                                        </span>
                                                    )}
                                                </div>
                                                {!editable && (
                                                    <ScoreBar
                                                        value={value === null ? 0 : pct(value, c.max_points)}
                                                        className="mt-1.5"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Overall comment */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Overall comment</label>
                            {editable ? (
                                <AppTextarea
                                    isBgWhite
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    placeholder="Coaching notes, highlights, improvement areas…"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700">
                                    {review.overall_comment || "No overall comment."}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <AppButton variantStyle="outline" onClick={onClose}>
                        Close
                    </AppButton>
                    {editable && (
                        <>
                            <AppButton
                                variantStyle="outline"
                                onClick={() => handleSave(false)}
                                disabled={updateMutation.isPending}
                            >
                                Save changes
                            </AppButton>
                            <AppButton
                                variantStyle="primary"
                                onClick={() => handleSave(true)}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? "Saving..." : "Publish"}
                            </AppButton>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <div className="mt-0.5 truncate text-sm text-gray-800">{value}</div>
        </div>
    );
}
