"use client";

import { BookOpen, Plus } from "lucide-react";
import type { CopilotSource } from "@/lib/api/ai-copilot";

interface CopilotSuggestReplyProps {
  reply: string;
  sources: CopilotSource[];
  // Drops the suggested reply into the composer draft. NEVER sends - the human
  // always presses Send afterwards.
  onInsert: () => void;
}

// Renders a grounded suggested reply: the prose body, the KB articles it was
// grounded in as citation chips, and an explicit Insert button. Kept as its own
// component so the drawer stays readable.
export function CopilotSuggestReply({ reply, sources, onInsert }: CopilotSuggestReplyProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-[13px] leading-relaxed text-gray-800">
        {reply}
      </div>

      {sources.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Grounded in
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <span
                key={s.slug}
                className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FD] px-2.5 py-1 text-[11.5px] font-medium text-[#3E63D8]"
                title={s.slug}
              >
                <BookOpen className="h-3 w-3" />
                {s.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onInsert}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#5479EE] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#3F66E0]"
      >
        <Plus className="h-4 w-4" />
        Insert into draft
      </button>
    </div>
  );
}
