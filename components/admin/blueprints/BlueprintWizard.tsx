"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
    Info,
    Package,
    Sparkles,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { notify } from "@/lib/notifications";
import {
    useBlueprint,
    useBlueprints,
    useInstallBlueprint,
} from "@/lib/hooks/useIndustryBlueprints";
import type {
    BlueprintInstallReport,
    BlueprintSummary,
} from "@/lib/types/IndustryBlueprint";
import { BEHAVIOUR_MODULES, moduleLabel } from "./moduleLabels";

type Step = "industry" | "details" | "preview" | "done";

/** Module names, whatever shape the API hands over.
 *
 *  This exists because the listing returned an array of names while the detail
 *  endpoint returned the manifest object, and `new Set(object)` threw - the
 *  whole wizard went to the error boundary the moment an industry was picked.
 *  The API is consistent now; this stays so that a future shape change is a
 *  cosmetic bug rather than a white screen. */
function moduleNames(modules: unknown): string[] {
    if (Array.isArray(modules)) return modules.filter((m): m is string => typeof m === "string");
    if (modules && typeof modules === "object") return Object.keys(modules as object);
    return [];
}

/** Installed with `products` whenever the manifest declares them - the server
 *  auto-includes them (`_resolve_modules`), so the boxes mirror that rather
 *  than letting a tenant untick them and watch every sample product fail. */
const TAXONOMY_MODULES = ["product_categories", "units"];

const STEPS: Array<{ id: Step; label: string }> = [
    { id: "industry", label: "Pilih industri" },
    { id: "details", label: "Isi data & modul" },
    { id: "preview", label: "Pratinjau" },
    { id: "done", label: "Selesai" },
];

