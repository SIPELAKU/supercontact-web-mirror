// components/admin/blueprints/stageMappingRules.ts
//
// Setup Cepat, module "Tahapan penjualan": what happens to each stage of the
// blueprint on install - rename one of the company's stages to it (its deals
// stay, they just carry the new name), add it as a new stage, or leave it out.
// No UI here: the starting plan, the limits and the checks, so the wizard
// section and its tests share one source.
//
// The plan is kept in the wizard and sent unchanged with the preview
// (dry_run) and with the install, so what is installed is what was previewed.

import type { BlueprintStage, PipelineStagePlanItem } from "@/lib/types/IndustryBlueprint";
import type { PipelineStage } from "@/lib/types/PipelineStage";
import { FALLBACK_STAGE_COLOR } from "@/components/pipeline/stage-editor/stageRules";

/** The colour the API gives a stage created from a template (BE
 *  DEFAULT_STAGE_COLOR): templates carry no colours. A renamed stage keeps its own. */
export const NEW_STAGE_COLOR = FALLBACK_STAGE_COLOR;

export type MappingAction = PipelineStagePlanItem["action"];

/** At most this many stages per company, inactive ones included (BE 1.170.1). */
export const MAX_STAGES = 8;

/** A company stage as the mapping needs it. */
export interface ExistingStage {
  id: string;
  name: string;
  outcome: PipelineStage["outcome"];
  isActive: boolean;
  isLocked: boolean;
  dealCount: number;
  /** Hex, or null for none (the neutral colour is used). */
  color: string | null;
}

export function toExistingStages(stages: PipelineStage[]): ExistingStage[] {
  return [...stages]
    .sort((a, b) => a.display_order - b.display_order)
    .map((stage) => ({
      id: stage.id,
      name: stage.name,
      outcome: stage.outcome,
      isActive: stage.is_active,
      isLocked: Boolean(stage.is_locked),
      dealCount: stage.deal_count ?? 0,
      color: stage.color ?? null,
    }));
}

/** The blueprint's stages from the API, in manifest order (the plan's
 *  `index`). A manifest item may be a bare name, as the BE also accepts.
 *  null when the API sends no list. */
export function readBlueprintStages(raw: unknown): BlueprintStage[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((item) => {
    if (typeof item === "string") return { name: item, outcome: "open" as const };
    const data = (item ?? {}) as Record<string, unknown>;
    const outcome = data.outcome === "won" || data.outcome === "lost" ? data.outcome : "open";
    return {
      name: typeof data.name === "string" ? data.name : "",
      outcome,
      color: typeof data.color === "string" ? data.color : null,
      default_probability: typeof data.default_probability === "number" ? data.default_probability : null,
    };
  });
}

const VARIABLE_RE = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/** The stage name as the install will write it: the same rule as the BE's
 *  render_template - {{KEY}} is filled from the variables (keys compared in
 *  upper case), and an empty or unknown one stays as it is. */
export function renderStageName(raw: string, variables: Record<string, string>): string {
  const upper: Record<string, string> = {};
  for (const [key, value] of Object.entries(variables)) upper[key.trim().toUpperCase()] = String(value ?? "");
  return raw
    .replace(VARIABLE_RE, (match, key: string) => {
      const value = upper[key.toUpperCase()];
      return value ? value : match;
    })
    .trim();
}

const blueprintOutcome = (stage: BlueprintStage) => stage.outcome ?? "open";
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The company stages a blueprint stage may take over: the won stage for a won
 *  one, the lost stage for a lost one, any other ACTIVE stage otherwise. */
export function allowedTargets(stage: BlueprintStage, existing: ExistingStage[]): ExistingStage[] {
  const outcome = blueprintOutcome(stage);
  return existing.filter((target) => {
    if (!target.isActive) return false;
    if (outcome === "won" || outcome === "lost") return target.outcome === outcome;
    return target.outcome !== "won" && target.outcome !== "lost";
  });
}

/** Why "Tambah sebagai tahapan baru" is not offered, or null when it is. */
export function createBlockReason(stage: BlueprintStage, existing: ExistingStage[]): string | null {
  const outcome = blueprintOutcome(stage);
  if (outcome === "won") return "Pipeline hanya punya satu tahapan menang.";
  if (outcome === "lost") return "Pipeline hanya punya satu tahapan kalah.";
  if (existing.length >= MAX_STAGES) return `Perusahaan ini sudah punya ${existing.length} tahapan (maksimal ${MAX_STAGES}).`;
  return null;
}

/** Stages after the install: every existing one (inactive included) plus the new ones. */
export function stagesAfterInstall(plan: PipelineStagePlanItem[], existing: ExistingStage[]): number {
  return existing.length + plan.filter((row) => row.action === "create").length;
}

/** The starting plan, which the user can change:
 *  1. the won/lost stage -> the company's won/lost stage;
 *  2. the first blueprint stage -> the company's entry stage;
 *  3. a stage the company already has by that name -> that stage (nothing to rename);
 *  4. the rest are added while the total stays within MAX_STAGES, then left out. */
