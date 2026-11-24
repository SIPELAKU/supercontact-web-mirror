"use client";

import React, { useState } from "react";
import { useSendMessage, useUploadMedia, useWidgetReply } from "@/lib/hooks/useOmnichannel";
import { WidgetReplyGate } from "./WidgetReplyGate";
import { useAgentTypingSignal } from "@/lib/hooks/useConversationTyping";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { CopilotLauncher } from "@/components/support/copilot/CopilotDrawer";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { ChannelType } from "@/lib/types/omnichannel";

interface MessageInputProps {
  conversationId: string;
  channelType: ChannelType;
  onMessageSent?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, channelType, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const sendMessageMutation = useSendMessage();
  const uploadMediaMutation = useUploadMedia();
  // Best-effort agent-typing signal (throttled ~2s), fired on each keystroke.
  const notifyAgentTyping = useAgentTypingSignal(conversationId);
  const widgetReply = useWidgetReply(conversationId, channelType);

  const isSubmitting = sendMessageMutation.isPending || uploadMediaMutation.isPending;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        notify.warning("File Too Large", { description: "File size must be less than 10MB." });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) {
      notify.warning("Empty Message", { description: "Please enter a message or select a file." });
      return;
    }

    // SMS and Messenger/Instagram are text-only for now - the media upload path is
    // WhatsApp-specific (and the backend rejects media for all three with a 400).
    if ((channelType === "sms" || channelType === "messenger" || channelType === "instagram") && selectedFile) {
      const channelLabel = channelType === "sms" ? "SMS" : channelType === "messenger" ? "Messenger" : "Instagram";
      notify.warning("Attachments Not Supported", {
        description: `Attachments aren't supported for ${channelLabel} yet. Remove the file to send.`,
      });
      return;
    }

    try {
      // Upload media first if file is selected
      if (selectedFile) {
        await uploadMediaMutation.mutateAsync({ conversationId, file: selectedFile });
        setSelectedFile(null);
      }

      // Send text message if there's content
      if (message.trim()) {
        await sendMessageMutation.mutateAsync({ conversationId, content: message });
        setMessage("");
      }

      if (onMessageSent) onMessageSent();
    } catch (error: any) {
      const errorMessage = handleError(error, "Send Message");
      notify.error("Error", { description: errorMessage });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (widgetReply.state !== "open") {
    return (
      <div className="border-t border-gray-200 bg-white p-4">
        <WidgetReplyGate conversationId={conversationId} state={widgetReply.state} ownerName={widgetReply.ownerName} />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <Paperclip size={14} />
          <span>{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="ml-auto text-red-600 hover:text-red-700"
            disabled={isSubmitting}
          >
            Remove
          </button>
        </div>
      )}

      {/* The box and its buttons share one height: Attach and AI side by side
          level with the box's top, Send level with its bottom, all 36px high.
          (The three used to be stacked, taller than the box, in three sizes.) */}
      <div className="flex items-stretch gap-2">
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            notifyAgentTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={3}
          disabled={isSubmitting}
          className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-[var(--dk-field)]"
        />

        <div className="flex w-20 shrink-0 flex-col justify-between gap-2">
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer" title="Attach a file">
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                aria-label="Attach a file"
              />
              <span className="grid h-9 w-full place-items-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50">
                <Paperclip size={18} />
              </span>
            </label>

            {/* AI Copilot - full drawer (conversationId is in scope). Output only
                writes into the message draft state; NEVER auto-sends. */}
            <CopilotLauncher
              disabled={isSubmitting}
              className="h-9 w-auto flex-1 border border-gray-300"
              conversationId={conversationId}
              getDraft={() => message}
              onInsert={(value, mode) =>
                setMessage((prev) => (mode === "replace" ? value : prev ? `${prev}\n${value}` : value))
              }
            />
          </div>

          <AppButton
            onClick={handleSendMessage}
            disabled={isSubmitting || (!message.trim() && !selectedFile)}
            variantStyle="primary"
            aria-label="Send"
            sx={{ height: 36, minWidth: 0, width: "100%", p: 0 }}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </AppButton>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};

export default MessageInput;
