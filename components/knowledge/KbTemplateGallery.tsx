"use client";

// KB Template Gallery — industry starter packs (P1a).
//
// Grid of pack cards -> preview drawer (category/section tree + variables +
// locales) -> install wizard (locale -> variables -> options -> review) ->
// result screen (created/skipped counts, unsubstituted-variable warning,
// "Review articles" CTA). Everything here sits behind knowledge:manage
// (KbAccessGuard requireManage on the route; backend gates both endpoints).

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  FileText,
  Folder,
  Globe,
  Layers,
  LayoutTemplate,
  Loader2,
  Package,
  X,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import { cn } from "@/lib/utils";
import {
  useKbTemplates,
  useInstallKbTemplate,
  useKbPermissions,
} from "@/lib/hooks/useKnowledge";
import type { KbTemplatePack, KbTemplateInstallResult } from "@/lib/types/knowledge";

// ---- Shared bits -------------------------------------------------------------

const LOCALE_LABELS: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

const localeLabel = (code: string) => LOCALE_LABELS[code] ?? code.toUpperCase();

function IndustryChip({ industry }: { industry: string }) {
  if (!industry) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[#EEF2FD] px-2.5 py-0.5 text-[11px] font-semibold text-[#3E63D8]">
      {industry}
    </span>
  );
}

function CountBadge({
  icon: Icon,
  count,
  label,
}: {
  icon: typeof Folder;
  count: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-[11.5px] font-medium text-gray-600">
      <Icon className="h-3.5 w-3.5 text-gray-400" />
      {count} {label}
    </span>
  );
}

// ---- Preview drawer ----------------------------------------------------------

