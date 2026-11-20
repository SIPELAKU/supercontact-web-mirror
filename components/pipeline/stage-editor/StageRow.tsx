"use client";

// One stage in the editor: drag handle, colour, name, deal count, lock and
// the row actions.

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tooltip } from "@mui/material";
import { GripVertical, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import StageColorPicker from "./StageColorPicker";
import StageNameField from "./StageNameField";
import StageRowActions from "./StageRowActions";
import QuotationStageBadge from "./QuotationStageBadge";
import { canMove, isQuotationStage, type StageDraftRow } from "./stageRules";

interface StageRowProps {
  row: StageDraftRow;
  /** Changes when the list is reloaded: the name field starts over. */
  resetKey?: number;
  error?: string;
  /** Saving: nothing can be changed or moved. */
  disabled?: boolean;
  /** Show the deal count (not in the setup, where nothing has deals). */
  showDeals?: boolean;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onToggleActive?: () => void;
  toggling?: boolean;
}

export default function StageRow({
  row,
  resetKey,
  error,
  disabled,
  showDeals,
  onNameChange,
  onColorChange,
  onDelete,
  onToggleActive,
  toggling,
}: StageRowProps) {
  const movable = canMove(row) && !disabled;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: row.key,
    disabled: !movable,
  });
  const editable = row.isActive && !disabled;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 rounded-xl border bg-white p-2.5 sm:gap-3 sm:p-3",
        isDragging ? "z-10 border-brand shadow-lg" : "border-gray-200",
        !row.isActive && "bg-gray-50 opacity-60",
      )}
    >
      {movable ? (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Move ${row.name || "stage"}`}
          className="mt-2 flex h-6 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-gray-400 hover:text-gray-700 active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-brand"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <span className="mt-2 h-6 w-5 shrink-0" aria-hidden />
      )}

      <div className="mt-1.5">
        <StageColorPicker value={row.color} onChange={onColorChange} stageName={row.name} disabled={!editable} />
      </div>

      <div className="min-w-0 flex-1">
        <StageNameField key={resetKey} row={row} onChange={onNameChange} error={error} disabled={!editable} />
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {row.isLocked && (
            <Tooltip title="Required stage — can be renamed, not deleted">
              <span tabIndex={0} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 focus-visible:outline-2 focus-visible:outline-brand">
                <Lock className="h-3 w-3" aria-hidden /> Required
              </span>
            </Tooltip>
          )}
          {isQuotationStage(row) && <QuotationStageBadge />}
          {showDeals && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
              {row.dealCount} {row.dealCount === 1 ? "deal" : "deals"}
            </span>
          )}
          {!row.isActive && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Inactive</span>
          )}
        </div>
      </div>

      <div className="mt-1">
        <StageRowActions row={row} onDelete={onDelete} onToggleActive={onToggleActive} toggling={toggling} disabled={disabled} />
      </div>
    </li>
  );
}
