"use client";

// A small picture of the board: one mini column per stage, in one row, in its
// colour. When it is wider than the dialog it scrolls sideways: drag it with
// the mouse (the cursor turns into a hand), swipe, or use the scrollbar.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { stageColor, stageTint } from "./stageRules";

interface StagePreviewProps {
  stages: { key: string; name: string; color: string | null }[];
  /** The stage being edited: outlined and scrolled into view. */
  highlightKey?: string;
  className?: string;
}

export default function StagePreview({ stages, highlightKey, className }: StagePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [scrollable, setScrollable] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stages.length]);

  useEffect(() => {
    if (!highlightKey) return;
    const el = ref.current?.querySelector<HTMLElement>(`[data-preview-key="${CSS.escape(highlightKey)}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [highlightKey]);

  return (
    <div
      ref={ref}
      aria-label="Board preview"
      className={cn(
        // No scrollbar: it scrolls by dragging (or swiping). The padding keeps
        // the edited stage's outline from being cut off.
        "scrollbar-hide flex select-none flex-nowrap gap-2 overflow-x-auto p-1",
        scrollable && (dragging ? "cursor-grabbing" : "cursor-grab"),
        className,
      )}
      onPointerDown={(event) => {
        // Mouse only: a finger already scrolls it natively.
        if (!scrollable || event.pointerType !== "mouse" || event.button !== 0) return;
        drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x;
        if (Math.abs(dx) > 2) drag.current.moved = true;
        event.currentTarget.scrollLeft = drag.current.left - dx;
      }}
      onPointerUp={() => {
        drag.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
    >
      {stages.map((stage) => (
        <div
          key={stage.key}
          data-preview-key={stage.key}
          className={cn(
            "flex h-16 w-[96px] shrink-0 flex-col gap-1.5 rounded-lg border p-1.5",
            stage.key === highlightKey ? "border-brand ring-2 ring-brand/30" : "border-gray-200",
          )}
          style={{ backgroundColor: stageTint(stage.color, 0.1) }}
        >
          <span className="h-1 w-full shrink-0 rounded-full" style={{ backgroundColor: stageColor(stage.color) }} />
          <span className="line-clamp-2 break-words text-[11px] font-medium leading-tight text-gray-800" title={stage.name}>
            {stage.name.trim() || "Untitled"}
          </span>
        </div>
      ))}
    </div>
  );
}
