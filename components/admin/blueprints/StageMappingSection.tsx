"use client";

// Setup Cepat, step "Isi data & modul": what the "Tahapan penjualan" module
// does with each blueprint stage. Each row answers one question - rename one
// of my stages, add it as a new stage, or skip it - and the resulting
// pipeline is drawn underneath, so the outcome is visible before the preview.
//
// Controlled: the plan lives in the wizard (it must survive the step change to
// the preview). The rules are in stageMappingRules.ts.

import Link from "next/link";
import { Tooltip } from "@mui/material";
import { AlertTriangle, ArrowRight, Ban, Info, Lock, Pencil, Plus } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { cn } from "@/lib/utils";
import { stageColor, stageTint } from "@/components/pipeline/stage-editor/stageRules";
import type { BlueprintStage, PipelineStagePlanItem } from "@/lib/types/IndustryBlueprint";
import {
  MAX_STAGES,
  allowedTargets,
  chooseAction,
  createBlockReason,
  freeTargets,
  isPairedStage,
  renderStageName,
  resultPipeline,
  rowUsing,
  type ExistingStage,
  type MappingAction,
  type PlanCheck,
} from "./stageMappingRules";

export type StageMappingStatus = "ready" | "loading" | "error" | "no-stages" | "no-access" | "not-admin" | "no-template";

interface StageMappingSectionProps {
  status: StageMappingStatus;
  stages: BlueprintStage[];
  existing: ExistingStage[];
  variables: Record<string, string>;
  plan: PipelineStagePlanItem[] | null;
  check: PlanCheck | null;
  onChange: (plan: PipelineStagePlanItem[]) => void;
  onRetry: () => void;
  /** no-stages: create the six default stages right here. */
  onCreateDefaultStages: () => void;
  creatingDefaults: boolean;
}

const ACTIONS: { action: MappingAction; label: string; icon: typeof Pencil; help: string }[] = [
  { action: "assign", label: "Ganti nama", icon: Pencil, help: "Salah satu tahapan Anda diberi nama dari template. Deal di dalamnya tetap." },
  { action: "create", label: "Tambah baru", icon: Plus, help: "Dibuat sebagai tahapan baru di pipeline Anda." },
  { action: "skip", label: "Lewati", icon: Ban, help: "Tahapan ini tidak dipasang." },
];

function Notice({ tone = "info", children }: { tone?: "info" | "warning"; children: React.ReactNode }) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg border-l-4 p-3 text-sm",
        tone === "warning" ? "border-l-amber-500 bg-amber-50" : "border-l-sky-500 bg-sky-50",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone === "warning" ? "text-amber-600" : "text-sky-600")} />
      <div>{children}</div>
    </div>
  );
}

/** A stage's colour, as on the board. */
function ColorDot({ color }: { color: string | null }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stageColor(color) }} aria-hidden />;
}

const KIND_BADGE = {
  renamed: { label: "Nama baru", className: "bg-brand-light text-brand" },
  new: { label: "Baru", className: "bg-emerald-100 text-emerald-800" },
  kept: { label: "Tetap", className: "bg-gray-100 text-gray-600" },
} as const;

