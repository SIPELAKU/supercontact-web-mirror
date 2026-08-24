"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Drawer, Tooltip } from "@mui/material";
import {
  Sparkles,
  FileText,
  MessageSquareText,
  Wand2,
  Loader2,
  AlertCircle,
  Info,
  RefreshCw,
  Replace,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission } from "@/lib/hooks/usePermission";
import { handleError } from "@/lib/utils/errorHandler";
import {
  useCopilotSummarize,
  useCopilotSuggestReply,
  useCopilotRewrite,
} from "@/lib/hooks/useCopilot";
import type { CopilotTone } from "@/lib/api/ai-copilot";
import { CopilotSuggestReply } from "./CopilotSuggestReply";

// How Copilot output lands in the composer draft:
//   "append"  - suggested reply is inserted into the existing draft
//   "replace" - a rewrite swaps the whole draft for the rewritten version
// The composer owns the actual write so its draft-autosave still fires. Copilot
// NEVER sends - the human always presses Send.
export type CopilotInsertMode = "append" | "replace";

export interface CopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  // When present, Summarize + Suggest-reply are available (they need a
  // conversation). When null/undefined, only Rewrite is shown (it needs only the
  // draft text) - e.g. the ticket reply box or a not-yet-created conversation.
  conversationId?: string | null;
  // Read the composer's CURRENT draft text at click time (used by Rewrite).
  getDraft: () => string;
  // Write Copilot output into the composer draft. See CopilotInsertMode.
  onInsert: (text: string, mode: CopilotInsertMode) => void;
  // Optional language nudge for suggest-reply.
  locale?: string;
}

// The subset of drawer props a parent hands a presentational composer so it can
// mount <CopilotLauncher> without knowing the drawer's internals.
export type CopilotComposerConfig = Pick<
  CopilotDrawerProps,
  "conversationId" | "getDraft" | "onInsert" | "locale"
>;

type Tab = "summarize" | "suggest" | "rewrite";

const TONES: { value: CopilotTone; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "concise", label: "Concise" },
  { value: "empathetic", label: "Empathetic" },
];

// Shared "AI unavailable" notice - shown when the backend returns a null result
// (Groq unconfigured or the model call failed; it degrades gracefully rather
// than erroring).
function AiUnavailable() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>AI assist is unavailable right now. You can keep writing your reply as usual.</span>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 text-[12.5px] text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

