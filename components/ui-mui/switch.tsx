"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked = false,
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-primary" : "bg-input dark:bg-input/80",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background transition-transform",
          checked
            ? "translate-x-[calc(100%-2px)]"
            : "translate-x-0 dark:bg-foreground"
        )}
      />
    </button>
  );
}