export default function StageMappingSection({
  status,
  stages,
  existing,
  variables,
  plan,
  check,
  onChange,
  onRetry,
  onCreateDefaultStages,
  creatingDefaults,
}: StageMappingSectionProps) {
  if (status === "loading" || (status === "ready" && !plan)) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label="Memuat tahapan" />;
  }
  if (status === "error") {
    return (
      <Notice tone="warning">
        Tahapan pipeline perusahaan gagal dimuat.{" "}
        <button type="button" onClick={onRetry} className="cursor-pointer font-medium text-brand underline">
          Coba lagi
        </button>
      </Notice>
    );
  }
  if (status === "no-access") {
    return <Notice tone="warning">Anda butuh akses pipeline untuk mengatur tahapan penjualan.</Notice>;
  }
  if (status === "not-admin") {
    return <Notice tone="warning">Hanya Admin yang bisa memasang tahapan penjualan dari template.</Notice>;
  }
  if (status === "no-stages") {
    // Template stages can only rename existing ones, so a pipeline with none
    // gets its default six here first (the API keeps them out of Setup Cepat
    // until an Admin sets the pipeline up) - no trip to the Pipeline page.
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 text-sm">
        <p>
          Pipeline Anda belum punya tahapan. Buat dulu 6 tahapan bawaan (Prospect, Qualified, Negotiation, Proposal, Closed - Won,
          Closed - Lost), lalu pilih tahapan mana yang diganti namanya dengan tahapan dari template.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <AppButton onClick={onCreateDefaultStages} isLoading={creatingDefaults} disabled={creatingDefaults}>
            Buat 6 tahapan bawaan
          </AppButton>
          <Link href="/sales/pipeline" className="text-sm text-muted-foreground underline-offset-4 hover:text-brand hover:underline">
            atau atur sendiri di halaman Pipeline
          </Link>
        </div>
      </div>
    );
  }
  if (status === "no-template" || !plan || !check) {
    // The API did not send the template's stages, so they can't be mapped here.
    return (
      <Notice tone="warning">
        Daftar tahapan dari template ini belum dikirim oleh server, jadi pilihan ganti nama belum bisa ditampilkan. Kalau dipasang
        sekarang, tahapan template ditambahkan dengan cara lama: yang namanya sudah ada dilewati, sisanya ditambah sampai batas 8
        tahapan.
      </Notice>
    );
  }

  const byId = new Map(existing.map((stage) => [stage.id, stage]));
  const result = resultPipeline(plan, stages, existing, variables);
  const overLimit = Boolean(check.blocking);
  const companyFull = existing.length >= MAX_STAGES;

  const setRow = (row: PipelineStagePlanItem) => onChange(plan.map((r) => (r.index === row.index ? row : r)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Tentukan apa yang terjadi pada setiap tahapan dari template. Deal di pipeline Anda tidak akan hilang.
        </p>
        <ul className="grid gap-2 sm:grid-cols-3" aria-label="Arti pilihan">
          {ACTIONS.map(({ action, label, icon: Icon, help }) => (
            <li key={action} className="flex gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span>
                <strong className="text-foreground">{label}</strong>
                <span className="block text-muted-foreground">{help}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {companyFull && (
        <Notice>
          Pipeline Anda sudah punya {existing.length} tahapan (maksimal {MAX_STAGES}, termasuk yang non-aktif), jadi tidak bisa menambah
          tahapan baru. Tahapan dari template hanya bisa dipakai untuk mengganti nama.
        </Notice>
      )}

      <ul className="flex flex-col gap-2" aria-label="Tahapan dari template">
        {plan.map((row) => {
          const stage = stages[row.index];
          const name = renderStageName(stage.name, variables);
          // entry/quotation/won/lost: the company has exactly one stage with that job.
          const paired = isPairedStage(stage);
          const targets = allowedTargets(stage, existing);
          const free = freeTargets(row.index, plan, stages, existing, variables);
          const reasons: Record<MappingAction, string | null> = {
            assign:
              row.action === "assign" || free.length > 0
                ? null
                : targets.length === 0
                  ? "Tidak ada tahapan Anda yang cocok."
                  : "Tahapan Anda yang cocok sudah dipakai baris lain.",
            create: createBlockReason(stage, existing),
            skip: null,
          };
          const target = row.action === "assign" && row.stage_id ? byId.get(row.stage_id) : undefined;
          const error = check.rowErrors[row.index];

          const choose = (action: MappingAction) => {
            if (action === row.action || reasons[action]) return;
            setRow(action === "assign" ? chooseAction(row.index, "assign", free[0]?.id ?? null) : chooseAction(row.index, action));
          };

          return (
            <li
              key={row.index}
              className={cn("rounded-lg border p-3", error ? "border-red-300 bg-red-50/40" : "bg-background")}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-words text-sm font-semibold">
                  <span className="mr-2 text-xs font-medium text-muted-foreground">{row.index + 1}.</span>
                  {name || "(tanpa nama)"}
                </p>
                <div role="radiogroup" aria-label={`Pilihan untuk ${name}`} className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5">
                  {ACTIONS.map(({ action, label, icon: Icon }) => {
                    const selected = row.action === action;
                    const reason = reasons[action];
                    const button = (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-disabled={Boolean(reason) || undefined}
                        onClick={() => choose(action)}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                          selected
                            ? "bg-brand text-white shadow-sm"
                            : reason
                              ? "cursor-not-allowed text-muted-foreground/50"
                              : "cursor-pointer text-muted-foreground hover:bg-background hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {label}
                      </button>
                    );
                    return reason ? (
                      <Tooltip key={action} title={reason}>
                        {button}
                      </Tooltip>
                    ) : (
                      <span key={action}>{button}</span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 text-sm">
                {row.action === "assign" &&
                  (paired ? (
                    // Its one entry/quotation/won/lost stage: nothing to pick.
                    <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                      Menggantikan tahapan Anda
                      <strong className="inline-flex items-center gap-1 text-foreground">
                        {target && <ColorDot color={target.color} />}
                        “{target?.name ?? "?"}”{target?.isLocked && <Lock className="h-3 w-3" aria-label="Tahapan wajib" />}
                      </strong>
                      <span className="text-xs">({target?.dealCount ?? 0} deal)</span>
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                      <span className="shrink-0 text-muted-foreground">Tahapan Anda yang diganti:</span>
                      <div className="min-w-0 sm:w-72">
                        <AppSelect
                          value={row.stage_id ?? ""}
                          onChange={(event) => setRow(chooseAction(row.index, "assign", String(event.target.value)))}
                          options={targets.map((t) => {
                            const usedBy = rowUsing(plan, t.id);
                            const takenElsewhere = usedBy !== null && usedBy !== row.index;
                            return {
                              value: t.id,
                              disabled: takenElsewhere,
                              label: (
                                <span className="flex items-center gap-1.5">
                                  <ColorDot color={t.color} />
                                  {t.name}
                                  {t.isLocked && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Tahapan wajib" />}
                                  <span className="text-xs text-muted-foreground">
                                    {takenElsewhere
                                      ? `· dipakai “${renderStageName(stages[usedBy].name, variables)}”`
                                      : `· ${t.dealCount} deal`}
                                  </span>
                                </span>
                              ),
                            };
                          })}
                          height="36px"
                          error={Boolean(error)}
                          inputProps={{ "aria-label": `Tahapan Anda yang diganti dengan ${name}` }}
                        />
                      </div>
                    </div>
                  ))}
                {row.action === "assign" && target && !error && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    {target.name.trim().toLowerCase() === name.trim().toLowerCase() ? (
                      "Namanya sudah sama, tidak ada yang berubah."
                    ) : (
                      <>
                        “{target.name}” <ArrowRight className="h-3 w-3" aria-hidden /> “{name}”
                        {target.dealCount > 0 && <span>· {target.dealCount} deal tetap di dalamnya</span>}
                      </>
                    )}
                  </p>
                )}
                {row.action === "create" && <p className="text-xs text-muted-foreground">Ditambahkan sebagai tahapan baru, sebelum tahapan menang.</p>}
                {row.action === "skip" && <p className="text-xs text-muted-foreground">Tidak dipasang.</p>}
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="rounded-lg border p-3" aria-label="Hasil pipeline Anda">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold">Hasil pipeline Anda</h4>
          <span aria-live="polite" className={cn("text-xs font-medium", overLimit ? "text-red-600" : "text-muted-foreground")}>
            {result.total} dari maks. {MAX_STAGES} tahapan
            {result.inactive > 0 && ` (termasuk ${result.inactive} non-aktif yang tidak tampil di board)`}
          </span>
        </div>
        <ol className="flex flex-wrap gap-2">
          {result.stages.map((s, i) => {
            const badge = KIND_BADGE[s.kind];
            return (
              <li
                key={s.key}
                className="flex w-[150px] flex-col gap-1 rounded-md border p-2"
                style={{ backgroundColor: stageTint(s.color, 0.1) }}
              >
                <span className="h-1 w-full rounded-full" style={{ backgroundColor: stageColor(s.color) }} aria-hidden />
                <span className="text-[11px] text-muted-foreground">{i + 1}</span>
                <span className="break-words text-xs font-medium leading-snug">{s.name}</span>
                {s.previousName && <span className="break-words text-[11px] text-muted-foreground">dulu: {s.previousName}</span>}
                <span className={cn("mt-auto w-fit rounded-full px-1.5 py-0.5 text-[10px] font-semibold", badge.className)}>{badge.label}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Tahapan lama tidak dihapus di sini. Yang tidak diganti tetap seperti sekarang. Tahapan yang diganti namanya tetap memakai
          warnanya; tahapan baru berwarna abu-abu dan warnanya bisa diganti di halaman Pipeline (tombol ⚙).
        </p>
      </section>

      {check.blocking && <Notice tone="warning">{check.blocking}</Notice>}
    </div>
  );
}
