import { pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";
import type { StageUI } from "@/lib/helper/transformPipeline";

const hasDeal = (stage: StageUI, dealId: string) => stage.deals.some((d) => String(d.id) === dealId);

/**
 * The drop target is the column under the pointer, over its whole height
 * (also below its last card, so a short column takes a drop without scrolling
 * up to its cards). Cards are never targets: the order inside a column is the
 * API's sort. Off every column, the column the dragged card overlaps.
 */
export const columnCollision: CollisionDetection = (args) => {
  const columns = {
    ...args,
    droppableContainers: args.droppableContainers.filter((c) => String(c.id).startsWith("column-")),
  };
  const underPointer = pointerWithin(columns);
  return underPointer.length > 0 ? underPointer : rectIntersection(columns);
};

/**
 * The column a drag is over: a column itself (`column-<name>`), or the column
 * of the card it is over. null = not over the board.
 */
export function stageNameAt(stages: StageUI[], overId: string): string | null {
  const columnName = overId.startsWith("column-") ? overId.slice("column-".length) : overId;
  if (stages.some((s) => s.name === columnName)) return columnName;
  return stages.find((s) => hasDeal(s, overId))?.name ?? null;
}

/**
 * Where a dropped card goes in the target column: before the first card whose
 * middle is below the drop point (`cardRects` in column order, screen
 * coordinates). Worked out once, on drop, so nothing moves while dragging.
 */
export function dropIndex(cardRects: Array<{ top: number; height: number }>, dropY: number): number {
  const index = cardRects.findIndex((rect) => dropY < rect.top + rect.height / 2);
  return index === -1 ? cardRects.length : index;
}

/**
 * Moves a loaded card to another column, at `index` (where it was dropped;
 * last without one), and its amount with it, so both headers' count and total
 * stay right until the board reloads and puts it in its sorted place. A move
 * within its own column changes nothing: the order inside a column is the
 * API's sort.
 */
export function moveDealToColumn(stages: StageUI[], dealId: string, toStage: string, index?: number): StageUI[] {
  const fromIndex = stages.findIndex((s) => hasDeal(s, dealId));
  const toIndex = stages.findIndex((s) => s.name === toStage);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return stages;

  const deal = stages[fromIndex].deals.find((d) => String(d.id) === dealId)!;
  const amount = Number(deal.amount) || 0;

  return stages.map((stage, i) => {
    if (i === fromIndex) {
      return {
        ...stage,
        deals: stage.deals.filter((d) => String(d.id) !== dealId),
        count: Math.max(0, stage.count - 1),
        value: stage.value - amount,
      };
    }
    if (i === toIndex) {
      const deals = [...stage.deals];
      deals.splice(index ?? deals.length, 0, deal);
      return { ...stage, deals, count: stage.count + 1, value: stage.value + amount };
    }
    return stage;
  });
}
