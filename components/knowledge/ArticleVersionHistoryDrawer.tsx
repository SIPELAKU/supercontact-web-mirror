"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { History, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKbArticleVersions } from "@/lib/hooks/useKnowledge";
import { renderMarkdown } from "@/lib/utils/markdown";
import type { KbArticleVersion } from "@/lib/types/knowledge";

interface ArticleVersionHistoryDrawerProps {
  articleId: string;
  open: boolean;
  onClose: () => void;
}

function formatDateTime(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Slide-over drawer listing an article's version history (GET .../versions).
// Selecting a version shows a read-only Markdown preview of that revision's body.
export function ArticleVersionHistoryDrawer({ articleId, open, onClose }: ArticleVersionHistoryDrawerProps) {
  const { data: versions = [], isLoading, isError } = useKbArticleVersions(articleId, open);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default the selection to the newest version once the list resolves.
  useEffect(() => {
    if (open && versions.length > 0 && !selectedId) {
      setSelectedId(versions[0].id);
    }
    if (!open) setSelectedId(null);
  }, [open, versions, selectedId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selected: KbArticleVersion | undefined = versions.find((v) => v.id === selectedId);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#5479EE]" />
            <h2 className="text-lg font-semibold text-gray-900">Version history</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close version history"
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Version list */}
          <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-100">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : isError ? (
              <p className="px-4 py-10 text-center text-sm text-red-500">Failed to load versions.</p>
            ) : versions.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">No versions yet.</p>
            ) : (
              <ul className="py-1">
                {versions.map((v) => {
                  const active = v.id === selectedId;
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(v.id)}
                        className={cn(
                          "flex w-full flex-col gap-0.5 border-l-2 px-4 py-3 text-left transition-colors",
                          active
                            ? "border-[#5479EE] bg-[#EEF2FD]"
                            : "border-transparent hover:bg-gray-50"
                        )}
                      >
                        <span className="text-[13px] font-semibold text-gray-800">
                          Version {v.version_number}
                        </span>
                        <span className="text-[11.5px] text-gray-500">{formatDateTime(v.created_at)}</span>
                        {v.edited_by_id && (
                          <span className="truncate text-[11px] text-gray-400">
                            by {v.edited_by_id.slice(0, 8)}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Selected version preview (read-only) */}
          <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
            {selected ? (
              <>
                <div className="mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-gray-900">{selected.title}</h3>
                  <p className="mt-1 text-[12px] text-gray-400">
                    Version {selected.version_number} · {formatDateTime(selected.created_at)}
                  </p>
                  {selected.excerpt && (
                    <p className="mt-2 text-sm italic text-gray-500">{selected.excerpt}</p>
                  )}
                </div>
                <div
                  className="kb-prose"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.body) }}
                />
              </>
            ) : (
              <p className="text-sm text-gray-400">Select a version to preview it.</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
