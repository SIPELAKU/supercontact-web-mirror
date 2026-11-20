// components/pipeline/stage-editor/stageRules.ts
//
// The rules of the pipeline stage editor, with no UI: the default stages, the
// name suggestions, the colour palette, the locked order, what blocks a delete
// or a deactivate, and who may manage stages. The setup dialog, the gear
// dialog and the column menu all read them from here, so they always agree.
//
// A stage's job is its `outcome` (API 1.170.0), never its name: a company may
// rename every stage.

import type { PipelineStage, StageOutcome } from "@/lib/types/PipelineStage";

/** One row of the editor: a saved stage, or one added and not saved yet. */
export interface StageDraftRow {
  /** Stable React/dnd key: the stage id, or "new-<n>" before it is saved. */
  key: string;
  /** null until saved. */
  id: string | null;
  name: string;
  color: string;
  outcome: StageOutcome;
  isLocked: boolean;
  isActive: boolean;
  /** Every deal on the stage (0 for a new one). */
  dealCount: number;
  /** For the name suggestions of Qualified/Negotiation, which are plain open
   *  stages: the default name this stage started from, if any. */
  defaultName?: string;
}

/** Neutral colour for a stage without one (a stage outside the catalogue). */
export const FALLBACK_STAGE_COLOR = "#9CA3AF";

/** Colours offered in the editor. The first six are the default stages'. */
export const STAGE_PALETTE = [
  "#26C6F9",
  "#FDB528",
  "#72E128",
  "#6D788D",
  "#666CFF",
  "#EF4444",
  "#9CA3AF",
  "#F97316",
  "#EC4899",
  "#14B8A6",
] as const;

export const DEFAULT_STAGES: { name: string; outcome: StageOutcome; color: string }[] = [
  { name: "Prospect", outcome: "entry", color: "#26C6F9" },
  { name: "Qualified", outcome: "open", color: "#FDB528" },
  { name: "Negotiation", outcome: "open", color: "#72E128" },
  { name: "Proposal", outcome: "quotation", color: "#6D788D" },
  { name: "Closed - Won", outcome: "won", color: "#666CFF" },
  { name: "Closed - Lost", outcome: "lost", color: "#EF4444" },
];

export const STAGE_NAME_MAX = 100;

/** At most this many stages per company, inactive ones included (BE enforces
 *  it too). A company already above it keeps its stages but can't add more. */
export const MAX_STAGES = 8;

export const canAddStage = (count: number) => count < MAX_STAGES;

/** "6 of 8 stages", with how many of them are inactive. */
export function stageCountLabel(count: number, inactive = 0): string {
  return `${count} of ${MAX_STAGES} stages${inactive > 0 ? ` (${inactive} inactive)` : ""}`;
}

/** Why Add Stage is gone, or null while a stage can still be added. */
export function stageLimitMessage(count: number, inactive = 0): string | null {
  if (canAddStage(count)) return null;
  const inactiveNote = inactive > 0 ? ` Inactive stages count too (${inactive} here).` : "";
  return count === MAX_STAGES
    ? `You've reached the maximum of ${MAX_STAGES} stages. Delete a stage to add another.${inactiveNote}`
    : `This pipeline has ${count} stages, more than the maximum of ${MAX_STAGES}. They all keep working, but you can only add a stage after deleting enough to get below ${MAX_STAGES}.${inactiveNote}`;
}

/** The four required stages, found by what they do. */
const LOCKED_OUTCOMES: StageOutcome[] = ["entry", "quotation", "won", "lost"];

/** Five suggestions per default stage; the default name itself comes first. */
const SYNONYMS_BY_OUTCOME: Partial<Record<StageOutcome, { name: string; options: string[] }>> = {
  entry: { name: "Prospect", options: ["Lead", "New Lead", "Inquiry", "Opportunity", "Contacted"] },
  quotation: { name: "Proposal", options: ["Quotation", "Quote Sent", "Offer", "Proposal Sent", "Pricing"] },
  won: { name: "Closed - Won", options: ["Won", "Deal Won", "Closed Deal", "Success", "Converted"] },
  lost: { name: "Closed - Lost", options: ["Lost", "Deal Lost", "Not Interested", "Cancelled", "Disqualified"] },
};

