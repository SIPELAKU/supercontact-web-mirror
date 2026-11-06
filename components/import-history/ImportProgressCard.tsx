"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import type { ImportDockCard, ImportDockTone } from "./importJobState";

interface ImportProgressCardProps {
  fileName: string;
  parts: number;
  card: ImportDockCard;
  // What a click does, as a tooltip.
  openLabel: string;
  onOpen: () => void;
  onClose: () => void;
}

const BAR_COLOR: Record<ImportDockTone, string> = {
  running: "bg-green-500",
  review: "bg-red-500",
  done: "bg-green-500",
  ended: "bg-gray-400",
};

// One imported file in the import dock. Display only.
export const ImportProgressCard = ({ fileName, parts, card, openLabel, onOpen, onClose }: ImportProgressCardProps) => {
  const width = card.percent ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className="w-80 cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-lg transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5479EE]"
      title={openLabel}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">{fileName}</p>
          {parts > 1 && <p className="text-xs text-gray-500">{parts} parts</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {card.reviews > 0 && (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
              aria-label={`${card.reviews} waiting for review`}
            >
              {card.reviews}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Stop following this import"
            title="Hide (the import keeps running)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {card.headline ? (
        // Finished: what happened instead of a bar.
        <div className="mt-2 flex items-center gap-2">
          {card.tone === "done" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          )}
          <span className={`font-medium ${card.tone === "done" ? "text-green-700" : "text-gray-700"}`}>
            {card.headline}
          </span>
          {card.total > 0 && (
            <span className="text-xs text-gray-500">· {card.total.toLocaleString()} rows</span>
          )}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full transition-all ${BAR_COLOR[card.tone]}`} style={{ width: `${width}%` }} />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-gray-600">
            {card.total > 0 ? `${card.processed.toLocaleString()} / ${card.total.toLocaleString()}` : "—"}
          </span>
        </div>
      )}

      <p className={`mt-1 truncate text-xs ${card.tone === "review" ? "text-red-600" : "text-gray-500"}`}>
        {card.summary}
      </p>
    </div>
  );
};
