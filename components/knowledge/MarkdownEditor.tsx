"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/utils/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeightClassName?: string;
}

// Markdown textarea + live preview. The repo has no shared rich-text editor
// (the ticket / workspace composers are plain textareas; the email builder uses
// Unlayer, unsuitable for KB prose), so KB bodies are authored as Markdown and
// stored verbatim by the backend. renderMarkdown() escapes-then-transforms, so
// the preview's dangerouslySetInnerHTML is limited to a known-safe tag set.
export function MarkdownEditor({
  value,
  onChange,
  disabled,
  placeholder,
  minHeightClassName = "min-h-[420px]",
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-1 border-b border-gray-100 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            tab === "write" ? "bg-[#EEF2FD] text-[#3E63D8]" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            tab === "preview" ? "bg-[#EEF2FD] text-[#3E63D8]" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <span className="ml-auto pr-2 text-[11px] text-gray-400">Markdown supported</span>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? "Write the article body in Markdown…"}
          className={cn(
            "w-full resize-y bg-transparent px-4 py-3 font-mono text-[13.5px] leading-relaxed text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60",
            minHeightClassName
          )}
        />
      ) : (
        <div className={cn("overflow-y-auto px-4 py-3", minHeightClassName)}>
          {value.trim() ? (
            <div
              className="kb-prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <p className="text-sm text-gray-400">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