export default function BlueprintWizard({
    onInstalled,
}: {
    onInstalled?: () => void;
}) {
    const [step, setStep] = useState<Step>("industry");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [modules, setModules] = useState<Set<string>>(new Set());
    const [preview, setPreview] = useState<BlueprintInstallReport | null>(null);
    const [result, setResult] = useState<BlueprintInstallReport | null>(null);

    const { data: listData, isLoading, isError, refetch } = useBlueprints();
    const blueprints: BlueprintSummary[] = listData?.data || [];
    const { data: detailData } = useBlueprint(selectedId);
    const detail = detailData?.data;
    const install = useInstallBlueprint();

    // Default to installing everything the blueprint offers; the tenant unticks.
    useEffect(() => {
        if (detail) setModules(new Set(moduleNames(detail.modules)));
    }, [detail]);

    // Industry defaults prefill the fields they belong to - what a restaurant
    // sells, say - so the WhatsApp templates do not ship with a raw
    // {{offer_noun}} in the body. Identity fields carry no default and stay
    // empty. Whatever the tenant has already typed is kept.
    useEffect(() => {
        if (!detail) return;
        const defaults: Record<string, string> = {};
        for (const v of detail.variables || []) {
            if (v.default) defaults[v.key] = v.default;
        }
        setVariables((prev) => ({ ...defaults, ...prev }));
    }, [detail]);

    const missingVariables = useMemo(() => {
        if (!detail) return [];
        return (detail.variables || [])
            .filter((v) => !(variables[v.key] || "").trim())
            .map((v) => v.key);
    }, [detail, variables]);

    const declaredModules = useMemo(() => moduleNames(detail?.modules), [detail]);

    /** Ticked and disabled while `products` is ticked: it comes along regardless. */
    const lockedByProducts = (key: string) =>
        TAXONOMY_MODULES.includes(key) && modules.has("products") && declaredModules.includes(key);

    const toggleModule = (key: string) => {
        if (lockedByProducts(key)) return;
        const next = new Set(modules);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        if (next.has("products")) {
            for (const taxonomy of TAXONOMY_MODULES) {
                if (declaredModules.includes(taxonomy)) next.add(taxonomy);
            }
        }
        setModules(next);
    };

    const runPreview = async () => {
        if (!selectedId) return;
        try {
            const res = await install.mutateAsync({
                blueprintId: selectedId,
                modules: Array.from(modules),
                variables,
                dryRun: true,
            });
            setPreview(res.data);
            setStep("preview");
        } catch (error: any) {
            notify.error("Pratinjau gagal", { description: error.message });
        }
    };

    const runInstall = async () => {
        if (!selectedId) return;
        try {
            const res = await install.mutateAsync({
                blueprintId: selectedId,
                modules: Array.from(modules),
                variables,
                dryRun: false,
            });
            setResult(res.data);
            setStep("done");
            onInstalled?.();
        } catch (error: any) {
            notify.error("Pemasangan gagal", { description: error.message });
        }
    };

    const reset = () => {
        setStep("industry");
        setSelectedId(null);
        setVariables({});
        setModules(new Set());
        setPreview(null);
        setResult(null);
    };

    if (isLoading) {
        return <div className="py-10 text-center text-sm text-muted-foreground">Memuat daftar industri…</div>;
    }
    if (isError) {
        return (
            <EmptyState
                title="Gagal memuat blueprint"
                description="Coba muat ulang."
                action={{ label: "Coba lagi", onClick: () => refetch() }}
            />
        );
    }

    const stepIndex = STEPS.findIndex((s) => s.id === step);

    return (
        <div className="flex flex-col gap-5">
            <ol className="flex flex-wrap gap-2 text-sm">
                {STEPS.map((s, i) => (
                    <li
                        key={s.id}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                            i === stepIndex
                                ? "bg-primary text-primary-foreground"
                                : i < stepIndex
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                  : "bg-muted text-muted-foreground"
                        }`}
                    >
                        {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                        {s.label}
                    </li>
                ))}
            </ol>

            {step === "industry" && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {blueprints.map((bp) => (
                        <button
                            key={bp.id}
                            onClick={() => {
                                setSelectedId(bp.id);
                                setStep("details");
                            }}
                            className="rounded-lg border p-4 text-left transition hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex items-center gap-2 font-medium">
                                <Package className="h-4 w-4 shrink-0 text-primary" />
                                {bp.name}
                            </div>
                            {bp.description && (
                                <p className="mt-1.5 line-clamp-3 text-xs text-muted-foreground">
                                    {bp.description}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                                {moduleNames(bp.modules).length} modul
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {step === "details" && detail && (
                <div className="flex flex-col gap-5">
                    <section>
                        <h3 className="mb-1 font-medium">Isi data perusahaan</h3>
                        <p className="mb-3 text-sm text-muted-foreground">
                            Dipakai untuk mengisi teks di artikel, macro, dan balasan.
                            Yang dikosongkan akan tetap terlihat sebagai{" "}
                            <code className="rounded bg-muted px-1">{"{{tanda}}"}</code> di teksnya,
                            bukan hilang diam-diam.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(detail.variables || []).map((v) => (
                                <div key={v.key}>
                                    <label className="mb-1 block text-xs font-medium">
                                        {v.label || v.key}
                                    </label>
                                    <AppInput
                                        value={variables[v.key] || ""}
                                        placeholder={v.example || v.key}
                                        onChange={(e) =>
                                            setVariables({ ...variables, [v.key]: e.target.value })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-1 font-medium">Pilih modul</h3>
                        <p className="mb-3 text-sm text-muted-foreground">
                            Modul bertanda <strong>mati</strong> dipasang dalam keadaan non-aktif
                            dan harus Anda nyalakan sendiri setelah ditinjau.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {moduleNames(detail.modules).map((key) => (
                                <label
                                    key={key}
                                    className="flex items-center gap-2 rounded-md border p-2.5 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={modules.has(key)}
                                        disabled={lockedByProducts(key)}
                                        onChange={() => toggleModule(key)}
                                    />
                                    <span className="flex-1">
                                        {moduleLabel(key)}
                                        {typeof detail.counts?.[key] === "number" && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                                ({detail.counts[key]})
                                            </span>
                                        )}
                                        {lockedByProducts(key) && (
                                            <span className="block text-xs text-muted-foreground">
                                                Dipasang bersama Produk contoh
                                            </span>
                                        )}
                                    </span>
                                    {BEHAVIOUR_MODULES.has(key) && (
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                                            mati
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </section>

                    {missingVariables.length > 0 && (
                        <div className="flex gap-2 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <span>
                                {missingVariables.length} data belum diisi. Boleh dilanjutkan —
                                pratinjau akan menunjukkan persis di mana tandanya masih tersisa.
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <AppButton variantStyle="outline" onClick={() => setStep("industry")}>
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Kembali
                        </AppButton>
                        <AppButton
                            onClick={runPreview}
                            disabled={modules.size === 0 || install.isPending}
                        >
                            Lihat pratinjau
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </AppButton>
                    </div>
                </div>
            )}

            {step === "preview" && preview && (
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-3 text-sm dark:bg-sky-950/30">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <span>
                            Ini pratinjau — <strong>belum ada apa pun yang tersimpan</strong>. Yang
                            sudah Anda miliki akan <strong>dilewati</strong>, tidak pernah ditimpa
                            atau dihapus.
                        </span>
                    </div>

                    <ReportTable report={preview} />

                    {(preview.unsubstituted_variables?.length ?? 0) > 0 && (
                        <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
                            Tanda yang masih kosong dan akan terlihat apa adanya di teks:{" "}
                            <code className="rounded bg-muted px-1">
                                {preview.unsubstituted_variables?.join(", ")}
                            </code>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <AppButton variantStyle="outline" onClick={() => setStep("details")}>
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Ubah pilihan
                        </AppButton>
                        <AppButton
                            onClick={runInstall}
                            disabled={install.isPending || preview.totals.created === 0}
                        >
                            <Sparkles className="mr-1.5 h-4 w-4" />
                            Pasang {preview.totals.created} item
                        </AppButton>
                    </div>
                </div>
            )}

            {step === "done" && result && (
                <div className="flex flex-col gap-4">
                    <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950/30">
                        <p className="font-medium">
                            Terpasang: {result.totals.created} item dibuat,{" "}
                            {result.totals.skipped} dilewati.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Modul yang mengubah perilaku dipasang <strong>non-aktif</strong>. Buka
                            Checklist Aktivasi untuk meninjau lalu menyalakannya.
                        </p>
                    </div>
                    <ReportTable report={result} />
                    <div className="flex justify-end">
                        <AppButton variantStyle="outline" onClick={reset}>
                            Pasang blueprint lain
                        </AppButton>
                    </div>
                </div>
            )}
        </div>
    );
}

function ReportTable({ report }: { report: BlueprintInstallReport }) {
    const rows = Object.entries(report.modules || {});
    if (rows.length === 0) return null;
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="px-3 py-2 font-medium">Modul</th>
                        <th className="w-24 px-3 py-2 font-medium">Dibuat</th>
                        <th className="w-24 px-3 py-2 font-medium">Dilewati</th>
                        <th className="px-3 py-2 font-medium">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([key, r]) => (
                        <tr key={key} className="border-t align-top">
                            <td className="px-3 py-2">
                                {moduleLabel(key)}
                                {(r.installed_disabled || r.installed_as_draft) && (
                                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                                        {r.installed_as_draft ? "draft" : "mati"}
                                    </span>
                                )}
                                {r.sample_data && (
                                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        contoh
                                    </span>
                                )}
                            </td>
                            <td className="px-3 py-2">{r.created}</td>
                            <td className="px-3 py-2 text-muted-foreground">{r.skipped}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">
                                {r.note && <p>{r.note}</p>}
                                {(r.errors || []).slice(0, 3).map((e, i) => (
                                    <p key={i} className="text-rose-600 dark:text-rose-400">
                                        {String((e as any).error ?? JSON.stringify(e))}
                                    </p>
                                ))}
                                {(r.errors?.length ?? 0) > 3 && (
                                    <p>+{(r.errors?.length ?? 0) - 3} lainnya</p>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
