"use client";

// Activate/deactivate and delete for one stage row. A blocked action stays
// visible, greyed, with the reason from stageRules.ts in its tooltip (shown on
// hover and on keyboard focus, so it is not disabled outright).

import { Tooltip } from "@mui/material";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deactivateBlockReason, deleteBlockReason, type StageDraftRow } from "./stageRules";

interface StageRowActionsProps {
  row: StageDraftRow;
  onDelete: () => void;
  /** Present in the gear dialog only. */
  onToggleActive?: () => void;
  toggling?: boolean;
  disabled?: boolean;
}

function ActionButton({
  label,
  reason,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  reason: string | null;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const blocked = Boolean(reason) || Boolean(disabled);
  return (
    <Tooltip title={reason ?? label}>
      <button
        type="button"
        aria-label={label}
        aria-disabled={blocked || undefined}
        onClick={blocked ? undefined : onClick}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
          blocked
            ? "cursor-not-allowed text-gray-300"
            : danger
              ? "cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600"
              : "cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-800",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export default function StageRowActions({ row, onDelete, onToggleActive, toggling, disabled }: StageRowActionsProps) {
  const name = row.name.trim() || "this stage";
  return (
    <div className="flex items-center gap-1">
      {onToggleActive && (
        <ActionButton
          label={row.isActive ? `Deactivate ${name}` : `Activate ${name}`}
          reason={row.isActive ? deactivateBlockReason(row) : null}
          onClick={onToggleActive}
          disabled={disabled || toggling || !row.id}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : row.isActive ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </ActionButton>
      )}
      <ActionButton label={`Delete ${name}`} reason={deleteBlockReason(row)} onClick={onDelete} disabled={disabled} danger>
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}