/** Qualified and Negotiation are plain open stages, so they are found by name. */
const SYNONYMS_BY_NAME: Record<string, string[]> = {
  Qualified: ["Qualified Lead", "Discovery", "Needs Analysis", "Interested", "Evaluation"],
  Negotiation: ["Negotiating", "In Negotiation", "Commitment", "Contract Review", "Decision"],
};

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The open stage's default name, when its current name is that default or
 *  one of its suggestions ("Interested" -> "Qualified"). */
export function defaultNameFor(name: string): string | undefined {
  return Object.entries(SYNONYMS_BY_NAME).find(
    ([base, options]) => sameName(base, name) || options.some((option) => sameName(option, name)),
  )?.[0];
}

/** The names offered in the dropdown (default name first), or null for a
 *  stage that only has a free text field (one the company added). */
export function nameSuggestions(row: Pick<StageDraftRow, "outcome" | "name" | "defaultName">): string[] | null {
  const byOutcome = SYNONYMS_BY_OUTCOME[row.outcome];
  if (byOutcome) return [byOutcome.name, ...byOutcome.options];
  const base = row.defaultName ?? defaultNameFor(row.name);
  return base ? [base, ...SYNONYMS_BY_NAME[base]] : null;
}

export function isLockedOutcome(outcome: StageOutcome): boolean {
  return LOCKED_OUTCOMES.includes(outcome);
}

/** Prospect stays first, Won and Lost stay last: they have no drag handle. */
export function isPinned(row: Pick<StageDraftRow, "outcome">): boolean {
  return row.outcome === "entry" || row.outcome === "won" || row.outcome === "lost";
}

/** Can be dragged: an active stage that is not pinned. */
export function canMove(row: Pick<StageDraftRow, "outcome" | "isActive">): boolean {
  return row.isActive && !isPinned(row);
}

const rank = (row: Pick<StageDraftRow, "outcome" | "isActive">) =>
  !row.isActive ? 4 : row.outcome === "entry" ? 0 : row.outcome === "won" ? 2 : row.outcome === "lost" ? 3 : 1;

/** Entry first, then the other active stages in their order, then Won, Lost,
 *  and the inactive ones at the bottom. Stable within each group. */
export function normalizeOrder<T extends Pick<StageDraftRow, "outcome" | "isActive">>(rows: T[]): T[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => rank(a.row) - rank(b.row) || a.index - b.index)
    .map(({ row }) => row);
}

/** Moves a draggable row to where `overKey` is, kept between the pinned
 *  stages. Anything else (a pinned or inactive row, an unknown key) leaves
 *  the list as it was. */
export function moveRow<T extends StageDraftRow>(rows: T[], activeKey: string, overKey: string): T[] {
  const from = rows.findIndex((row) => row.key === activeKey);
  const to = rows.findIndex((row) => row.key === overKey);
  if (from < 0 || to < 0 || from === to || !canMove(rows[from])) return rows;
  const middle = rows.filter((row) => canMove(row));
  const target = rows[to];
  // Dropped on a pinned row: the nearest end of the movable block.
  const targetIndex = canMove(target)
    ? middle.indexOf(target)
    : target.outcome === "entry"
      ? 0
      : middle.length - 1;
  const moving = rows[from];
  const reordered = middle.filter((row) => row !== moving);
  reordered.splice(targetIndex, 0, moving);
  let next = 0;
  return rows.map((row) => (canMove(row) ? reordered[next++] : row));
}

/** A new or re-activated stage goes right before Won. */
export function insertBeforeWon<T extends StageDraftRow>(rows: T[], row: T): T[] {
  const others = rows.filter((r) => r.key !== row.key);
  const at = others.findIndex((r) => r.isActive && r.outcome === "won");
  const firstInactive = others.findIndex((r) => !r.isActive);
  const index = at >= 0 ? at : firstInactive >= 0 ? firstInactive : others.length;
  return [...others.slice(0, index), row, ...others.slice(index)];
}

