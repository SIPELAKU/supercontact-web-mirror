"use client";

import React from "react";
import {
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
    MessageCircle,
    Mail,
    Globe,
    Loader2,
    Ticket as TicketIcon,
    Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OmnichannelContact, ConversationWithMessages } from "@/lib/types/omnichannel";
import AccountSelect, { AccountSelectOption } from "./AccountSelect";

interface ConversationHeaderProps {
    selectedContact: OmnichannelContact;
    conversation?: ConversationWithMessages;
    activeConversationId: string | null;
    isChannelSelected: boolean;
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
}

// Header for column 2 (the active conversation): contact name, sentiment
// badge, WhatsApp/Email channel toggle, account picker, and the
// ticket/delete/sidebar-toggle actions. The `md:hidden` back button lets
// mobile users return to the contact list (column 1) - mirrors
// components/inbox/ChatHeader.tsx's back-button affordance.
export default function ConversationHeader({
    selectedContact,
    conversation,
    activeConversationId,
    isChannelSelected,
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
}: ConversationHeaderProps) {
    return (
        <div className="min-h-[100px] py-4 px-4 sm:px-6 border-b border-gray-100 rounded-2xl bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0 gap-4 lg:gap-0">
            {/* Information */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 w-full lg:w-auto">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <h3 className="font-bold text-gray-900 truncate flex items-center gap-2 text-base">
                        {selectedContact.display_name}
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 border border-gray-200 flex items-center gap-1 uppercase tracking-wider">
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            {conversation?.sentiment_label || "No Sentiment"}
                        </span>
                    </h3>
                    <div className="flex flex-col items-start gap-1.5 mt-0.5">
                        {(activeConversationId || isChannelSelected) && (
                            <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                <button
                                    onClick={() => onChatModeChange("whatsapp")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                                        chatMode === "whatsapp" ? "bg-white text-primary shadow-sm border border-gray-200/50" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    <MessageCircle className="w-3 h-3" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => onChatModeChange("email")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                                        chatMode === "email" ? "bg-white text-primary shadow-sm border border-gray-200/50" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    <Mail className="w-3 h-3" />
                                    Email
                                </button>
                                {/* Website chat is visitor-initiated, so only
                                    surface the toggle when this contact actually
                                    has a web_widget conversation. */}
                                {selectedContact.channel_types.includes("web_widget") && (
                                    <button
                                        onClick={() => onChatModeChange("web_widget")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                                            chatMode === "web_widget" ? "bg-white text-primary shadow-sm border border-gray-200/50" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        <Globe className="w-3 h-3" />
                                        Web Chat
                                    </button>
                                )}
                            </div>
                        )}
                        {!activeConversationId && isChannelSelected && channelAccounts.length > 1 && (
                            <div className="w-full max-w-xs">
                                <AccountSelect
                                    accounts={channelAccounts}
                                    value={selectedAccountId}
                                    onChange={onAccountChange}
                                    placeholder={`Send from which ${chatMode} number?`}
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-3 ml-2">
                            <span className="text-xs text-gray-400">Identity: {selectedContact.primary_identifier}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                Channels: {selectedContact.channel_types.join(", ")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Button Header */}
            <div className="flex items-center justify-end w-full lg:w-auto gap-2 mt-2 lg:mt-0">
                <button
                    onClick={onCreateTicket}
                    className="p-2 border border-gray-200 text-gray-400 hover:text-primary hover:bg-gray-50 hover:border-gray-50 rounded-lg transition-all"
                    title="Create ticket from this conversation"
                    disabled={!activeConversationId || isCreateTicketPending}
                >
                    {isCreateTicketPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TicketIcon className="w-4 h-4" />}
                </button>
                <button
                    onClick={onDeleteConversation}
                    className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-50 rounded-lg transition-all"
                    title="Delete conversation"
                    disabled={!activeConversationId || isDeleteConversationPending}
                >
                    {isDeleteConversationPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                </button>
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-gray-400 border border-gray-200 hover:text-primary hover:bg-gray-50 rounded-lg transition-all lg:hidden xl:inline-flex"
                    title={isSidebarOpen ? "Close details" : "Open details"}
                >
                    {isSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-gray-400 border border-gray-200 hover:text-primary hover:bg-gray-50 rounded-lg transition-all hidden lg:inline-flex xl:hidden"
                    title={isSidebarOpen ? "Close details" : "Open details"}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
