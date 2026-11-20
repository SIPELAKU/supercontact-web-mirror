"use client";

// Marks the stage quotations are built from, so it stays recognisable after
// a rename or a new colour. "pill" in the editor, "icon" in a board column.

import { Tooltip } from "@mui/material";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUOTATION_STAGE_HINT, QUOTATION_STAGE_LABEL } from "./stageRules";

export default function QuotationStageBadge({ variant = "pill", className }: { variant?: "pill" | "icon"; className?: string }) {
  return (
    <Tooltip title={QUOTATION_STAGE_HINT}>
      {variant === "icon" ? (
        <span
          tabIndex={0}
          aria-label={QUOTATION_STAGE_HINT}
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand focus-visible:outline-2 focus-visible:outline-brand",
            className,
          )}
        >
          <FileText className="h-3 w-3" aria-hidden />
        </span>
      ) : (
        <span
          tabIndex={0}
          aria-label={QUOTATION_STAGE_HINT}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand focus-visible:outline-2 focus-visible:outline-brand",
            className,
          )}
        >
          <FileText className="h-3 w-3" aria-hidden /> {QUOTATION_STAGE_LABEL}
        </span>
      )}
    </Tooltip>
  );
}
