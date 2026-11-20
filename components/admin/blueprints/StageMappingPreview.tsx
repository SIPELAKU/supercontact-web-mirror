"use client";

// The preview's breakdown of the "Tahapan penjualan" plan: one line per
// blueprint stage - rename, new, or left out - with the API's error for that
// stage (matched on `index`) under it.

import { AlertCircle, ArrowRight, MinusCircle, Pencil, Plus } from "lucide-react";
import type { BlueprintStage, ModuleReport, PipelineStagePlanItem } from "@/lib/types/IndustryBlueprint";
import { describePlan, type ExistingStage } from "./stageMappingRules";

interface StageMappingPreviewProps {
  plan: PipelineStagePlanItem[];
  stages: BlueprintStage[];
  existing: ExistingStage[];
  variables: Record<string, string>;
  report?: ModuleReport;
}

const KIND = {
  rename: { icon: Pencil, label: "Ganti nama", tone: "text-brand" },
  keep: { icon: ArrowRight, label: "Tetap", tone: "text-muted-foreground" },
  create: { icon: Plus, label: "Tahapan baru", tone: "text-emerald-700" },
  skip: { icon: MinusCircle, label: "Tidak dipasang", tone: "text-muted-foreground" },
} as const;

/** The API's error for one blueprint stage, if any. */
export function errorForIndex(report: ModuleReport | undefined, index: number): string | null {
  const found = (report?.errors ?? []).find((e) => Number((e as { index?: unknown }).index) === index);
  if (!found) return null;
  const message = (found as { error?: unknown }).error;
  return typeof message === "string" && message ? message : "Gagal";
}

/** Errors about the plan as a whole (the 8-stage limit, a name twice): no index. */
export function planErrors(report: ModuleReport | undefined): string[] {
  return (report?.errors ?? [])
    .filter((e) => {
      const index = (e as { index?: unknown }).index;
      return index === null || index === undefined;
    })
    .map((e) => {
      const message = (e as { error?: unknown }).error;
      return typeof message === "string" && message ? message : "Gagal";
    });
}

export default function StageMappingPreview({ plan, stages, existing, variables, report }: StageMappingPreviewProps) {
  const lines = describePlan(plan, stages, existing, variables);
  const general = planErrors(report);
  return (
    <section className="rounded-lg border">
      <h4 className="border-b bg-muted/50 px-3 py-2 text-sm font-medium">Rincian tahapan penjualan</h4>
      {general.length > 0 && (
        <div className="flex flex-col gap-1 border-b bg-red-50 px-3 py-2 text-xs text-red-700">
          {general.map((message, i) => (
            <p key={i} className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden /> {message}
            </p>
          ))}
        </div>
      )}
      <ul className="divide-y text-sm">
        {lines.map((line) => {
          const kind = KIND[line.kind];
          const Icon = kind.icon;
          const error = errorForIndex(report, line.index);
          return (
            <li key={line.index} className="flex items-start gap-3 px-3 py-2">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${kind.tone}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={line.kind === "skip" ? "text-muted-foreground line-through" : ""}>{line.text}</p>
                {error && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" aria-hidden /> {error}
                  </p>
                )}
              </div>
              <span className={`shrink-0 text-xs font-medium ${kind.tone}`}>{kind.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
