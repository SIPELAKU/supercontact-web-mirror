"use client";

import React, { useState } from "react";
import { useSendMessage, useUploadMedia } from "@/lib/hooks/useOmnichannel";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface MessageInputProps {
  conversationId: string;
  channelType: 'whatsapp' | 'email';
  onMessageSent?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, channelType, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const sendMessageMutation = useSendMessage();
  const uploadMediaMutation = useUploadMedia();

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

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={isSubmitting}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <div className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Paperclip size={20} className="text-gray-600" />
            </div>
          </label>

          <AppButton
            onClick={handleSendMessage}
            disabled={isSubmitting || (!message.trim() && !selectedFile)}
            variantStyle="primary"
            className="p-2"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
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
