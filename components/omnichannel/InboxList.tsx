"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useInbox } from "@/lib/hooks/useOmnichannel";
import { Loader2, Mail, MessageCircle } from "lucide-react";

interface InboxListProps {
  channelType?: string;
  status?: string;
}

const InboxList: React.FC<InboxListProps> = ({ channelType, status }) => {
  const router = useRouter();
  const { data: conversations, isLoading, error } = useInbox(channelType, status);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/omnichannel/conversations/${conversationId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'recently';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">Failed to load conversations. Please try again.</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No conversations yet.</p>
        <p className="text-sm text-gray-500 mt-2">Start a new conversation to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => handleConversationClick(conversation.id)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-start gap-4">
            {/* Channel Icon */}
            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
              {conversation.channel_type === 'whatsapp' ? (
                <MessageCircle className="text-green-600" size={20} />
              ) : (
                <Mail className="text-blue-600" size={20} />
              )}
            </div>

            {/* Conversation Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{conversation.contact_name}</h3>
                  {conversation.subject && (
                    <p className="text-sm text-gray-600 truncate">{conversation.subject}</p>
                  )}
                </div>
                
                {conversation.unread_count > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                    {conversation.unread_count}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 truncate mb-2">
                {conversation.last_message_preview}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="capitalize">{conversation.channel_type}</span>
                <span>•</span>
                <span>{formatTimeAgo(conversation.last_message_at)}</span>
                <span>•</span>
                <span className="capitalize">{conversation.status}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InboxList;