/** Why a stage can't be deleted (the tooltip), or null when it can. */
export function deleteBlockReason(row: Pick<StageDraftRow, "isLocked" | "dealCount">): string | null {
  if (row.isLocked) return "Required stages can't be deleted";
  if (row.dealCount > 0) return `${row.dealCount} deal(s) are still in this stage. Move them first.`;
  return null;
}

/** Why a stage can't be deactivated (the tooltip), or null when it can. */
export function deactivateBlockReason(row: Pick<StageDraftRow, "isLocked">): string | null {
  return row.isLocked ? "Required stages can't be deactivated" : null;
}

/** The stage quotations are built from (outcome "quotation"), whatever it is
 *  called: the quotation form lists the customers with a deal here and adds
 *  those deals' products as items (BE proposal_pipeline_conditions). */
export const isQuotationStage = (row: Pick<StageDraftRow, "outcome">) => row.outcome === "quotation";
export const QUOTATION_STAGE_LABEL = "Quotation";
export const QUOTATION_STAGE_HINT =
  "Quotation stage: when you create a quotation, customers with a deal here can be picked and their deals' products are added as items. Renaming or recolouring the stage doesn't change this.";

export const deleteConfirmTitle = (name: string) => `Delete stage ${name.trim() || "this stage"}?`;

/** Errors per row key, shown under the name field. Names are compared without
 *  case and surrounding spaces, against every row (inactive ones too: the
 *  API keeps names unique per company). */
export function validateNames(rows: Pick<StageDraftRow, "key" | "name">[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const seen = new Map<string, string>();
  for (const row of rows) {
    const name = row.name.trim();
    if (!name) {
      errors[row.key] = "Name is required";
      continue;
    }
    if (name.length > STAGE_NAME_MAX) {
      errors[row.key] = `Name must be ${STAGE_NAME_MAX} characters or fewer`;
      continue;
    }
    const lower = name.toLowerCase();
    if (seen.has(lower)) errors[row.key] = "Another stage already has this name";
    else seen.set(lower, row.key);
  }
  return errors;
}

/** Only an Admin manages stages. Role names are matched loosely ("ADMIN",
 *  " admin "), like dealAssignment.ts. */
export function canManageStages(role: string | null | undefined): boolean {
  return (role ?? "").toLowerCase().replace(/[^a-z]/g, "") === "admin";
}

/** "#26c6f9" / "26C6F9" / "#abc" -> "#26C6F9" / "#AABBCC"; null when not a hex colour. */
export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toUpperCase()}`;
  if (/^[0-9a-f]{3}$/i.test(hex)) return `#${hex.split("").map((c) => c + c).join("").toUpperCase()}`;
  return null;
}

/** The colour at `alpha` opacity, for the column background (about 10%) and
 *  the chips (16%). Anything that is not a hex colour uses the neutral one. */
export function stageTint(color: string | null | undefined, alpha: number): string {
  const hex = normalizeHex(color ?? "") ?? FALLBACK_STAGE_COLOR;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const stageColor = (color: string | null | undefined) => normalizeHex(color ?? "") ?? FALLBACK_STAGE_COLOR;

/** Rows for the Customize step: the six defaults, nothing saved yet. */
export function defaultDraftRows(): StageDraftRow[] {
  return DEFAULT_STAGES.map((stage, index) => ({
    key: `default-${index}`,
    id: null,
    name: stage.name,
    color: stage.color,
    outcome: stage.outcome,
    isLocked: isLockedOutcome(stage.outcome),
    isActive: true,
    dealCount: 0,
    defaultName: SYNONYMS_BY_NAME[stage.name] ? stage.name : undefined,
  }));
}

/** Rows from `GET /pipeline-stages`, in the editor's order. */
export function rowsFromStages(stages: PipelineStage[]): StageDraftRow[] {
  const sorted = [...stages].sort((a, b) => a.display_order - b.display_order);
  return normalizeOrder(
    sorted.map((stage) => ({
      key: stage.id,
      id: stage.id,
      name: stage.name,
      color: stageColor(stage.color),
      outcome: stage.outcome,
      isLocked: Boolean(stage.is_locked),
      isActive: stage.is_active,
      dealCount: stage.deal_count ?? 0,
      defaultName: stage.outcome === "open" ? defaultNameFor(stage.name) : undefined,
    })),
  );
}
