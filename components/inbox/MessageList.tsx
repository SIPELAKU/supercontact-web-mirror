"use client";

import { Loader2, Send } from "lucide-react";
import MessageItem from "./MessageItem";
import { ChatUser, ChatMessage } from "@/lib/api/chat";
import { UIMessage } from "@/lib/hooks/useChat";
import { RefObject } from "react";

interface MessageListProps {
    loadingMessages: boolean;
    activeChatMessages: UIMessage[];
    activeChatId: string | null;
    activeChatUser: ChatUser;
    selectionMode: boolean;
    selectedMessages: string[];
    handleMessageClick: (msg: ChatMessage, e: React.MouseEvent) => void;
    setPreviewImage: (preview: { url: string; id: string; sender: string; time: string; avatar: string | null; initial: string } | null) => void;
    messagesEndRef: RefObject<HTMLDivElement>;
}

export default function MessageList({
    loadingMessages,
    activeChatMessages,
    activeChatId,
    activeChatUser,
    selectionMode,
    selectedMessages,
    handleMessageClick,
    setPreviewImage,
    messagesEndRef,
}: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loadingMessages ? (
                <div className="flex justify-center h-full items-center">
                    <Loader2 className="animate-spin text-indigo-400" />
                </div>
            ) : activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-4">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400">
                        <Send className="w-8 h-8 opacity-50" />
                    </div>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
                activeChatMessages.map((msg) => {
                    const sentByMe = msg.sender_id !== activeChatId;

                    return (
                        <MessageItem
                            key={msg.id}
                            msg={msg}
                            sentByMe={sentByMe}
                            activeChatUser={activeChatUser}
                            selectionMode={selectionMode}
                            selectedMessages={selectedMessages}
                            handleMessageClick={handleMessageClick}
                            setPreviewImage={setPreviewImage}
                        />
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
