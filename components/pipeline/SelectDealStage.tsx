"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
  dealStages: DealStage[];
  className?: string;
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
  placeholder = "Select Stage",
  onChange,
  dealStages,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const radius = radiusFromClass(className);
  const fontSizeCls = fontSizeFromClass(className);

  const selectedIndex = dealStages.findIndex((s) => s.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    setOpen((v) => !v);
    if (!open) {
      setHighlighted(selectedIndex >= 0 ? selectedIndex : -1);
      setTimeout(() => listRef.current?.focus(), 10);
    } else {
      setHighlighted(-1);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block w-full", className)}
      style={{ minWidth: 220 }}
    >

      <button
        type="button"
        onClick={toggle}
        className="w-full h-11 px-3 flex items-center justify-between bg-white text-left border border-gray-300 shadow-sm transition"
        style={{ borderRadius: radius }}
      >

        <div className={cn("flex items-center min-h-10")}>
          {value && value !== "all" ? (
            (() => {
              const stage = dealStages.find((s) => s.value === value);

              if (!stage?.bgColor && !stage?.textColor) {
                return (
                  <span className={cn("font-medium text-gray-800", fontSizeCls)}>
                    {stage?.label}
                  </span>
                );
              }

              return (
                <span
                  className={cn(
                    "px-3 py-1 rounded-full font-medium",
                    fontSizeCls,
                    stage?.bgColor,
                    stage?.textColor
                  )}
                >
                  {stage?.label}
                </span>
              );
            })()
          ) : (
            <span
              className={cn(
                "text-gray-500 opacity-80 font-normal",
                fontSizeCls
              )}
            >
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          className={cn(
            "absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-64 overflow-auto",
            "animate-fade-in"
          )}
          style={{ animation: "fade-in 0.12s ease-out" }}
        >
          {dealStages.map((stage, idx) => {
            const isSelected = stage.value === value;
            const isHighlighted = idx === highlighted;

            return (
              <div
                key={stage.value}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => {
                  onChange(stage.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-2 py-2 cursor-pointer rounded-md",
                  isHighlighted ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <span
                  className={cn(
                    "px-3 py-1 rounded-full font-medium",
                    fontSizeCls,
                    stage.bgColor,
                    stage.textColor
                  )}
                >
                  {stage.label}
                </span>

                {isSelected && (
                  <span className="text-gray-500 text-sm">✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
