"use client";

import { Loader2, MessageCircleOff } from "lucide-react";
import { useConversation } from "@/lib/hooks/useOmnichannel";
import MessageList from "@/components/omnichannel/MessageList";

interface TicketConversationPanelProps {
    conversationId?: string | null;
}

// F14: unified agent pane - renders the originating omnichannel conversation
// inline on the ticket detail page, reusing the same MessageList component
// ConversationView.tsx renders, so an agent never has to leave the ticket
// to see channel history.
export function TicketConversationPanel({ conversationId }: TicketConversationPanelProps) {
    const { data: conversation, isLoading, error } = useConversation(conversationId || "");

    if (!conversationId) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <MessageCircleOff size={32} className="mb-2" />
                <p className="text-sm">This ticket wasn&apos;t created from a conversation.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-red-500">
                Failed to load the originating conversation.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="h-[500px] flex flex-col">
                <MessageList messages={conversation.messages} channelType={conversation.channel_type} />
            </div>
        </div>
    );
}