export function initialPlan(
  stages: BlueprintStage[],
  existing: ExistingStage[],
  variables: Record<string, string>,
): PipelineStagePlanItem[] {
  const taken = new Set<string>();
  const plan: PipelineStagePlanItem[] = stages.map((stage, index) => ({ index, action: "skip", stage_id: null }));
  const assign = (index: number, target: ExistingStage | undefined) => {
    if (!target || taken.has(target.id)) return false;
    taken.add(target.id);
    plan[index] = { index, action: "assign", stage_id: target.id };
    return true;
  };

  stages.forEach((stage, index) => {
    const outcome = blueprintOutcome(stage);
    if (outcome === "won" || outcome === "lost") assign(index, allowedTargets(stage, existing)[0]);
  });
  const first = stages.findIndex((stage) => blueprintOutcome(stage) === "open");
  if (first === 0) assign(0, existing.find((target) => target.isActive && target.outcome === "entry"));

  let total = existing.length;
  stages.forEach((stage, index) => {
    if (plan[index].action !== "skip" || blueprintOutcome(stage) !== "open") return;
    const name = renderStageName(stage.name, variables);
    const namesake = allowedTargets(stage, existing).find((target) => sameName(target.name, name));
    if (assign(index, namesake)) return;
    // A stage by that name exists but can't be taken over (it is inactive):
    // adding another would clash, so it stays out.
    if (existing.some((target) => sameName(target.name, name))) return;
    if (total < MAX_STAGES) {
      plan[index] = { index, action: "create", stage_id: null };
      total += 1;
    }
  });
  return plan;
}

/** The plan row for one choice of the dropdown. */
export function chooseAction(index: number, action: MappingAction, stageId: string | null = null): PipelineStagePlanItem {
  return { index, action, stage_id: action === "assign" ? stageId : null };
}

export interface PlanCheck {
  /** Per blueprint stage index: what is wrong with its row. */
  rowErrors: Record<number, string>;
  /** Stops the preview for the whole section (the limit). */
  blocking: string | null;
  total: number;
}

/** Everything that must hold before the preview. Names are compared as the
 *  install would write them, against every stage that remains. */
export function checkPlan(
  plan: PipelineStagePlanItem[],
  stages: BlueprintStage[],
  existing: ExistingStage[],
  variables: Record<string, string>,
): PlanCheck {
  const rowErrors: Record<number, string> = {};
  const byId = new Map(existing.map((stage) => [stage.id, stage]));
  const used = new Map<string, number>();

  for (const row of plan) {
    const stage = stages[row.index];
    if (!stage) continue;
    if (row.action === "assign") {
      const target = row.stage_id ? byId.get(row.stage_id) : undefined;
      if (!target) rowErrors[row.index] = "Tahapan tujuan sudah tidak ada. Pilih lagi.";
      else if (!allowedTargets(stage, existing).some((t) => t.id === target.id))
        rowErrors[row.index] = "Tahapan ini tidak bisa diganti dengan tahapan dari template ini.";
      else if (used.has(target.id)) rowErrors[row.index] = `“${target.name}” sudah dipilih di baris lain.`;
      else used.set(target.id, row.index);
    } else if (row.action === "create") {
      const reason = createBlockReason(stage, existing);
      if (reason && blueprintOutcome(stage) !== "open") rowErrors[row.index] = reason;
    }
  }

  // The names after the install: existing stages (renamed ones take the
  // blueprint name) plus the new ones. Two equal names would clash.
  const finalNames: { name: string; index: number | null }[] = existing
    .filter((stage) => !used.has(stage.id))
    .map((stage) => ({ name: stage.name, index: null }));
  for (const row of plan) {
    const stage = stages[row.index];
    if (!stage || rowErrors[row.index]) continue;
    if (row.action === "assign" || row.action === "create") {
      finalNames.push({ name: renderStageName(stage.name, variables), index: row.index });
    }
  }
  const seen = new Map<string, number | null>();
  for (const entry of finalNames) {
    const key = entry.name.toLowerCase();
    if (!key) {
      if (entry.index !== null) rowErrors[entry.index] = "Nama tahapan kosong. Isi datanya di atas.";
      continue;
    }
    if (seen.has(key)) {
      if (entry.index !== null) rowErrors[entry.index] = `Nama “${entry.name}” sudah dipakai tahapan lain.`;
      const other = seen.get(key);
      if (other !== null && other !== undefined && !rowErrors[other]) rowErrors[other] = `Nama “${entry.name}” sudah dipakai tahapan lain.`;
    } else seen.set(key, entry.index);
  }

  const total = stagesAfterInstall(plan, existing);
  const creates = plan.filter((row) => row.action === "create").length;
  const blocking =
    creates > 0 && total > MAX_STAGES
      ? `Maksimal ${MAX_STAGES} tahapan, termasuk yang non-aktif. Ubah beberapa jadi ganti nama atau jangan dipasang.`
      : null;
  return { rowErrors, blocking, total };
}

