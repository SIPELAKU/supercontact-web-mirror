"use client";

// The ⋮ menu at the top right of a board column (Admin only): Edit / Delete.
// The delete rule is the gear dialog's (stageRules.ts), on the stage's
// total_deals, which ignores the board's filters. A delete that is not
// allowed is disabled, with the reason written under it.

import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { Lock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteBlockReason, stageColor } from "./stageRules";

interface StageColumnMenuProps {
  stageName: string;
  color: string | null;
  isLocked: boolean;
  totalDeals: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function StageColumnMenu({ stageName, color, isLocked, totalDeals, onEdit, onDelete }: StageColumnMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const blocked = deleteBlockReason({ isLocked, dealCount: totalDeals });
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  return (
    <>
      <button
        type="button"
        aria-label={`Options for ${stageName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className={cn(
          "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:text-gray-900 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-brand",
          open && "bg-white text-gray-900 shadow-sm",
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { mt: 0.5, width: 248, borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)", border: "1px solid #EEF0F4" },
          },
        }}
        MenuListProps={{ sx: { p: 0.75 } }}
      >
        {/* Which stage this is about, so a menu opened at the board's edge is unambiguous. */}
        <div className="flex items-center gap-2 px-2.5 pb-2 pt-1.5" role="presentation">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stageColor(color) }} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{stageName}</span>
          {isLocked && <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-label="Required stage" />}
        </div>
        <div className="mx-1 mb-1 h-px bg-gray-100" role="presentation" />
        <MenuItem
          onClick={() => {
            close();
            onEdit();
          }}
          sx={{ borderRadius: 2, px: 1.25, py: 1, gap: 1.5 }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
            <Pencil className="h-4 w-4" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Edit</span>
            <span className="text-xs text-gray-500">Name and colour</span>
          </span>
        </MenuItem>
        <MenuItem
          disabled={Boolean(blocked)}
          onClick={() => {
            close();
            onDelete();
          }}
          sx={{ borderRadius: 2, px: 1.25, py: 1, gap: 1.5, alignItems: "flex-start", "&.Mui-disabled": { opacity: 1 } }}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              blocked ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-600",
            )}
          >
            <Trash2 className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col whitespace-normal">
            <span className={cn("text-sm font-medium", blocked ? "text-gray-400" : "text-red-600")}>Delete</span>
            <span className="text-xs text-gray-500">{blocked ?? "Remove this stage"}</span>
          </span>
        </MenuItem>
      </Menu>
    </>
  );
}
