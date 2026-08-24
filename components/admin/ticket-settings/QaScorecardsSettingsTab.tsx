"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ClipboardCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { Switch } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import {
    useCreateQaScorecard,
    useDeleteQaScorecard,
    useQaScorecards,
    useUpdateQaScorecard,
} from "@/lib/hooks/useQa";
import type { QaCriterion, QaScorecard } from "@/lib/api/qa";

// Client-side mirror of the backend's criteria validation: non-empty label,
// integer points 1..100, unique non-empty keys.
const MAX_POINTS_MIN = 1;
const MAX_POINTS_MAX = 100;

// Editor row state - points kept as a string so partially-typed values
// ("", "1.") don't fight the input; parsed + validated on save.
interface CriterionRow {
    key: string;
    label: string;
    maxPoints: string;
    section: string;
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 64);

export default function QaScorecardsSettingsTab() {
    const { data: scorecards = [], isLoading } = useQaScorecards();

    const createMutation = useCreateQaScorecard();
    const updateMutation = useUpdateQaScorecard();
    const deleteMutation = useDeleteQaScorecard();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [rows, setRows] = useState<CriterionRow[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setIsActive(true);
        setRows([]);
    };

    const handleEdit = (scorecard: QaScorecard) => {
        setEditingId(scorecard.id);
        setName(scorecard.name);
        setIsActive(scorecard.is_active);
        setRows(
            (scorecard.criteria || []).map((c) => ({
                key: c.key,
                label: c.label,
                maxPoints: String(c.max_points ?? ""),
                section: c.section || "",
            }))
        );
    };

    // --- Criteria editor ---
    const addRow = () =>
        setRows((prev) => [...prev, { key: "", label: "", maxPoints: "5", section: "" }]);

    const updateRow = (index: number, patch: Partial<CriterionRow>) =>
        setRows((prev) =>
            prev.map((row, i) => {
                if (i !== index) return row;
                const next = { ...row, ...patch };
                // Auto-derive the key from the label while the key still
                // "follows" the label (empty or equal to the old label's slug).
                // Once the user hand-edits the key, it stops following.
                if (
                    patch.label !== undefined &&
                    patch.key === undefined &&
                    (row.key === "" || row.key === slugify(row.label))
                ) {
                    next.key = slugify(patch.label);
                }
                return next;
            })
        );

    const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

    const moveRow = (index: number, dir: -1 | 1) =>
        setRows((prev) => {
            const next = [...prev];
            const target = index + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });

    // Mirrors the backend's rules so a bad payload never leaves the client:
    // non-empty label, integer 1..100 points, unique non-empty keys.
    const validate = (): QaCriterion[] | null => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a scorecard name." });
            return null;
        }
        if (rows.length === 0) {
            notify.warning("Validation Error", {
                description: "Add at least one criterion to the scorecard.",
            });
            return null;
        }

        const seenKeys = new Set<string>();
        const criteria: QaCriterion[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const label = row.label.trim();
            if (!label) {
                notify.warning("Validation Error", {
                    description: `Criterion ${i + 1}: label is required.`,
                });
                return null;
            }
            const key = (row.key.trim() || slugify(label)).toLowerCase();
            if (!key) {
                notify.warning("Validation Error", {
                    description: `Criterion ${i + 1}: key is required.`,
                });
                return null;
            }
            if (seenKeys.has(key)) {
                notify.warning("Validation Error", {
                    description: `Criterion ${i + 1}: key "${key}" is used more than once. Keys must be unique.`,
                });
                return null;
            }
            seenKeys.add(key);

            const points = Number(row.maxPoints);
            if (
                !Number.isInteger(points) ||
                points < MAX_POINTS_MIN ||
                points > MAX_POINTS_MAX
            ) {
                notify.warning("Validation Error", {
                    description: `Criterion ${i + 1}: max points must be a whole number between ${MAX_POINTS_MIN} and ${MAX_POINTS_MAX}.`,
                });
                return null;
            }

            const section = row.section.trim();
            criteria.push({ key, label, max_points: points, ...(section ? { section } : {}) });
        }
        return criteria;
    };

    const handleSave = async () => {
        const criteria = validate();
        if (!criteria) return;

        const payload = { name: name.trim(), is_active: isActive, criteria };
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: payload });
                notify.success("Scorecard updated");
            } else {
                await createMutation.mutateAsync(payload);
                notify.success("Scorecard created");
            }
            resetForm();
        } catch (error: any) {
            // Surfaces the friendly 409 dup-name message from the API layer.
            notify.error("Error", { description: error?.message || "Failed to save scorecard" });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Scorecard deleted");
            if (editingId === deleteTarget.id) resetForm();
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Failed to delete scorecard" });
        }
    };

    const totalPoints = (criteria: QaCriterion[]) =>
        criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);

    return (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                QA scorecards define the criteria reviewers grade an interaction against - an
                ordered list of criteria, each worth 1-100 points, optionally grouped under a
                section label. Active scorecards can be picked when creating a QA review.
            </p>

            {/* Editor */}
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Scorecard name</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            placeholder="e.g. Support Call Quality"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex h-10 items-center gap-2 text-sm text-gray-700">
                            <Switch
                                size="small"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                inputProps={{ "aria-label": "Scorecard active" }}
                            />
                            Active
                        </label>
                    </div>
                </div>

                {/* Criteria editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Criteria</p>
                        <AppButton variantStyle="outline" onClick={addRow} startIcon={<Plus size={14} />}>
                            Add criterion
                        </AppButton>
                    </div>

                    {rows.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">
                            No criteria yet. Add criteria to build the scorecard.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {rows.map((row, index) => (
                                <div
                                    key={index}
                                    className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"
                                >
                                    <span className="w-5 text-center text-xs font-medium text-gray-400">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-[11rem] flex-[2]">
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            placeholder="Label (e.g. Greeting)"
                                            value={row.label}
                                            onChange={(e) => updateRow(index, { label: e.target.value })}
                                        />
                                    </div>
                                    <div className="min-w-[8rem] flex-1">
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            placeholder="key"
                                            value={row.key}
                                            onChange={(e) =>
                                                updateRow(index, { key: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="w-24">
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            type="number"
                                            placeholder="Points"
                                            inputProps={{ min: MAX_POINTS_MIN, max: MAX_POINTS_MAX }}
                                            value={row.maxPoints}
                                            onChange={(e) =>
                                                updateRow(index, { maxPoints: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="min-w-[9rem] flex-1">
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            placeholder="Section (optional)"
                                            value={row.section}
                                            onChange={(e) =>
                                                updateRow(index, { section: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveRow(index, -1)}
                                            disabled={index === 0}
                                            className="text-gray-300 hover:text-gray-700 disabled:opacity-30"
                                            aria-label="Move up"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveRow(index, 1)}
                                            disabled={index === rows.length - 1}
                                            className="text-gray-300 hover:text-gray-700 disabled:opacity-30"
                                            aria-label="Move down"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Remove criterion"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
                    {editingId && (
                        <AppButton variantStyle="outline" onClick={resetForm}>
                            Cancel
                        </AppButton>
                    )}
                    <AppButton
                        onClick={handleSave}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        startIcon={editingId ? undefined : <Plus size={16} />}
                    >
                        {editingId ? "Save scorecard" : "Add scorecard"}
                    </AppButton>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <p className="text-sm text-gray-400">Loading scorecards...</p>
            ) : scorecards.length === 0 ? (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No QA scorecards yet"
                    description="Create a scorecard above to start grading tickets and conversations."
                />
            ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    {scorecards.map((scorecard) => (
                        <li
                            key={scorecard.id}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-gray-900">
                                        {scorecard.name}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                            scorecard.is_active
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {scorecard.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="mt-0.5 truncate text-xs text-gray-400">
                                    {(scorecard.criteria || []).length} criteri
                                    {(scorecard.criteria || []).length === 1 ? "on" : "a"} ·{" "}
                                    {totalPoints(scorecard.criteria || [])} points max
                                    {scorecard.criteria?.length
                                        ? ` · ${scorecard.criteria.map((c) => c.label).join(", ")}`
                                        : ""}
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <button
                                    onClick={() => handleEdit(scorecard)}
                                    className="text-gray-300 hover:text-gray-700"
                                    aria-label="Edit scorecard"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() =>
                                        setDeleteTarget({ id: scorecard.id, name: scorecard.name })
                                    }
                                    className="text-gray-300 hover:text-red-500"
                                    aria-label="Delete scorecard"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete QA Scorecard"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? Existing reviews keep their criteria snapshot and are not affected.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
