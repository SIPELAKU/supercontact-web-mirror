"use client";

import React, { useEffect, useState } from "react";
import { Tooltip } from "@mui/material";
import { MessageSquare, StickyNote, Paperclip, Smile, Zap, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSendMessage, useCreateConversationNote } from "@/lib/hooks/useOmnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

type ComposerMode = "reply" | "note";

interface WorkspaceComposerProps {
  conversationId: string;
  contactFirstName?: string;
  disabled?: boolean;
}

// Composer with Reply (public) vs Internal note tabs, distinct styling per
// mode. Reply -> useSendMessage; Internal note -> useCreateConversationNote.
// The attach / emoji / canned toolbar buttons are rendered but DISABLED - see
// the per-button TODOs.
export function WorkspaceComposer({
  conversationId,
  contactFirstName,
  disabled,
}: WorkspaceComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("reply");
  const [text, setText] = useState("");

  const sendMessage = useSendMessage();
  const addNote = useCreateConversationNote();
  const isSending = sendMessage.isPending || addNote.isPending;

  // Clear the draft when the agent switches conversations.
  useEffect(() => {
    setText("");
    setMode("reply");
  }, [conversationId]);

  const handleSubmit = async () => {
    const content = text.trim();
    if (!content || isSending || disabled) return;
    try {
      if (mode === "reply") {
        await sendMessage.mutateAsync({ conversationId, content });
      } else {
        await addNote.mutateAsync({ conversationId, data: { note: content } });
      }
      setText("");
    } catch (error) {
      notify.error("Error", {
        description: handleError(error, mode === "reply" ? "Send Reply" : "Add Note"),
      });
    }
  };

  // Enter-to-send (Shift+Enter inserts a newline).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isNote = mode === "note";

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 pb-4 pt-3">
      {/* Mode tabs */}
      <div className="mb-2 flex gap-1">
        <button
          type="button"
          onClick={() => setMode("reply")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-colors",
            mode === "reply" ? "bg-[#EEF2FD] text-[#3E63D8]" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Reply
        </button>
        <button
          type="button"
          onClick={() => setMode("note")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-colors",
            isNote ? "bg-amber-100 text-amber-700" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <StickyNote className="h-3.5 w-3.5" />
          Internal note
        </button>
      </div>

      {/* Input box - blue framing for reply, amber for note */}
      <div
        className={cn(
          "overflow-hidden rounded-xl border-[1.5px] transition-colors",
          isNote
            ? "border-amber-400 bg-amber-50 focus-within:ring-2 focus-within:ring-amber-200"
            : "border-[#5479EE] bg-white focus-within:ring-2 focus-within:ring-[#EEF2FD]"
        )}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          rows={2}
          placeholder={
            isNote
              ? "Add an internal note (only your team can see this)…"
              : `Reply to ${contactFirstName || "the customer"}…`
          }
          className={cn(
            "max-h-40 min-h-[46px] w-full resize-none bg-transparent px-3.5 py-2.5 text-[13.5px] outline-none",
            isNote ? "text-amber-900 placeholder:text-amber-500/70" : "text-gray-800 placeholder:text-gray-400"
          )}
        />

        <div className="flex items-center gap-1 px-2 py-1.5">
          {/* Attach - render but DISABLED.
              TODO(Support Desk Phase 2): wire attachments via useUploadMedia. */}
          <Tooltip title="Coming soon" arrow>
            <span>
              <button
                type="button"
                disabled
                className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg text-gray-300"
                aria-label="Attach file (coming soon)"
              >
                <Paperclip className="h-[17px] w-[17px]" />
              </button>
            </span>
          </Tooltip>

          {/* Emoji - render but DISABLED.
              TODO(Support Desk Phase 2): emoji picker. */}
          <Tooltip title="Coming soon" arrow>
            <span>
              <button
                type="button"
                disabled
                className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg text-gray-300"
                aria-label="Insert emoji (coming soon)"
              >
                <Smile className="h-[17px] w-[17px]" />
              </button>
            </span>
          </Tooltip>

          {/* Canned replies (the "/" picker + this button) - render but DISABLED.
              TODO(Support Desk Phase 3): canned replies with "/" trigger. */}
          <Tooltip title="Canned replies — coming soon" arrow>
            <span>
              <button
                type="button"
                disabled
                className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg text-gray-300"
                aria-label="Canned replies (coming soon)"
              >
                <Zap className="h-[17px] w-[17px]" />
              </button>
            </span>
          </Tooltip>

          <div className="flex-1" />

          <span className="mr-1 hidden text-[11px] text-gray-400 sm:inline">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10.5px]">
              ⏎
            </kbd>{" "}
            to send
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isSending || disabled}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-colors disabled:opacity-40",
              isNote ? "bg-amber-500 hover:bg-amber-600" : "bg-[#5479EE] hover:bg-[#3F66E0]"
            )}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isNote ? "Add note" : "Send reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
