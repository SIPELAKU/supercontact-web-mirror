"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import { MessageSquare, StickyNote, Paperclip, Smile, Zap, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSendMessage, useCreateConversationNote, useCannedReplies } from "@/lib/hooks/useOmnichannel";
import { useAuth } from "@/lib/context/AuthContext";
import { CannedReply } from "@/lib/types/omnichannel";
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
// The canned-replies button + "/" picker are wired below; the attach / emoji
// toolbar buttons are rendered but DISABLED - see the per-button TODOs.
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

  const { userProfile } = useAuth();
  const agentName = userProfile?.fullname || "";

  // Canned replies (active only) for the "/" picker + toolbar button.
  const { data: cannedReplies = [] } = useCannedReplies(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Picker state. `slashMode` = opened by typing "/" at the start (query tracks
  // the text after the slash); otherwise it was opened via the toolbar button.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [slashMode, setSlashMode] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const closePicker = () => {
    setPickerOpen(false);
    setSlashMode(false);
    setPickerQuery("");
  };

  // Clear the draft + picker when the agent switches conversations.
  useEffect(() => {
    setText("");
    setMode("reply");
    closePicker();
  }, [conversationId]);

  // Replace {{customer_name}} / {{agent_name}}; leave unknown placeholders as-is.
  const applyPlaceholders = (body: string) =>
    body
      .replace(/\{\{\s*customer_name\s*\}\}/g, contactFirstName || "")
      .replace(/\{\{\s*agent_name\s*\}\}/g, agentName);

  const filteredReplies = useMemo(() => {
    if (!pickerOpen) return [];
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return cannedReplies;
    return cannedReplies.filter(
      (r) => r.title.toLowerCase().includes(q) || (r.shortcut ?? "").toLowerCase().includes(q)
    );
  }, [pickerOpen, pickerQuery, cannedReplies]);

  // Keep the highlighted option in range as the list filters.
  useEffect(() => {
    setActiveIndex(0);
  }, [pickerQuery, pickerOpen]);

  // Close the picker on an outside click.
  useEffect(() => {
    if (!pickerOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) closePicker();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [pickerOpen]);

  const handleTextChange = (value: string) => {
    setText(value);
    // Typing "/" at the very start opens the slash picker; the text after it
    // becomes the filter. Any other content closes a slash-triggered picker.
    if (value.startsWith("/")) {
      setSlashMode(true);
      setPickerOpen(true);
      setPickerQuery(value.slice(1));
    } else if (slashMode) {
      closePicker();
    }
  };

  const insertCannedReply = (reply: CannedReply) => {
    const body = applyPlaceholders(reply.body);
    if (slashMode) {
      // Replace the "/query" the agent typed with the reply body.
      setText(body);
    } else {
      // Insert at the caret (falls back to append) so the agent keeps context.
      const el = textareaRef.current;
      const start = el?.selectionStart ?? text.length;
      const end = el?.selectionEnd ?? text.length;
      setText(text.slice(0, start) + body + text.slice(end));
    }
    closePicker();
    // Return focus to the textarea for immediate editing before sending.
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const toggleCannedButton = () => {
    if (pickerOpen && !slashMode) {
      closePicker();
      return;
    }
    setSlashMode(false);
    setPickerQuery("");
    setPickerOpen(true);
  };

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

  // Enter-to-send (Shift+Enter inserts a newline). While the canned-reply
  // picker is open, the keyboard drives the picker instead of sending.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (pickerOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filteredReplies.length - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        // Don't send a half-typed "/shortcut" - pick the highlighted reply.
        if (filteredReplies.length > 0) {
          e.preventDefault();
          insertCannedReply(filteredReplies[Math.min(activeIndex, filteredReplies.length - 1)]);
          return;
        }
        if (slashMode) {
          // "/query" with no matches: keep it out of the sent message.
          e.preventDefault();
          closePicker();
          return;
        }
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isNote = mode === "note";

  return (
    <div ref={composerRef} className="relative shrink-0 border-t border-gray-200 bg-white px-4 pb-4 pt-3">
      {/* Canned replies popover - opens upward above the composer. */}
      {pickerOpen && (
        <CannedReplyPopover
          replies={filteredReplies}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onSelect={insertCannedReply}
          previewOf={applyPlaceholders}
        />
      )}

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
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          rows={2}
          placeholder={
            isNote
              ? "Add an internal note (only your team can see this)…"
              : `Reply to ${contactFirstName || "the customer"}…  (type / for canned replies)`
          }
          role="combobox"
          aria-expanded={pickerOpen}
          aria-controls="canned-reply-listbox"
          aria-autocomplete="list"
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

          {/* Canned replies - toggles the picker (also opens by typing "/"). */}
          <Tooltip title="Canned replies (type /)" arrow>
            <button
              type="button"
              onClick={toggleCannedButton}
              aria-label="Canned replies"
              aria-haspopup="listbox"
              aria-expanded={pickerOpen && !slashMode}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                pickerOpen && !slashMode
                  ? "bg-[#EEF2FD] text-[#3E63D8]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <Zap className="h-[17px] w-[17px]" />
            </button>
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

// Popover listing canned replies (title + shortcut + body preview). Rendered
// above the composer; selection inserts the reply body for the agent to edit.
function CannedReplyPopover({
  replies,
  activeIndex,
  onHover,
  onSelect,
  previewOf,
}: {
  replies: CannedReply[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (reply: CannedReply) => void;
  previewOf: (body: string) => string;
}) {
  return (
    <div className="absolute bottom-full left-4 right-4 z-30 mb-2">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          <Zap className="h-3.5 w-3.5" />
          Canned replies
        </div>
        {replies.length === 0 ? (
          <div className="px-3 py-4 text-center text-[12.5px] text-gray-400">
            No matching canned replies.
          </div>
        ) : (
          <ul
            id="canned-reply-listbox"
            role="listbox"
            aria-label="Canned replies"
            className="max-h-64 overflow-y-auto py-1"
          >
            {replies.map((reply, index) => {
              const active = index === activeIndex;
              return (
                <li key={reply.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onMouseEnter={() => onHover(index)}
                    onClick={() => onSelect(reply)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors",
                      active ? "bg-[#EEF2FD]" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-semibold text-gray-800">{reply.title}</span>
                      {reply.shortcut && (
                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10.5px] text-gray-500">
                          /{reply.shortcut.replace(/^\//, "")}
                        </span>
                      )}
                    </div>
                    <span className="line-clamp-1 text-[12px] text-gray-500">{previewOf(reply.body)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
