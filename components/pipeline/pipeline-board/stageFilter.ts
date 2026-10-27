import type { StageUI } from "@/lib/helper/transformPipeline";

// "Closed-Won", "Closed - Won" and "closed - won" are the same stage.
const normalizeStage = (name: string) => name.replace(/\s*-\s*/g, " - ").toLowerCase();

/**
 * The kanban's stage filter. No stage picked = every column keeps its deals;
 * otherwise only the picked columns do. Columns are never removed, only
 * emptied, so the board keeps its layout.
 */
export function filterStagesBySelection(stages: StageUI[], selected: string[]): StageUI[] {
  if (selected.length === 0) return stages;
  const picked = new Set(selected.map(normalizeStage));
  return stages.map((stage) => (picked.has(normalizeStage(stage.name)) ? stage : { ...stage, deals: [] }));
}
