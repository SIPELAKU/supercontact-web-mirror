"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search as SearchIcon } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";

export interface DealStage {
  value: string;
  label: string;
  bgColor?: string;
  textColor?: string;
}

interface Props {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  data: DealStage[];
  className?: string;
  isSearch?: boolean;
  disabled?: boolean;
}

const radiusFromClass = (className?: string) => {
  if (!className) return "12px";
  if (className.includes("rounded-full")) return "9999px";
  if (className.includes("rounded-2xl")) return "16px";
  if (className.includes("rounded-xl")) return "12px";
  if (className.includes("rounded-lg")) return "8px";
  if (className.includes("rounded-md")) return "6px";
  return "12px";
};

const fontSizeFromClass = (className?: string) => {
  if (!className) return "text-sm";
  if (className.includes("text-xs")) return "text-xs";
  if (className.includes("text-sm")) return "text-sm";
  if (className.includes("text-base")) return "text-base";
  if (className.includes("text-lg")) return "text-lg";
  return "text-sm";
};

export default function CustomDealStageSelect({
  value,
  placeholder = "Select Data",
  onChange,
  onSearch,
  loading,
  data,
  className,
  isSearch = false,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [searchText, setSearchText] = useState("");
  const [selectedStage, setSelectedStage] = useState<DealStage | null>(null);

  const debounced = useDebounce(searchText, 300);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const radius = radiusFromClass(className);
  const fontSizeCls = fontSizeFromClass(className);

  useEffect(() => {
    if (!value || value === "all") {
      setSelectedStage(null);
      return;
    }

    const found = data.find((s) => s.value === value);
    if (found) {
      setSelectedStage(found);
    }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) setSearchText("");
  }, [open]);

  useEffect(() => {
    if (disabled || !isSearch || !onSearch) return;
    onSearch(debounced);
  }, [debounced]);

  const filteredStages = useMemo(() => {
    if (!isSearch) return data;

    if (!searchText.trim()) {
      return selectedStage ? [selectedStage] : [];
    }

    return data.filter((s) =>
      s.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, data, isSearch, selectedStage]);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "w-full h-11 px-3 flex items-center justify-between border shadow-sm",
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-gray-400"
        )}
        style={{ borderRadius: radius }}
      >
        <div className="flex items-center min-h-10">
          {!selectedStage ? (
            <span className={cn("text-gray-500", fontSizeCls)}>
              {placeholder}
            </span>
          ) : selectedStage.bgColor ? (
            <span
              className={cn(
                "px-3 py-1 rounded-full font-medium",
                fontSizeCls,
                selectedStage.bgColor,
                selectedStage.textColor
              )}
            >
              {selectedStage.label}
            </span>
          ) : (
            <span className={cn("font-medium", fontSizeCls)}>
              {selectedStage.label}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2 max-h-72 overflow-auto">
          {isSearch && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <SearchIcon className="w-4 h-4 text-gray-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-sm outline-none"
                placeholder="Search..."
              />
            </div>
          )}

          {!loading &&
            filteredStages.map((stage, idx) => (
              <div
                key={stage.value}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => {
                  setSelectedStage(stage);
                  onChange(stage.value);
                  setOpen(false);
                }}
                className={cn(
                  "px-2 py-2 rounded-md cursor-pointer flex justify-between",
                  highlighted === idx ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <span
                  className={cn(
                    "px-3 py-1 rounded-full",
                    stage.bgColor,
                    stage.textColor
                  )}
                >
                  {stage.label}
                </span>
                {stage.value === value && <span>✓</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
