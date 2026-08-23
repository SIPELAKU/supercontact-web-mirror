"use client";

import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    EyeOff,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { EmptyState } from "@/components/ui/empty-state";
import { notify } from "@/lib/notifications";
import {
    useCreatePipelineStage,
    useDeletePipelineStage,
    usePipelineStages,
    useReorderPipelineStages,
    useUpdatePipelineStage,
} from "@/lib/hooks/usePipelineStages";
import type { PipelineStage, StageOutcome } from "@/lib/types/PipelineStage";

const OUTCOME_LABEL: Record<StageOutcome, string> = {
    open: "Sedang berjalan",
    won: "Menang",
    lost: "Kalah",
};

const OUTCOME_STYLE: Record<StageOutcome, string> = {
    open: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    lost: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

interface Draft {
    name: string;
    outcome: StageOutcome;
    default_probability: string;
}

const EMPTY_DRAFT: Draft = { name: "", outcome: "open", default_probability: "" };

export default function PipelineStagesTab() {
    const [includeInactive, setIncludeInactive] = useState(false);
    const { data, isLoading, isError, refetch } = usePipelineStages(includeInactive);
    const stages: PipelineStage[] = data?.data?.data || [];

    const createMutation = useCreatePipelineStage();
    const updateMutation = useUpdatePipelineStage();
    const reorderMutation = useReorderPipelineStages();
    const deleteMutation = useDeletePipelineStage();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [adding, setAdding] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PipelineStage | null>(null);

    const wonCount = useMemo(
        () => stages.filter((s) => s.outcome === "won" && s.is_active).length,
        [stages]
    );

    const resetForm = () => {
        setEditingId(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
    };

    const beginEdit = (stage: PipelineStage) => {
        setAdding(false);
        setEditingId(stage.id);
        setDraft({
            name: stage.name,
            outcome: stage.outcome,
            default_probability:
                stage.default_probability === null
                    ? ""
                    : String(stage.default_probability),
        });
    };

    const parseProbability = (): number | null => {
        const raw = draft.default_probability.trim();
        if (!raw) return null;
        const value = Number(raw);
        return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
    };

    const handleSave = async () => {
        const name = draft.name.trim();
        if (!name) {
            notify.warning("Nama tahap wajib diisi");
            return;
        }
        try {
            if (editingId) {
                const before = stages.find((s) => s.id === editingId);
                await updateMutation.mutateAsync({
                    id: editingId,
                    data: {
                        name,
                        outcome: draft.outcome,
                        default_probability: parseProbability(),
                    },
                });
                // Say what actually happened to the tenant's data, rather than
                // a generic "saved" - a rename MOVES every deal on this stage.
                if (before && before.name !== name && (before.deal_count ?? 0) > 0) {
                    notify.success("Tahap diubah", {
                        description: `${before.deal_count} deal ikut dipindahkan ke "${name}".`,
                    });
                } else if (before && before.outcome !== draft.outcome) {
                    notify.success("Tahap diubah", {
                        description: `Deal di tahap ini kini dihitung sebagai "${OUTCOME_LABEL[draft.outcome]}" di laporan.`,
                    });
                } else {
                    notify.success("Tahap diubah");
                }
            } else {
                await createMutation.mutateAsync({
                    name,
                    outcome: draft.outcome,
                    default_probability: parseProbability(),
                });
                notify.success("Tahap ditambahkan");
            }
            resetForm();
        } catch (error: any) {
            notify.error("Gagal menyimpan", { description: error.message });
        }
    };

    const handleToggleActive = async (stage: PipelineStage) => {
        try {
            await updateMutation.mutateAsync({
                id: stage.id,
                data: { is_active: !stage.is_active },
            });
            notify.success(stage.is_active ? "Tahap dinonaktifkan" : "Tahap diaktifkan");
        } catch (error: any) {
            notify.error("Gagal", { description: error.message });
        }
    };

    const handleMove = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= stages.length) return;
        const next = [...stages];
        [next[index], next[target]] = [next[target], next[index]];
        try {
            // The API demands the COMPLETE list, so send every id - including
            // inactive ones when they are on screen, or they would be missing.
            await reorderMutation.mutateAsync(next.map((s) => s.id));
        } catch (error: any) {
            notify.error("Gagal mengurutkan", { description: error.message });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Tahap dihapus");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Tidak bisa dihapus", { description: error.message });
            setDeleteTarget(null);
        }
    };

    if (isLoading) {
        return <div className="py-10 text-center text-sm text-muted-foreground">Memuat tahapan…</div>;
    }
    if (isError) {
        return (
            <EmptyState
                title="Gagal memuat tahapan"
                description="Coba muat ulang."
                action={{ label: "Coba lagi", onClick: () => refetch() }}
            />
        );
    }

    const editorRow = (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
                <label className="mb-1 block text-xs font-medium">Nama tahap</label>
                <AppInput
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="mis. Survey Lokasi"
                    inputProps={{ maxLength: 100 }}
                />
            </div>
            <div className="sm:w-52">
                <label className="mb-1 block text-xs font-medium">Artinya di laporan</label>
                <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={draft.outcome}
                    onChange={(e) =>
                        setDraft({ ...draft, outcome: e.target.value as StageOutcome })
                    }
                >
                    <option value="open">Sedang berjalan</option>
                    <option value="won">Menang</option>
                    <option value="lost">Kalah</option>
                </select>
            </div>
            <div className="sm:w-36">
                <label className="mb-1 block text-xs font-medium">Probabilitas (%)</label>
                <AppInput
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={draft.default_probability}
                    onChange={(e) =>
                        setDraft({ ...draft, default_probability: e.target.value })
                    }
                    placeholder="opsional"
                />
            </div>
            <div className="flex gap-2">
                <AppButton
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    <Save className="mr-1.5 h-4 w-4" />
                    Simpan
                </AppButton>
                <AppButton variantStyle="outline" onClick={resetForm}>
                    <X className="h-4 w-4" />
                </AppButton>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
                <p className="font-medium">Mengubah tahap ikut mengubah data yang berjalan.</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Mengganti nama tahap <strong>memindahkan semua deal</strong> di tahap itu.</li>
                    <li>
                        Mengubah artinya <strong>menghitung ulang deal tersebut di laporan</strong> —
                        laporan membaca artinya, bukan namanya.
                    </li>
                    <li>Menonaktifkan menyembunyikannya dari pilihan, tapi riwayat tetap utuh.</li>
                </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={includeInactive}
                        onChange={(e) => setIncludeInactive(e.target.checked)}
                    />
                    Tampilkan tahap non-aktif
                </label>
                {!adding && !editingId && (
                    <AppButton
                        onClick={() => {
                            setAdding(true);
                            setDraft(EMPTY_DRAFT);
                        }}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah tahap
                    </AppButton>
                )}
            </div>

            {adding && editorRow}

            {stages.length === 0 ? (
                <EmptyState
                    title="Belum ada tahapan"
                    description="Tambahkan tahap pertama untuk pipeline penjualan Anda."
                />
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="w-20 px-3 py-2 font-medium">Urutan</th>
                                <th className="px-3 py-2 font-medium">Tahap</th>
                                <th className="px-3 py-2 font-medium">Arti</th>
                                <th className="px-3 py-2 font-medium">Prob.</th>
                                <th className="px-3 py-2 font-medium">Deal</th>
                                <th className="px-3 py-2 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stages.map((stage, index) => (
                                <tr
                                    key={stage.id}
                                    className={`border-t ${stage.is_active ? "" : "opacity-60"}`}
                                >
                                    <td className="px-3 py-2">
                                        <div className="flex gap-1">
                                            <button
                                                aria-label="Naikkan"
                                                className="rounded p-1 hover:bg-muted disabled:opacity-30"
                                                disabled={index === 0 || reorderMutation.isPending}
                                                onClick={() => handleMove(index, -1)}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                aria-label="Turunkan"
                                                className="rounded p-1 hover:bg-muted disabled:opacity-30"
                                                disabled={
                                                    index === stages.length - 1 ||
                                                    reorderMutation.isPending
                                                }
                                                onClick={() => handleMove(index, 1)}
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {stage.name}
                                        {!stage.is_active && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                (non-aktif)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_STYLE[stage.outcome]}`}
                                        >
                                            {OUTCOME_LABEL[stage.outcome]}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {stage.default_probability ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {stage.deal_count ?? 0}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                aria-label="Ubah"
                                                className="rounded p-1.5 hover:bg-muted"
                                                onClick={() => beginEdit(stage)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                aria-label={
                                                    stage.is_active ? "Nonaktifkan" : "Aktifkan"
                                                }
                                                className="rounded p-1.5 hover:bg-muted"
                                                onClick={() => handleToggleActive(stage)}
                                            >
                                                <EyeOff className="h-4 w-4" />
                                            </button>
                                            <button
                                                aria-label="Hapus"
                                                className="rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950/40"
                                                // Mirror the API's guards so the reason is visible
                                                // BEFORE the click, not as a 409 afterwards.
                                                disabled={
                                                    (stage.deal_count ?? 0) > 0 ||
                                                    (stage.outcome === "won" && wonCount <= 1)
                                                }
                                                title={
                                                    (stage.deal_count ?? 0) > 0
                                                        ? `${stage.deal_count} deal masih di tahap ini. Pindahkan dulu, atau nonaktifkan saja.`
                                                        : stage.outcome === "won" && wonCount <= 1
                                                          ? "Ini satu-satunya tahap yang dihitung menang. Menghapusnya membuat semua laporan pendapatan jadi nol."
                                                          : "Hapus tahap"
                                                }
                                                onClick={() => setDeleteTarget(stage)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {editingId && (
                                <tr className="border-t bg-muted/30">
                                    <td colSpan={6} className="p-3">
                                        {editorRow}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationPopup
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Hapus tahap ini?"
                description={`"${deleteTarget?.name}" akan dihapus permanen. Untuk menyembunyikannya tanpa kehilangan riwayat, nonaktifkan saja.`}
                confirmText="Hapus"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
