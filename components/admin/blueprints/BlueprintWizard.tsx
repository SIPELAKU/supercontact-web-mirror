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
import { installButtonLabel, previewCanInstall } from "./previewInstall";
import { blankOptional, missingRequired } from "./blueprintVariables";
import BlueprintVariableField from "./BlueprintVariableField";
import StageMappingSection, { type StageMappingStatus } from "./StageMappingSection";
import StageMappingPreview from "./StageMappingPreview";
import {
    checkPlan,
    initialPlan,
    planIsValid,
    readBlueprintStages,
    renameCount,
    toExistingStages,
} from "./stageMappingRules";
import { usePipelineStages, useSetupPipelineStages } from "@/lib/hooks/usePipelineStages";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuth } from "@/lib/context/AuthContext";
import { canManageStages } from "@/components/pipeline/stage-editor/stageRules";
import type { PipelineStagePlanItem } from "@/lib/types/IndustryBlueprint";

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
 *  than letting a tenant untick them and watch every sample product fail.
 *
 *  `price_lists` (Phase 2) joins them: its rows bind to products by SKU, so it
 *  is meaningless without the sample products and the server auto-includes it
 *  the same way. */
const PRODUCT_COUPLED_MODULES = ["product_categories", "units", "price_lists"];

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
    // What "Tahapan penjualan" does with each blueprint stage. Kept HERE, not
    // in the section: the details step unmounts on the way to the preview,
    // and the preview and the install must send this same plan.
    const [stagePlan, setStagePlan] = useState<PipelineStagePlanItem[] | null>(null);

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

    // Optional blanks only warn; a required one (NAMA_PERUSAHAAN) blocks the
    // preview - nearly every module uses it.
    const missingVariables = useMemo(
        () => blankOptional(detail?.variables || [], variables),
        [detail, variables]
    );
    const requiredMissing = useMemo(
        () => missingRequired(detail?.variables || [], variables),
        [detail, variables]
    );

    const declaredModules = useMemo(() => moduleNames(detail?.modules), [detail]);

    // ---- Tahapan penjualan: map the blueprint's stages onto the company's.
    const { can } = usePermission();
    const { userProfile, userRole } = useAuth();
    const offersStages = declaredModules.includes("pipeline_stages");
    const canReadStages = can("pipelines");
    // The API maps stages for an Admin only (BE 1.171.0); anyone else's plan
    // would be skipped with a note.
    const isAdmin = canManageStages(userProfile?.role ?? userRole);
    const stagesQuery = usePipelineStages(true, offersStages && canReadStages && isAdmin);
    const existingStages = useMemo(
        () => toExistingStages(stagesQuery.data?.data?.data ?? []),
        [stagesQuery.data]
    );
    // From the blueprint detail, in manifest order (the plan's `index`).
    const blueprintStages = useMemo(() => readBlueprintStages(detail?.pipeline_stages), [detail]);
    const stageModuleOn = modules.has("pipeline_stages");
    const mappingStatus: StageMappingStatus = !canReadStages
        ? "no-access"
        : !isAdmin
          ? "not-admin"
          : stagesQuery.isLoading
            ? "loading"
            : stagesQuery.isError
              ? "error"
              : existingStages.length === 0
                ? "no-stages"
                : !blueprintStages?.length
                  ? "no-template"
                  : "ready";
    // The module can't run without access, as a non-Admin, or before the
    // company has stages.
    const stageModuleBlocked =
        offersStages &&
        (mappingStatus === "no-access" || mappingStatus === "not-admin" || mappingStatus === "no-stages");

    useEffect(() => {
        if (!stageModuleBlocked) return;
        setModules((prev) => {
            if (!prev.has("pipeline_stages")) return prev;
            const next = new Set(prev);
            next.delete("pipeline_stages");
            return next;
        });
    }, [stageModuleBlocked, modules]);

    // A starting plan once everything is known; none while the module is off.
    useEffect(() => {
        if (!stageModuleOn) {
            setStagePlan(null);
            return;
        }
        if (mappingStatus === "ready" && blueprintStages && stagePlan === null) {
            setStagePlan(initialPlan(blueprintStages, existingStages, variables));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stageModuleOn, mappingStatus, blueprintStages, existingStages]);

    const planCheck = useMemo(
        () =>
            stagePlan && blueprintStages
                ? checkPlan(stagePlan, blueprintStages, existingStages, variables)
                : null,
        [stagePlan, blueprintStages, existingStages, variables]
    );
    // The plan to send: only when the module is on and the API knows the stages.
    const planToSend = stageModuleOn && mappingStatus === "ready" && stagePlan ? stagePlan : undefined;
    const stagesNotReady =
        stageModuleOn && (mappingStatus === "loading" || mappingStatus === "error" || (mappingStatus === "ready" && !stagePlan));
    const stagesInvalid = Boolean(planToSend && planCheck && !planIsValid(planCheck));
    const stageRenames =
        planToSend && blueprintStages ? renameCount(planToSend, blueprintStages, existingStages, variables) : 0;
    // A company with no stages yet: create the default six from here (same as
    // "Use Default" on the Pipeline page), then tick the module so the
    // mapping table appears against them.
    const setupStages = useSetupPipelineStages();
    const createDefaultStages = async () => {
        try {
            await setupStages.mutateAsync({ mode: "default" });
            await stagesQuery.refetch();
            setModules((prev) => new Set(prev).add("pipeline_stages"));
            notify.success("6 tahapan bawaan dibuat");
        } catch (error: any) {
            notify.error("Gagal membuat tahapan", { description: error?.message });
        }
    };
    // Errors the API found in the plan on the preview (it then writes nothing).
    const stagePreviewErrors = planToSend ? (preview?.modules?.pipeline_stages?.errors?.length ?? 0) : 0;

    /** Ticked and disabled while `products` is ticked: it comes along regardless. */
    const lockedByProducts = (key: string) =>
        PRODUCT_COUPLED_MODULES.includes(key) && modules.has("products") && declaredModules.includes(key);

    const toggleModule = (key: string) => {
        if (lockedByProducts(key)) return;
        if (key === "pipeline_stages" && stageModuleBlocked) return;
        const next = new Set(modules);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        if (next.has("products")) {
            for (const taxonomy of PRODUCT_COUPLED_MODULES) {
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
                pipelineStagePlan: planToSend,
            });
            setPreview(res.data);
            setStep("preview");
        } catch (error: any) {
            notify.error("Pratinjau gagal", { description: error.message });
        }
    };

    const runInstall = async () => {
        if (!selectedId) return;
        // The stages may have changed since the preview (another admin, another
        // tab): check the plan against them again rather than let it fail half way.
        if (planToSend && blueprintStages) {
            const fresh = await stagesQuery.refetch();
            const latest = toExistingStages(fresh.data?.data?.data ?? []);
            if (fresh.isError || !planIsValid(checkPlan(planToSend, blueprintStages, latest, variables))) {
                notify.warning("Tahapan pipeline berubah sejak pratinjau", {
                    description: "Periksa lagi pilihan tahapan penjualan, lalu lihat pratinjau ulang.",
                });
                setStep("details");
                return;
            }
        }
        try {
            const res = await install.mutateAsync({
                blueprintId: selectedId,
                modules: Array.from(modules),
                variables,
                dryRun: false,
                pipelineStagePlan: planToSend,
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
        setStagePlan(null);
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
                                  ? "bg-emerald-100 text-emerald-800"
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
                                // Another blueprint has other stages: start its plan afresh.
                                if (bp.id !== selectedId) setStagePlan(null);
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
                            <code className="rounded bg-muted px-1">{"{{TANDA}}"}</code> di teksnya,
                            bukan hilang diam-diam. Data khusus artikel Knowledge Base (alamat,
                            link Maps, promo, dan lainnya) diisi setelah pemasangan, di tab
                            Checklist Aktivasi.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(detail.variables || []).map((v) => (
                                <BlueprintVariableField
                                    key={v.key}
                                    variable={v}
                                    value={variables[v.key] || ""}
                                    onChange={(value) => setVariables({ ...variables, [v.key]: value })}
                                />
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
                                        disabled={lockedByProducts(key) || (key === "pipeline_stages" && stageModuleBlocked)}
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
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                                            mati
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </section>

                    {offersStages && (stageModuleOn || stageModuleBlocked) && (
                        <section>
                            <h3 className="mb-1 font-medium">Tahapan penjualan</h3>
                            <StageMappingSection
                                status={mappingStatus}
                                stages={blueprintStages ?? []}
                                existing={existingStages}
                                variables={variables}
                                plan={stagePlan}
                                check={planCheck}
                                onChange={setStagePlan}
                                onRetry={() => stagesQuery.refetch()}
                                onCreateDefaultStages={createDefaultStages}
                                creatingDefaults={setupStages.isPending}
                            />
                        </section>
                    )}

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
                        <div className="flex items-center gap-3">
                            {requiredMissing.length > 0 && (
                                <span className="text-xs text-red-600">
                                    Isi {requiredMissing.map((v) => v.label || v.key).join(", ")} dulu
                                </span>
                            )}
                            <AppButton
                                onClick={runPreview}
                                disabled={
                                    modules.size === 0 ||
                                    requiredMissing.length > 0 ||
                                    install.isPending ||
                                    stagesNotReady ||
                                    stagesInvalid
                                }
                            >
                                Lihat pratinjau
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </AppButton>
                        </div>
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

                    {planToSend && blueprintStages && (
                        <StageMappingPreview
                            plan={planToSend}
                            stages={blueprintStages}
                            existing={existingStages}
                            variables={variables}
                            report={preview.modules?.pipeline_stages}
                        />
                    )}

                    {(preview.unsubstituted_variables?.length ?? 0) > 0 && (
                        <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
                            Tanda yang masih kosong dan akan terlihat apa adanya di teks:{" "}
                            <code className="rounded bg-muted px-1">
                                {preview.unsubstituted_variables?.join(", ")}
                            </code>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <AppButton
                            variantStyle="outline"
                            onClick={() => {
                                // Back to the choices, kept as they were, against fresh stages.
                                setStep("details");
                                if (offersStages && canReadStages) stagesQuery.refetch();
                            }}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Ubah pilihan
                        </AppButton>
                        <AppButton
                            onClick={runInstall}
                            disabled={install.isPending || stagePreviewErrors > 0 || !previewCanInstall(preview, stageRenames)}
                        >
                            <Sparkles className="mr-1.5 h-4 w-4" />
                            {installButtonLabel(preview, stageRenames)}
                        </AppButton>
                    </div>
                    {/* The API checks the whole plan first and writes nothing
                        when any part is wrong, so installing it would do nothing. */}
                    {stagePreviewErrors > 0 && (
                        <p className="text-right text-xs text-red-600">
                            Perbaiki pilihan tahapan penjualan dulu (lihat rincian di atas), lalu lihat pratinjau ulang.
                        </p>
                    )}
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
                                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                                        {r.installed_as_draft ? "draft" : "mati"}
                                    </span>
                                )}
                                {r.sample_data && (
                                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
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
