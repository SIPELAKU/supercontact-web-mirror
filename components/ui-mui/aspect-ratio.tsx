"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AspectRatioProps = {
  ratio?: number;
  className?: string;
  children: React.ReactNode;
};

export function AspectRatio({
  ratio = 1,
  className,
  children,
}: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn("relative w-full", className)}
      style={{
        paddingBottom: `${100 / ratio}%`,
      }}
    >
      <div className="absolute inset-0 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
