"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConversation, useMarkAsRead, useDeleteConversation } from "@/lib/hooks/useOmnichannel";
import { ArrowLeft, Trash2, CheckCheck, Mail, MessageCircle, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface ConversationViewProps {
  conversationId: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
  const router = useRouter();
  const { data: conversation, isLoading, error } = useConversation(conversationId);
  const markAsReadMutation = useMarkAsRead();
  const deleteConversationMutation = useDeleteConversation();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Auto-mark as read when conversation loads
  useEffect(() => {
    if (conversation && conversation.unread_count > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId, conversation?.unread_count]);

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync(conversationId);
      notify.success("Marked as Read", { description: "Conversation has been marked as read." });
    } catch (error: any) {
      const message = handleError(error, "Mark as Read");
      notify.error("Error", { description: message });
    }
  };

  const handleDeleteConversation = async () => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      notify.success("Conversation Deleted", { description: "Conversation has been deleted successfully." });
      router.push('/omnichannel');
    } catch (error: any) {
      const message = handleError(error, "Delete Conversation");
      notify.error("Error", { description: message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">Failed to load conversation.</p>
        <AppButton onClick={() => router.push('/omnichannel')} variantStyle="outline" color="gray">
          <ArrowLeft size={16} className="mr-2" />
          Back to Inbox
        </AppButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppButton
              variantStyle="outline"
              color="gray"
              size="sm"
              onClick={() => router.push('/omnichannel')}
            >
              <ArrowLeft size={16} />
            </AppButton>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {conversation.channel_type === 'whatsapp' ? (
                  <MessageCircle className="text-green-600" size={20} />
                ) : (
                  <Mail className="text-blue-600" size={20} />
                )}
              </div>

              <div>
                <h1 className="text-lg font-semibold text-gray-900">{conversation.contact_name}</h1>
                <p className="text-sm text-gray-600">{conversation.contact_identifier}</p>
                {conversation.subject && (
                  <p className="text-sm text-gray-500 italic">{conversation.subject}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conversation.unread_count > 0 && (
              <AppButton
                variantStyle="outline"
                color="gray"
                size="sm"
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
              >
                <CheckCheck size={16} className="mr-2" />
                Mark as Read
              </AppButton>
            )}

            <AppButton
              variantStyle="outline"
              color="red"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              disabled={deleteConversationMutation.isPending}
            >
              <Trash2 size={16} />
            </AppButton>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <MessageList messages={conversation.messages} channelType={conversation.channel_type} />
        </div>
      </div>

      {/* Message Input */}
      <div className="max-w-7xl mx-auto w-full">
        <MessageInput conversationId={conversationId} channelType={conversation.channel_type} />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteConversation}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteConversationMutation.isPending}
      />
    </div>
  );
};

export default ConversationView;
