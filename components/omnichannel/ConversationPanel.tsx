"use client";

import React from "react";
import { MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { CircularProgress } from "@mui/material";
import { ConversationWithMessages, OmnichannelContact } from "@/lib/types/omnichannel";
import MessageList from "./MessageList";
import { ConversationTypingIndicator } from "./TypingIndicator";
import ConversationHeader from "./ConversationHeader";
import WhatsAppComposer from "./WhatsAppComposer";
import EmailComposer from "./EmailComposer";
import { AccountSelectOption } from "./AccountSelect";
import type { CopilotComposerConfig } from "@/components/support/copilot/CopilotDrawer";

export interface WhatsAppComposerBundle {
    inputText: string;
    onInputChange: (value: string) => void;
    selectedFile: File | null;
    previewUrl: string | null;
    onFileTrigger: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isSending: boolean;
    copilot?: CopilotComposerConfig;
}

export interface EmailComposerBundle {
    isOpen: boolean;
    onOpen: () => void;
    onCancel: () => void;
    cc: string;
    onCcChange: (value: string) => void;
    bcc: string;
    onBccChange: (value: string) => void;
    subject: string;
    onSubjectChange: (value: string) => void;
    editorRef: React.RefObject<HTMLDivElement>;
    onBodyInput: (e: React.FormEvent<HTMLDivElement>) => void;
    onBodyKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onToolbarAction: (command: string, value?: string) => void;
    isSending: boolean;
    copilot?: CopilotComposerConfig;
}

interface ConversationPanelProps {
    selectedContact: OmnichannelContact | null;
    conversation?: ConversationWithMessages;
    isLoadingConversation: boolean;
    activeConversationId: string | null;
    isChannelSelected: boolean;
    onStartChannel: (mode: "whatsapp" | "email") => void;
    chatMode: "whatsapp" | "email" | "web_widget";
    onChatModeChange: (mode: "whatsapp" | "email" | "web_widget") => void;
    channelAccounts: AccountSelectOption[];
    selectedAccountId: string;
    onAccountChange: (accountId: string) => void;
    onCreateTicket: () => void;
    isCreateTicketPending: boolean;
    onDeleteConversation: () => void;
    isDeleteConversationPending: boolean;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    onBack: () => void;
    onSendMessage: (e?: React.FormEvent) => void;
    whatsapp: WhatsAppComposerBundle;
    email: EmailComposerBundle;
}

// Column 2 of the Omnichannel 3-column layout: the conversation header, the
// message list (or the empty/loading states in its place), and the
// WhatsApp/Email composer switch. Hidden on mobile until a contact is
// selected, complementing ContactListSidebar's collapse - same `md:`
// breakpoint used in components/inbox/InboxClient.tsx.
export default function ConversationPanel({
    selectedContact,
    conversation,
    isLoadingConversation,
    activeConversationId,
    isChannelSelected,
    onStartChannel,
    chatMode,
    onChatModeChange,
    channelAccounts,
    selectedAccountId,
    onAccountChange,
    onCreateTicket,
    isCreateTicketPending,
    onDeleteConversation,
    isDeleteConversationPending,
    isSidebarOpen,
    onToggleSidebar,
    onBack,
    onSendMessage,
    whatsapp,
    email,
}: ConversationPanelProps) {
    return (
        <div
            className={cn(
                "flex-1 flex-col min-w-0 bg-[#F8F9FC] border border-gray-200 shadow-lg rounded-2xl",
                selectedContact ? "flex" : "hidden md:flex"
            )}
        >
            {selectedContact ? (
                <>
                    <ConversationHeader
                        selectedContact={selectedContact}
                        conversation={conversation}
                        activeConversationId={activeConversationId}
                        isChannelSelected={isChannelSelected}
                        chatMode={chatMode}
                        onChatModeChange={onChatModeChange}
                        channelAccounts={channelAccounts}
                        selectedAccountId={selectedAccountId}
                        onAccountChange={onAccountChange}
                        onCreateTicket={onCreateTicket}
                        isCreateTicketPending={isCreateTicketPending}
                        onDeleteConversation={onDeleteConversation}
                        isDeleteConversationPending={isDeleteConversationPending}
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={onToggleSidebar}
                        onBack={onBack}
                    />

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-[#F0F2F5]">
                        {!activeConversationId ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FC]">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-semibold text-gray-500 mb-8">No messages in this conversation yet</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                    <button
                                        onClick={() => onStartChannel("whatsapp")}
                                        className="p-6 bg-[#F0FDF4] rounded-2xl cursor-pointer border-2 border-transparent hover:border-green-200 transition-all group text-center flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-green-200 group-hover:scale-110 transition-transform">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Start WhatsApp Conversation</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Open a direct WhatsApp thread for this contact</p>
                                    </button>

                                    <button
                                        onClick={() => onStartChannel("email")}
                                        className="p-6 bg-[#FFF5F7] rounded-2xl cursor-pointer border-2 border-transparent hover:border-pink-200 transition-all group text-center flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 bg-[#E91E63] text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-pink-200 group-hover:scale-110 transition-transform">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Start Email Conversation</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Create a new email thread with subject and recipients</p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={cn("flex-1 min-h-0 flex flex-col", (!conversation || isLoadingConversation) && "items-center justify-center")}>
                                {isLoadingConversation ? (
                                    <CircularProgress />
                                ) : conversation ? (
                                    <MessageList messages={conversation.messages} channelType={conversation.channel_type} />
                                ) : (
                                    <p className="text-gray-400 text-sm">Select a contact to start chatting</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Visitor-typing indicator - bottom of the message list,
                        above the composer. Auto-clears ~4s after the last WS
                        signal (renders nothing while inactive). */}
                    <ConversationTypingIndicator
                        conversationId={activeConversationId}
                        name={selectedContact.display_name?.split(" ")[0]}
                        className="px-6 pb-1 pt-0.5"
                    />

                    {/* Input Area */}
                    {(activeConversationId || isChannelSelected) && (
                        <div className="p-4 bg-white border-t border-gray-100">
                            {chatMode === "email" ? (
                                <EmailComposer
                                    {...email}
                                    toValue={selectedContact.email || ""}
                                    onSend={onSendMessage}
                                />
                            ) : (
                                // WhatsApp and Web Chat both use the plain-text
                                // composer (no subject/CC/HTML) - a website-chat
                                // reply is a plain message like WhatsApp, not email.
                                <WhatsAppComposer {...whatsapp} onSend={onSendMessage} />
                            )}
                            <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-medium">
                                Sending via {chatMode === "whatsapp"
                                    ? "WhatsApp Business API"
                                    : chatMode === "web_widget"
                                        ? "Website Chat"
                                        : "SMTP Relay"}
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                        <MessageCircle className="w-12 h-12 text-gray-200" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Omnichannel Inbox</h2>
                    <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                        Select a contact from the left list to start a conversation via WhatsApp or Email.
                        Manage all your communications in one powerful interface.
                    </p>
                </div>
            )}
        </div>
    );
}