// The shared Copilot drawer. Anchored right so it never gets clipped by an
// `overflow-hidden` composer box, and works identically from every composer.
export function CopilotDrawer({
  open,
  onClose,
  conversationId,
  getDraft,
  onInsert,
  locale,
}: CopilotDrawerProps) {
  const hasConversation = !!conversationId;
  const [tab, setTab] = useState<Tab>(hasConversation ? "summarize" : "rewrite");
  const [tone, setTone] = useState<CopilotTone>("friendly");

  const summarize = useCopilotSummarize();
  const suggest = useCopilotSuggestReply();
  const rewrite = useCopilotRewrite();

  // Results are conversation-scoped - drop them when the conversation changes so
  // a stale summary/suggestion can't linger after switching threads.
  useEffect(() => {
    summarize.reset();
    suggest.reset();
    rewrite.reset();
    setTab(hasConversation ? "summarize" : "rewrite");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // reset() does NOT abort an in-flight request, so a late response could still
  // repopulate .data AFTER the agent switched conversations - and get inserted
  // into the wrong thread's draft. Only surface a result whose originating
  // request matches the CURRENT conversationId. summarize/suggest carry the id
  // in React Query's .variables; rewrite (draft-based) is stamped via a ref.
  const rewriteConvRef: MutableRefObject<string | null | undefined> =
    useRef(conversationId);
  const summarizeIsCurrent =
    summarize.data != null && summarize.variables === conversationId;
  const suggestIsCurrent =
    suggest.data != null && suggest.variables?.conversationId === conversationId;
  const rewriteIsCurrent =
    rewrite.data != null && rewriteConvRef.current === conversationId;

  const runSummarize = () => {
    if (!conversationId) return;
    summarize.mutate(conversationId);
  };

  const runSuggest = () => {
    if (!conversationId) return;
    suggest.mutate({ conversationId, locale });
  };

  const runRewrite = () => {
    const draft = getDraft().trim();
    if (!draft) return;
    rewriteConvRef.current = conversationId;
    rewrite.mutate({ draft, tone });
  };

  const draftIsEmpty = getDraft().trim().length === 0;

  const tabs: { value: Tab; label: string; icon: typeof FileText }[] = hasConversation
    ? [
        { value: "summarize", label: "Summarize", icon: FileText },
        { value: "suggest", label: "Suggest reply", icon: MessageSquareText },
        { value: "rewrite", label: "Rewrite", icon: Wand2 },
      ]
    : [{ value: "rewrite", label: "Rewrite", icon: Wand2 }];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="flex h-full w-[380px] max-w-[90vw] flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEF2FD] text-[#3E63D8]">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-gray-900">AI Copilot</p>
              <p className="text-[11px] text-gray-400">Drafts only — you always press Send</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Copilot"
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-3 py-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition-colors",
                  active ? "bg-[#EEF2FD] text-[#3E63D8]" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* SUMMARIZE */}
          {tab === "summarize" && hasConversation && (
            <div className="flex flex-col gap-3">
              <p className="text-[12.5px] text-gray-500">
                Get a short summary of this conversation so far.
              </p>
              <button
                type="button"
                onClick={runSummarize}
                disabled={summarize.isPending}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#5479EE] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#3F66E0] disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                {summarizeIsCurrent ? "Regenerate summary" : "Summarize conversation"}
              </button>

              {summarize.isPending && <LoadingRow label="Summarizing…" />}
              {summarize.isError && (
                <ErrorNotice message={handleError(summarize.error, "Summarize")} />
              )}
              {summarizeIsCurrent &&
                (summarize.data!.summary ? (
                  <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-[13px] leading-relaxed text-gray-800">
                    {summarize.data.summary}
                  </div>
                ) : (
                  <AiUnavailable />
                ))}
            </div>
          )}

          {/* SUGGEST REPLY */}
          {tab === "suggest" && hasConversation && (
            <div className="flex flex-col gap-3">
              <p className="text-[12.5px] text-gray-500">
                Draft a reply grounded in your Knowledge Base. Review it before sending.
              </p>
              <button
                type="button"
                onClick={runSuggest}
                disabled={suggest.isPending}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#5479EE] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#3F66E0] disabled:opacity-50"
              >
                <MessageSquareText className="h-4 w-4" />
                {suggestIsCurrent ? "Regenerate" : "Suggest a reply"}
              </button>

              {suggest.isPending && <LoadingRow label="Drafting a reply…" />}
              {suggest.isError && (
                <ErrorNotice message={handleError(suggest.error, "Suggest reply")} />
              )}
              {suggestIsCurrent &&
                (suggest.data!.reply ? (
                  <CopilotSuggestReply
                    reply={suggest.data!.reply}
                    sources={suggest.data!.sources ?? []}
                    onInsert={() => onInsert(suggest.data!.reply as string, "append")}
                  />
                ) : (
                  <AiUnavailable />
                ))}
            </div>
          )}

          {/* REWRITE */}
          {tab === "rewrite" && (
            <div className="flex flex-col gap-3">
              <p className="text-[12.5px] text-gray-500">
                Rewrite your current draft in a different tone.
              </p>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Tone
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                        tone === t.value
                          ? "bg-[#5479EE] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {draftIsEmpty && (
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-[12.5px] text-gray-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Type a draft in the composer first, then rewrite it here.</span>
                </div>
              )}

              <button
                type="button"
                onClick={runRewrite}
                disabled={rewrite.isPending || draftIsEmpty}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#5479EE] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#3F66E0] disabled:opacity-50"
              >
                {rewrite.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {rewriteIsCurrent ? "Rewrite again" : "Rewrite my draft"}
              </button>

              {rewrite.isError && (
                <ErrorNotice message={handleError(rewrite.error, "Rewrite")} />
              )}
              {rewriteIsCurrent &&
                (rewrite.data!.rewrite ? (
                  <div className="flex flex-col gap-3">
                    <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-[13px] leading-relaxed text-gray-800">
                      {rewrite.data!.rewrite}
                    </div>
                    <button
                      type="button"
                      onClick={() => onInsert(rewrite.data!.rewrite as string, "replace")}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#5479EE] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#3F66E0]"
                    >
                      <Replace className="h-4 w-4" />
                      Replace draft
                    </button>
                  </div>
                ) : (
                  <AiUnavailable />
                ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export interface CopilotLauncherProps
  extends Omit<CopilotDrawerProps, "open" | "onClose"> {
  // Style override for the trigger button so it fits each composer's toolbar.
  className?: string;
  disabled?: boolean;
}

// The Copilot affordance to mount in a composer: a gated trigger button that
// opens the shared drawer. Renders NOTHING for users without copilot:use, so the
// whole feature is invisible to them.
export function CopilotLauncher({ className, disabled, ...drawerProps }: CopilotLauncherProps) {
  const { can } = usePermission();
  const [open, setOpen] = useState(false);

  if (!can("copilot:use")) return null;

  return (
    <>
      <Tooltip title="AI Copilot" arrow>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          aria-label="Open AI Copilot"
          aria-haspopup="dialog"
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            open ? "bg-[#EEF2FD] text-[#3E63D8]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
            className
          )}
        >
          <Sparkles className="h-[17px] w-[17px]" />
        </button>
      </Tooltip>

      <CopilotDrawer open={open} onClose={() => setOpen(false)} {...drawerProps} />
    </>
  );
}
