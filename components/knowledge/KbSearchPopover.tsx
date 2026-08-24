"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Loader2, Search, X } from "lucide-react";
import { Tooltip } from "@mui/material";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useKbSearch } from "@/lib/hooks/useKnowledge";
import { stripHtml } from "@/lib/utils/markdown";
import type { KbSearchHit } from "@/lib/types/knowledge";

interface KbSearchPopoverProps {
  // Called with the Markdown snippet to insert into the composer. The composer
  // owns where it lands (caret / append) so its own draft-autosave still fires.
  onInsert: (markdown: string) => void;
  // Popover opens upward (composer pinned to the bottom, e.g. Workspace) or
  // downward (composer above its content, e.g. the ticket thread).
  direction?: "up" | "down";
  disabled?: boolean;
}

// Builds the Markdown that gets inserted: the title as a link plus the article
// excerpt/snippet as plain text. There is no public help-center base URL defined
// in this app, so the link is a site-relative `/help/{slug}` the agent can edit
// before sending.
function hitToMarkdown(hit: KbSearchHit): string {
  const summary = stripHtml(hit.excerpt || hit.snippet || "");
  const link = `[${hit.title}](/help/${hit.slug})`;
  return summary ? `${link}\n${summary}\n` : `${link}\n`;
}

type Coords = { left: number; top?: number; bottom?: number };

// Reusable "Knowledge base" search button + popover, shared by the Workspace
// conversation composer and the ticket reply composer (Deliverable 3) so the
// search/insert logic lives in exactly one place. The dropdown is portaled to
// <body> with fixed positioning so an `overflow-hidden` composer box (Workspace)
// can't clip it.
export function KbSearchPopover({ onInsert, direction = "up", disabled }: KbSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const debounced = useDebounce(query, 300);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: hits = [], isFetching, isError } = useKbSearch(debounced);
  const trimmed = debounced.trim();
  const showHint = trimmed.length < 2;

  const compute = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const width = 340;
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    if (direction === "up") {
      setCoords({ left, bottom: window.innerHeight - r.top + 8 });
    } else {
      setCoords({ left, top: r.bottom + 8 });
    }
  }, [direction]);

  // Recompute position on open, and keep it pinned to the button on scroll/resize.
  useEffect(() => {
    if (!open) return;
    compute();
    requestAnimationFrame(() => inputRef.current?.focus());
    const onChange = () => compute();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [open, compute]);

  // Close on outside click (button and portaled dropdown both count as inside).
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const handleSelect = (hit: KbSearchHit) => {
    onInsert(hitToMarkdown(hit));
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Tooltip title="Insert from Knowledge Base" arrow>
        <span>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={disabled}
            aria-label="Search the knowledge base"
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              open ? "bg-[#EEF2FD] text-[#3E63D8]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <BookOpen className="h-[17px] w-[17px]" />
          </button>
        </span>
      </Tooltip>

      {open && coords &&
        createPortal(
          <div
            ref={dropdownRef}
            role="dialog"
            aria-label="Knowledge base search"
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              bottom: coords.bottom,
            }}
            className="z-[60] w-[340px] max-w-[calc(100vw-16px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpen(false);
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (hits.length > 0) handleSelect(hits[0]);
                  }
                }}
                placeholder="Search knowledge base…"
                className="w-full bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {showHint ? (
                <p className="px-3 py-4 text-center text-[12.5px] text-gray-400">
                  Type at least 2 characters to search.
                </p>
              ) : isFetching ? (
                <p className="flex items-center justify-center gap-2 px-3 py-4 text-[12.5px] text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching…
                </p>
              ) : isError ? (
                <p className="px-3 py-4 text-center text-[12.5px] text-red-500">
                  Search failed. Try again.
                </p>
              ) : hits.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12.5px] text-gray-400">
                  No articles found for “{trimmed}”.
                </p>
              ) : (
                <ul>
                  {hits.map((hit) => {
                    const snippet = stripHtml(hit.snippet || hit.excerpt || "");
                    return (
                      <li key={hit.article_id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(hit)}
                          className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-[#EEF2FD]"
                        >
                          <span className="truncate text-[13px] font-semibold text-gray-800">
                            {hit.title}
                          </span>
                          {snippet && (
                            <span className="line-clamp-2 text-[12px] text-gray-500">{snippet}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
