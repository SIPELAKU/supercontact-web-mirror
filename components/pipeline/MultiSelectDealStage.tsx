"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { DealStage } from "@/components/pipeline/SelectDealStage";

interface Props {
  /** Picked stage values; empty = all. */
  value: string[];
  onChange: (val: string[]) => void;
  /** Options, including the "all" one that clears the selection. */
  data: DealStage[];
  placeholder?: string;
  className?: string;
}

// Chips shown in the trigger before the rest collapse into "+N".
const MAX_CHIPS = 2;

/**
 * Multi-select twin of CustomDealStageSelect (same look). Clicking a stage
 * toggles it and keeps the list open; "All" clears the selection.
 */
export default function MultiSelectDealStage({
  value,
  onChange,
  data,
  placeholder = "Select Data",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const picked = data.filter((s) => s.value !== "all" && value.includes(s.value));

  const toggle = (stage: DealStage) => {
    if (stage.value === "all") {
      onChange([]);
      return;
    }
    onChange(value.includes(stage.value) ? value.filter((v) => v !== stage.value) : [...value, stage.value]);
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full h-[48px] px-3 flex items-center justify-between gap-2 border bg-white border-gray-300 hover:border-gray-400 rounded-lg"
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {picked.length === 0 ? (
            <span className="text-sm text-gray-500">{placeholder}</span>
          ) : (
            <>
              {picked.slice(0, MAX_CHIPS).map((stage) => (
                <span
                  key={stage.value}
                  className={cn("shrink-0 px-3 py-1 rounded-full text-sm font-medium", stage.bgColor, stage.textColor)}
                >
                  {stage.label}
                </span>
              ))}
              {picked.length > MAX_CHIPS && (
                <span className="shrink-0 text-sm font-medium text-gray-500">+{picked.length - MAX_CHIPS}</span>
              )}
            </>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 shrink-0 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2 max-h-72 overflow-auto"
        >
          {data.map((stage) => {
            const selected = stage.value === "all" ? value.length === 0 : value.includes(stage.value);
            return (
              <div
                key={stage.value}
                role="option"
                aria-selected={selected}
                onClick={() => toggle(stage)}
                className="px-2 py-2 rounded-md cursor-pointer flex justify-between items-center hover:bg-gray-50"
              >
                <span className={cn(stage.bgColor && "px-3 py-1 rounded-full", stage.bgColor, stage.textColor)}>
                  {stage.label}
                </span>
                {selected && <span>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
