"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { notify } from "@/lib/notifications";
import { useCreateQaReview, useQaScorecards } from "@/lib/hooks/useQa";
import type { QaCriterion, QaScorecard, QaSubjectType } from "@/lib/api/qa";
import { QaAgentPicker, ScoreBar, pct, type QaAgentOption } from "./qaShared";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SUBJECT_TYPE_OPTIONS: { value: QaSubjectType; label: string }[] = [
    { value: "ticket", label: "Ticket" },
    { value: "conversation", label: "Conversation" },
];

export interface QaReviewFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    /** Prefill for launch points (ticket detail / workspace conversation). */
    defaultSubjectType?: QaSubjectType;
    defaultSubjectId?: string;
    /** When true, the subject fields are fixed (launch points). */
    lockSubject?: boolean;
    /** Prefill for the reviewed-agent picker (e.g. the ticket's assignee). */
    defaultAgent?: QaAgentOption | null;
}

/** Create-a-QA-review dialog. Pick a scorecard, point it at a ticket or
 *  conversation, optionally pick the reviewed agent (the backend prefills it
 *  from the subject's assignee when left empty), score each criterion, and
 *  save as draft or publish immediately. */
export function QaReviewFormDialog({
    isOpen,
    onClose,
    defaultSubjectType = "ticket",
    defaultSubjectId = "",
    lockSubject = false,
    defaultAgent = null,
}: QaReviewFormDialogProps) {
    // Scorecards only load while the dialog is open, so mounting this from a
    // launch point costs nothing until it's actually used.
    const { data: scorecards = [], isLoading: isLoadingScorecards } = useQaScorecards(isOpen);
    const createMutation = useCreateQaReview();

    const [scorecardId, setScorecardId] = useState("");
    const [subjectType, setSubjectType] = useState<QaSubjectType>(defaultSubjectType);
    const [subjectId, setSubjectId] = useState(defaultSubjectId);
    const [agent, setAgent] = useState<QaAgentOption | null>(defaultAgent);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [comment, setComment] = useState("");

    // Re-seed the prefill each time the dialog opens (a launch point can be
    // reused for different subjects between opens).
    useEffect(() => {
        if (isOpen) {
            setSubjectType(defaultSubjectType);
            setSubjectId(defaultSubjectId);
            setAgent(defaultAgent ?? null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const activeScorecards = useMemo(
        () => scorecards.filter((s: QaScorecard) => s.is_active),
        [scorecards]
    );
    const selected = activeScorecards.find((s) => s.id === scorecardId) || null;
    const criteria: QaCriterion[] = selected?.criteria || [];

    const maxTotal = criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);
    const scoredTotal = criteria.reduce((sum, c) => {
        const v = Number(scores[c.key]);
        return sum + (scores[c.key] !== undefined && scores[c.key] !== "" && !Number.isNaN(v) ? v : 0);
    }, 0);

    const resetForm = () => {
        setScorecardId("");
        setSubjectType(defaultSubjectType);
        setSubjectId(defaultSubjectId);
        setAgent(defaultAgent ?? null);
        setScores({});
        setComment("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Returns the numeric scores map, or null on a validation problem.
    // Draft: any subset of criteria may be scored. Publish: all must be.
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

    const handleSave = async (status: "draft" | "published") => {
        if (!scorecardId) {
            notify.warning("Validation Error", { description: "Pick a scorecard first." });
            return;
        }
        const trimmedSubject = subjectId.trim();
        if (!UUID_RE.test(trimmedSubject)) {
            notify.warning("Validation Error", {
                description: "Enter the subject's ID (a UUID, e.g. copied from its URL).",
            });
            return;
        }
        const collected = collectScores(status === "published");
        if (!collected) return;

        try {
            await createMutation.mutateAsync({
                scorecard_id: scorecardId,
                subject_type: subjectType,
                subject_id: trimmedSubject,
                ...(agent ? { reviewed_agent_id: agent.id } : {}),
                ...(Object.keys(collected).length > 0 ? { scores: collected } : {}),
                ...(comment.trim() ? { overall_comment: comment.trim() } : {}),
                status,
            });
            notify.success(status === "published" ? "QA review published" : "QA review saved as draft");
            handleClose();
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Failed to create QA review" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose} maxWidth="sm">
            <DialogContent>
                <DialogHeader className="p-0 m-0">
                    <DialogTitle
                        className="text-[#5479EE] p-0 m-0"
                        style={{ fontSize: "22px", fontWeight: "bold", padding: 0, margin: 0 }}
                    >
                        New QA Review
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Grade a ticket or conversation against a scorecard. Save as a draft to
                        finish later, or publish immediately.
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Scorecard */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Scorecard</label>
                        <AppSelect
                            isBgWhite
                            fullWidth
                            value={scorecardId}
                            options={activeScorecards.map((s) => ({ value: s.id, label: s.name }))}
                            onChange={(e) => {
                                setScorecardId(e.target.value as string);
                                setScores({});
                            }}
                        />
                        {!isLoadingScorecards && activeScorecards.length === 0 && (
                            <p className="text-xs text-amber-600">
                                No active scorecards. Create one under Settings → Support → QA
                                Scorecards first.
                            </p>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Subject type</label>
                            <AppSelect
                                isBgWhite
                                fullWidth
                                value={subjectType}
                                options={SUBJECT_TYPE_OPTIONS}
                                disabled={lockSubject}
                                onChange={(e) => setSubjectType(e.target.value as QaSubjectType)}
                            />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium text-gray-500">Subject ID</label>
                            <AppInput
                                isBgWhite
                                fullWidth
                                placeholder="e.g. 1c9e4a2b-…"
                                value={subjectId}
                                disabled={lockSubject}
                                onChange={(e) => setSubjectId(e.target.value)}
                            />
                            {!lockSubject && (
                                <p className="text-[11px] text-gray-400">
                                    Paste the {subjectType}&apos;s UUID (from its URL or the API).
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Reviewed agent */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Reviewed agent</label>
                        <QaAgentPicker value={agent} onChange={setAgent} placeholder="Auto-detect from subject" />
                        <p className="text-[11px] text-gray-400">
                            Leave empty to use the subject&apos;s assigned agent automatically.
                        </p>
                    </div>

                    {/* Criteria scoring */}
                    {selected && (
                        <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">Scores</p>
                                <span className="text-xs font-semibold tabular-nums text-gray-500">
                                    {scoredTotal} / {maxTotal} ({pct(scoredTotal, maxTotal)}%)
                                </span>
                            </div>
                            <ScoreBar value={pct(scoredTotal, maxTotal)} />
                            <div className="space-y-2 pt-1">
                                {criteria.map((c, i) => (
                                    <div key={c.key} className="rounded-lg border border-gray-200 bg-white p-2">
                                        {c.section && (i === 0 || criteria[i - 1]?.section !== c.section) && (
                                            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                                                {c.section}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="min-w-0 flex-1 truncate text-sm text-gray-800" title={c.label}>
                                                {c.label}
                                            </span>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <AppInput
                                                    isBgWhite
                                                    type="number"
                                                    inputProps={{ min: 0, max: c.max_points }}
                                                    value={scores[c.key] ?? ""}
                                                    onChange={(e) =>
                                                        setScores((prev) => ({ ...prev, [c.key]: e.target.value }))
                                                    }
                                                    className="w-20"
                                                />
                                                <span className="text-xs text-gray-400">/ {c.max_points}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overall comment */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Overall comment</label>
                        <AppTextarea
                            isBgWhite
                            fullWidth
                            multiline
                            minRows={3}
                            placeholder="Coaching notes, highlights, improvement areas…"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <AppButton variantStyle="outline" onClick={handleClose}>
                        Cancel
                    </AppButton>
                    <AppButton
                        variantStyle="outline"
                        onClick={() => handleSave("draft")}
                        disabled={createMutation.isPending}
                    >
                        Save draft
                    </AppButton>
                    <AppButton
                        variantStyle="primary"
                        onClick={() => handleSave("published")}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "Saving..." : "Publish"}
                    </AppButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