export const planIsValid = (check: PlanCheck) => !check.blocking && Object.keys(check.rowErrors).length === 0;

/** One line per blueprint stage for the preview: what will happen. */
export function describePlan(
  plan: PipelineStagePlanItem[],
  stages: BlueprintStage[],
  existing: ExistingStage[],
  variables: Record<string, string>,
): { index: number; kind: "rename" | "keep" | "create" | "skip"; text: string }[] {
  const byId = new Map(existing.map((stage) => [stage.id, stage]));
  return plan.map((row) => {
    const name = renderStageName(stages[row.index]?.name ?? "", variables);
    if (row.action === "assign") {
      const from = byId.get(row.stage_id ?? "")?.name ?? "?";
      return sameName(from, name)
        ? { index: row.index, kind: "keep", text: `${from} (tetap, sudah sama)` }
        : { index: row.index, kind: "rename", text: `${from} → ${name}` };
    }
    if (row.action === "create") return { index: row.index, kind: "create", text: name };
    return { index: row.index, kind: "skip", text: name };
  });
}

/** A company stage the row can still rename: allowed for this blueprint
 *  stage and not taken by another row. The one with the same name first. */
export function freeTargets(
  index: number,
  plan: PipelineStagePlanItem[],
  stages: BlueprintStage[],
  existing: ExistingStage[],
  variables: Record<string, string>,
): ExistingStage[] {
  const stage = stages[index];
  if (!stage) return [];
  const takenByOthers = new Set(
    plan.filter((row) => row.action === "assign" && row.index !== index).map((row) => row.stage_id),
  );
  const name = renderStageName(stage.name, variables);
  const free = allowedTargets(stage, existing).filter((target) => !takenByOthers.has(target.id));
  return [...free.filter((t) => sameName(t.name, name)), ...free.filter((t) => !sameName(t.name, name))];
}

/** Which row (blueprint stage index) renames this company stage, if any. */
export function rowUsing(plan: PipelineStagePlanItem[], stageId: string): number | null {
  return plan.find((row) => row.action === "assign" && row.stage_id === stageId)?.index ?? null;
}

export interface ResultStage {
  key: string;
  name: string;
  /** renamed: a company stage under the template's name; new: added from the
   *  template; kept: a company stage left as it is (or renamed to the same). */
  kind: "renamed" | "new" | "kept";
  /** The company stage's name before the install (renamed only). */
  previousName?: string;
  dealCount: number;
  isLocked: boolean;
  /** The colour it will have: its own when renamed or kept, the API's
   *  default for a new one. */
  color: string | null;
}

/** The pipeline as it will look after the install, in board order: the
 *  company's active stages (renamed in place), with the new ones placed right
 *  before the won stage in template order - as the API does. Inactive stages
 *  are not on the board but count towards the limit. */
export function resultPipeline(
  plan: PipelineStagePlanItem[],
  stages: BlueprintStage[],
  existing: ExistingStage[],
  variables: Record<string, string>,
): { stages: ResultStage[]; inactive: number; total: number } {
  const renameTo = new Map<string, string>();
  for (const row of plan) {
    if (row.action === "assign" && row.stage_id && stages[row.index]) {
      renameTo.set(row.stage_id, renderStageName(stages[row.index].name, variables));
    }
  }
  const result: ResultStage[] = existing
    .filter((stage) => stage.isActive)
    .map((stage) => {
      const next = renameTo.get(stage.id);
      const renamed = next !== undefined && !sameName(next, stage.name);
      return {
        key: stage.id,
        name: next ?? stage.name,
        kind: renamed ? "renamed" : "kept",
        previousName: renamed ? stage.name : undefined,
        dealCount: stage.dealCount,
        isLocked: stage.isLocked,
        color: stage.color,
      };
    });
  const created: ResultStage[] = plan
    .filter((row) => row.action === "create" && stages[row.index])
    .sort((a, b) => a.index - b.index)
    .map((row) => ({
      key: `new-${row.index}`,
      name: renderStageName(stages[row.index].name, variables),
      kind: "new",
      dealCount: 0,
      isLocked: false,
      color: NEW_STAGE_COLOR,
    }));
  const wonAt = existing
    .filter((stage) => stage.isActive)
    .findIndex((stage) => stage.outcome === "won");
  const at = wonAt >= 0 ? wonAt : result.length;
  result.splice(at, 0, ...created);
  const inactive = existing.filter((stage) => !stage.isActive).length;
  return { stages: result, inactive, total: result.length + inactive };
}

/** Renames that actually change a name: they count as work for "Pasang". */
export function renameCount(
  plan: PipelineStagePlanItem[],
  stages: BlueprintStage[],
  existing: ExistingStage[],
  variables: Record<string, string>,
): number {
  return describePlan(plan, stages, existing, variables).filter((line) => line.kind === "rename").length;
}