function KbTemplatePreviewDrawer({
  pack,
  onClose,
  onInstall,
}: {
  pack: KbTemplatePack | null;
  onClose: () => void;
  onInstall: (pack: KbTemplatePack) => void;
}) {
  useEffect(() => {
    if (!pack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pack, onClose]);

  if (!pack) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <LayoutTemplate className="h-5 w-5 shrink-0 text-[#5479EE]" />
              <h2 className="text-lg font-semibold text-gray-900">{pack.name}</h2>
              <IndustryChip industry={pack.industry} />
            </div>
            <p className="mt-0.5 text-[11.5px] text-gray-400">Version {pack.version}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {pack.description && <p className="text-sm text-gray-600">{pack.description}</p>}

          {/* Counts + locales */}
          <div className="flex flex-wrap items-center gap-2">
            <CountBadge icon={Folder} count={pack.counts.categories} label="categories" />
            <CountBadge icon={Layers} count={pack.counts.sections} label="sections" />
            <CountBadge icon={FileText} count={pack.counts.articles} label="articles" />
            <span className="mx-1 h-4 w-px bg-gray-200" />
            {pack.locales.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11.5px] font-medium text-gray-600"
              >
                <Globe className="h-3.5 w-3.5 text-gray-400" />
                {localeLabel(l)}
              </span>
            ))}
          </div>

          {/* Variables */}
          {pack.variables.length > 0 && (
            <div>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Variables
              </h3>
              <ul className="space-y-1.5">
                {pack.variables.map((v) => (
                  <li
                    key={v.key}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
                  >
                    <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#3E63D8] ring-1 ring-gray-200">
                      {`{{${v.key}}}`}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-gray-700">{v.label}</span>
                    {v.example && (
                      <span className="truncate text-[11.5px] italic text-gray-400">
                        e.g. {v.example}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11.5px] text-gray-400">
                Filled in during install; anything left blank stays as an editable placeholder.
              </p>
            </div>
          )}

          {/* Structure tree */}
          <div>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              Structure
            </h3>
            {pack.preview.length === 0 ? (
              <p className="text-sm text-gray-400">No preview available for this pack.</p>
            ) : (
              <div className="space-y-2">
                {pack.preview.map((cat) => (
                  <div key={cat.name} className="rounded-xl border border-gray-100 bg-white">
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <Folder className="h-4 w-4 shrink-0 text-[#5479EE]" />
                      <span className="text-[13.5px] font-semibold text-gray-800">{cat.name}</span>
                      <span className="ml-auto text-[11.5px] text-gray-400">
                        {cat.sections.length} sections
                      </span>
                    </div>
                    {cat.sections.length > 0 && (
                      <ul className="space-y-1 border-t border-gray-50 px-3 py-2">
                        {cat.sections.map((s) => (
                          <li key={s} className="flex items-center gap-2 pl-4 text-[13px] text-gray-600">
                            <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <AppButton variantStyle="outline" color="gray" onClick={onClose}>
            Close
          </AppButton>
          <AppButton startIcon={<Package size={16} />} onClick={() => onInstall(pack)}>
            Install this pack
          </AppButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---- Install wizard ----------------------------------------------------------

type WizardStepKey = "locale" | "variables" | "options" | "review";

const STEP_LABELS: Record<WizardStepKey, string> = {
  locale: "Locale",
  variables: "Variables",
  options: "Options",
  review: "Review",
};

function totals(c: { categories: number; sections: number; articles: number }) {
  return c.categories + c.sections + c.articles;
}

function KbTemplateInstallWizard({
  pack,
  onClose,
}: {
  pack: KbTemplatePack | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { canPublish } = useKbPermissions();
  const install = useInstallKbTemplate();

  const [stepIndex, setStepIndex] = useState(0);
  const [locale, setLocale] = useState("");
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [installAs, setInstallAs] = useState<"draft" | "published">("draft");
  const [keepPublicDefaults, setKeepPublicDefaults] = useState(true);
  const [result, setResult] = useState<KbTemplateInstallResult | null>(null);

  const steps = useMemo<WizardStepKey[]>(() => {
    if (!pack) return [];
    return pack.variables.length > 0
      ? ["locale", "variables", "options", "review"]
      : ["locale", "options", "review"];
  }, [pack]);

  // Reset the whole wizard whenever it opens for a (possibly different) pack.
  useEffect(() => {
    if (!pack) return;
    setStepIndex(0);
    setLocale(pack.locales.includes("id") ? "id" : pack.locales[0] ?? "");
    setVarValues({});
    setInstallAs("draft");
    setKeepPublicDefaults(true);
    setResult(null);
    install.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack?.id, !!pack]);

  if (!pack) return null;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const filledVariables = Object.fromEntries(
    Object.entries(varValues)
      .map(([k, v]) => [k, v.trim()] as const)
      .filter(([, v]) => v.length > 0)
  );
  const unfilledKeys = pack.variables.map((v) => v.key).filter((k) => !filledVariables[k]);

  const requestClose = () => {
    if (install.isPending) return;
    onClose();
  };

  const submit = async () => {
    try {
      const res = await install.mutateAsync({
        packId: pack.id,
        data: {
          locale,
          variables: Object.keys(filledVariables).length > 0 ? filledVariables : undefined,
          install_as: installAs,
          public_defaults: keepPublicDefaults,
        },
      });
      setResult(res);
    } catch (err: any) {
      if (err?.message === "UNAUTHORIZED") {
        notify.error("Session expired", { description: "Please sign in again." });
        return;
      }
      if (err?.status === 403) {
        notify.error("Permission denied", {
          description:
            installAs === "published"
              ? "Installing as Published requires the knowledge:publish permission. Switch to Draft, or ask an admin."
              : "You don't have permission to install template packs (knowledge:manage required).",
        });
        return;
      }
      notify.error("Install failed", {
        description: getErrorMessage(err, "Failed to install template pack"),
      });
    }
  };

  const allSkipped = result !== null && totals(result.created) === 0 && totals(result.skipped) > 0;

  return (
    <Dialog open={!!pack} onOpenChange={(o) => !o && requestClose()} maxWidth="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {result ? "Install result" : `Install "${pack.name}"`}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          /* ---- Result screen ---- */
          <div className="space-y-4">
            {allSkipped ? (
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <Package className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Pack ini sudah terpasang</p>
                  <p className="mt-0.5 text-[12.5px] text-blue-700">
                    Every category, section, and article in this pack already exists, so nothing
                    was created. Re-running an install is safe — existing content is never
                    overwritten.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Template installed</p>
                  <p className="mt-0.5 text-[12.5px] text-emerald-700">
                    {installAs === "draft"
                      ? "Articles were created as drafts — review and publish them when ready."
                      : "Articles were created and published."}
                  </p>
                </div>
              </div>
            )}

            {/* Created / skipped counts */}
            <div className="grid grid-cols-2 gap-3">
              {(["created", "skipped"] as const).map((kind) => (
                <div key={kind} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {kind}
                  </p>
                  <ul className="space-y-1 text-[13px] text-gray-700">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Categories</span>
                      <span className="font-semibold">{result[kind].categories}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Sections</span>
                      <span className="font-semibold">{result[kind].sections}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Articles</span>
                      <span className="font-semibold">{result[kind].articles}</span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            {/* Unsubstituted variables warning */}
            {result.unsubstituted_variables.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-800">Unfilled placeholders</p>
                  <p className="mt-0.5 text-[12.5px] text-amber-700">
                    Placeholder berikut masih mentah di artikel — isi variabel atau edit manual:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.unsubstituted_variables.map((k) => (
                      <span
                        key={k}
                        className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-amber-700 ring-1 ring-amber-200"
                      >
                        {`{{${k}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ---- Stepper + step content ---- */
          <div className="space-y-5">
            {/* Stepper */}
            <div className="flex items-center gap-1.5">
              {steps.map((s, i) => {
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <div key={s} className="flex min-w-0 items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />}
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10.5px] font-bold",
                        active
                          ? "bg-[#5479EE] text-white"
                          : done
                            ? "bg-[#EEF2FD] text-[#3E63D8]"
                            : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "truncate text-[12.5px] font-medium",
                        active ? "text-gray-800" : "text-gray-400"
                      )}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step: locale */}
            {step === "locale" && (
              <div className="space-y-2">
                <p className="text-[13px] text-gray-500">
                  Choose the language variant of the pack to install.
                </p>
                {pack.locales.length === 0 ? (
                  <p className="text-sm text-red-500">This pack declares no locales.</p>
                ) : (
                  pack.locales.map((l) => {
                    const selected = locale === l;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLocale(l)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          selected
                            ? "border-[#5479EE] bg-[#EEF2FD]"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        )}
                      >
                        <Globe
                          className={cn("h-4 w-4", selected ? "text-[#5479EE]" : "text-gray-400")}
                        />
                        <span className="flex-1 text-sm font-medium text-gray-800">
                          {localeLabel(l)}
                        </span>
                        <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] uppercase text-gray-500 ring-1 ring-gray-200">
                          {l}
                        </span>
                        {selected && <Check className="h-4 w-4 text-[#5479EE]" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Step: variables */}
            {step === "variables" && (
              <div className="space-y-4">
                <p className="text-[13px] text-gray-500">
                  These values replace the pack's placeholders inside article bodies. All fields
                  are optional — anything left blank stays as a{" "}
                  <span className="font-mono text-[12px]">{"{{placeholder}}"}</span> you can edit
                  later.
                </p>
                {pack.variables.map((v) => (
                  <div key={v.key}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-600">{v.label}</label>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10.5px] text-gray-500">
                        {`{{${v.key}}}`}
                      </span>
                    </div>
                    <AppInput
                      value={varValues[v.key] ?? ""}
                      onChange={(e) =>
                        setVarValues((prev) => ({ ...prev, [v.key]: e.target.value }))
                      }
                      placeholder={v.example ? `e.g. ${v.example}` : undefined}
                      isBgWhite
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step: options */}
            {step === "options" && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Install articles as</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setInstallAs("draft")}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        installAs === "draft"
                          ? "border-[#5479EE] bg-[#EEF2FD]"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          Draft{" "}
                          <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600">
                            Recommended
                          </span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-500">
                          Review and edit before anything goes live. Only published + public
                          articles reach the help center and answer bot.
                        </p>
                      </div>
                      {installAs === "draft" && (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5479EE]" />
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={!canPublish}
                      onClick={() => canPublish && setInstallAs("published")}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        installAs === "published"
                          ? "border-[#5479EE] bg-[#EEF2FD]"
                          : "border-gray-200 bg-white",
                        canPublish ? "hover:bg-gray-50" : "cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Published</p>
                        <p className="mt-0.5 text-[12px] text-gray-500">
                          {canPublish
                            ? "Articles go live immediately after install."
                            : "Requires the knowledge:publish permission."}
                        </p>
                      </div>
                      {installAs === "published" && (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5479EE]" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <div className="pr-3">
                    <p className="text-sm font-medium text-gray-700">Keep pack's public flags</p>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      {keepPublicDefaults
                        ? "Curated FAQs stay public in the help center; internal SOPs stay private."
                        : "Everything installs as private, regardless of the pack's curation."}
                    </p>
                  </div>
                  <Switch checked={keepPublicDefaults} onCheckedChange={setKeepPublicDefaults} />
                </div>
              </div>
            )}

            {/* Step: review */}
            {step === "review" && (
              <div className="space-y-3">
                <ul className="divide-y divide-gray-50 rounded-xl border border-gray-100 bg-gray-50/40 text-[13px]">
                  <li className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Pack</span>
                    <span className="font-semibold text-gray-800">{pack.name}</span>
                  </li>
                  <li className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Locale</span>
                    <span className="font-semibold text-gray-800">{localeLabel(locale)}</span>
                  </li>
                  <li className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Install as</span>
                    <span className="font-semibold capitalize text-gray-800">{installAs}</span>
                  </li>
                  <li className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Visibility</span>
                    <span className="font-semibold text-gray-800">
                      {keepPublicDefaults ? "Pack defaults" : "All private"}
                    </span>
                  </li>
                  {pack.variables.length > 0 && (
                    <li className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-500">Variables filled</span>
                      <span className="font-semibold text-gray-800">
                        {Object.keys(filledVariables).length} of {pack.variables.length}
                      </span>
                    </li>
                  )}
                  <li className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">Will create (up to)</span>
                    <span className="font-semibold text-gray-800">
                      {pack.counts.categories} cat · {pack.counts.sections} sec ·{" "}
                      {pack.counts.articles} art
                    </span>
                  </li>
                </ul>

                {unfilledKeys.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-[12.5px] text-amber-700">
                      {unfilledKeys.length} variable{unfilledKeys.length > 1 ? "s" : ""} left
                      blank — the raw{" "}
                      <span className="font-mono text-[11.5px]">{"{{placeholder}}"}</span> text
                      stays in those articles until you edit them.
                    </p>
                  </div>
                )}

                <p className="text-[12px] text-gray-400">
                  Installing again later is safe: items that already exist are skipped, never
                  overwritten.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <AppButton variantStyle="outline" color="gray" onClick={onClose}>
                Close
              </AppButton>
              <AppButton
                startIcon={<FileText size={16} />}
                onClick={() => {
                  onClose();
                  router.push(
                    installAs === "draft" ? "/knowledge-base?status=draft" : "/knowledge-base"
                  );
                }}
              >
                Review articles
              </AppButton>
            </>
          ) : (
            <>
              <AppButton
                variantStyle="outline"
                color="gray"
                onClick={stepIndex === 0 ? requestClose : () => setStepIndex((i) => i - 1)}
                disabled={install.isPending}
                startIcon={stepIndex > 0 ? <ArrowLeft size={16} /> : undefined}
              >
                {stepIndex === 0 ? "Cancel" : "Back"}
              </AppButton>
              {isLast ? (
                <AppButton
                  startIcon={<Package size={16} />}
                  onClick={submit}
                  isLoading={install.isPending}
                  disabled={!locale}
                >
                  Install pack
                </AppButton>
              ) : (
                <AppButton
                  endIcon={<ArrowRight size={16} />}
                  onClick={() => setStepIndex((i) => i + 1)}
                  disabled={step === "locale" && !locale}
                >
                  Next
                </AppButton>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Gallery -----------------------------------------------------------------

export default function KbTemplateGallery() {
  const router = useRouter();
  const { data: packs = [], isLoading, isError, refetch } = useKbTemplates();

  const [previewPack, setPreviewPack] = useState<KbTemplatePack | null>(null);
  const [installPack, setInstallPack] = useState<KbTemplatePack | null>(null);

  const openInstall = (pack: KbTemplatePack) => {
    setPreviewPack(null);
    setInstallPack(pack);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 md:px-8">
      {/* Header (subpage pattern, matching Categories & sections) */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/knowledge-base")}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Template Gallery</h1>
          <p className="text-[12.5px] text-gray-400">
            Industry starter packs — install a ready-made help center skeleton, then edit and
            publish.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading template packs…
        </div>
      ) : isError ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Couldn't load template packs"
          description="Something went wrong while fetching the gallery."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : packs.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No template packs available"
          description="Starter packs ship with platform releases. Check back after the next update."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.id}
              role="button"
              tabIndex={0}
              onClick={() => setPreviewPack(pack)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPreviewPack(pack);
                }
              }}
              className="group flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5479EE]"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <IndustryChip industry={pack.industry} />
                <span className="text-[11px] text-gray-300">v{pack.version}</span>
              </div>
              <h2 className="text-[15px] font-semibold text-gray-900">{pack.name}</h2>
              {pack.description && (
                <p className="mt-1 line-clamp-2 text-[12.5px] text-gray-500">{pack.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <CountBadge icon={Folder} count={pack.counts.categories} label="cat" />
                <CountBadge icon={Layers} count={pack.counts.sections} label="sec" />
                <CountBadge icon={FileText} count={pack.counts.articles} label="art" />
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-400">
                  <Globe className="h-3.5 w-3.5" />
                  {pack.locales.map((l) => l.toUpperCase()).join(" · ")}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInstall(pack);
                  }}
                  className="rounded-lg bg-[#EEF2FD] px-3 py-1.5 text-[12.5px] font-semibold text-[#3E63D8] transition-colors hover:bg-[#DDE4FC]"
                >
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <KbTemplatePreviewDrawer
        pack={previewPack}
        onClose={() => setPreviewPack(null)}
        onInstall={openInstall}
      />
      <KbTemplateInstallWizard pack={installPack} onClose={() => setInstallPack(null)} />
    </div>
  );
}
