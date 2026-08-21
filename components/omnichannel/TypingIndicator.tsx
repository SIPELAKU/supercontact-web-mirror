"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useConversationTyping } from "@/lib/hooks/useConversationTyping";

interface ConversationTypingIndicatorProps {
  conversationId: string | null | undefined;
  // Contact / visitor name; falls back to a generic "Visitor" label.
  name?: string;
  className?: string;
}

// Subtle "… is typing" row with three animated dots. Reads the ephemeral
// visitor-typing store (useConversationTyping) and renders nothing unless a
// visitor-typing signal for THIS conversation is still active. Shared by the
// Support Desk Workspace thread and the Omnichannel conversation panel so both
// open-conversation views behave identically.
export function ConversationTypingIndicator({
  conversationId,
  name,
  className,
}: ConversationTypingIndicatorProps) {
  const isTyping = useConversationTyping(conversationId);
  if (!isTyping) return null;

  const trimmed = name?.trim();
  const label = trimmed ? `${trimmed} is typing` : "Visitor is typing";

  return (
    <div
      className={cn("flex items-center gap-2 text-xs font-medium text-gray-500", className)}
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
          />
        ))}
      </span>
      <span>{label}…</span>
    </div>
  );
}
