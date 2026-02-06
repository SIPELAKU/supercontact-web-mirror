"use client";

import React, { useState } from "react";
import {
    Search,
    MessageCircle,
    Mail,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Send,
    Check,
    CheckCheck,
    Star,
    Archive,
    Trash2,
    Filter,
    User,
    Inbox
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { cn } from "@/lib/utils";

// --- Dummy Data ---

type ChannelType = "whatsapp" | "email";

interface Message {
    id: string;
    senderId: string; // 'me' or other
    text: string;
    timestamp: string;
    status?: "sent" | "delivered" | "read";
    attachments?: string[];
    subject?: string; // For emails
}

interface Conversation {
    id: string;
    contactName: string;
    contactAvatar?: string;
    contactInitial: string;
    channel: ChannelType;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
    email: string;
    phone?: string;
    tags?: string[];
}

const DUMMY_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        contactName: "Alice Freeman",
        contactInitial: "A",
        channel: "whatsapp",
        lastMessage: "Sounds good, send me the proposal.",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        email: "alice@example.com",
        phone: "+1 234 567 890",
        tags: ["Lead", "Warm"],
        messages: [
            {
                id: "m1",
                senderId: "other",
                text: "Hi, I saw your product online. Can you tell me more?",
                timestamp: "10:00 AM",
            },
            {
                id: "m2",
                senderId: "me",
                text: "Hello Alice! Absolutely. Our platform organizes all your customer interactions in one place.",
                timestamp: "10:05 AM",
                status: "read",
            },
            {
                id: "m3",
                senderId: "other",
                text: "Sounds good, send me the proposal.",
                timestamp: "10:30 AM",
            },
        ],
    },
    {
        id: "2",
        contactName: "TechCorp Support",
        contactInitial: "T",
        channel: "email",
        lastMessage: "Re: Invoice #1023 Pending",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        email: "support@techcorp.io",
        tags: ["Support", "Urgent"],
        messages: [
            {
                id: "e1",
                senderId: "other",
                subject: "Invoice #1023 Pending",
                text: "Dear Team,\n\nWe haven't received payment for Invoice #1023 yet. Please check.\n\nBest,\nTechCorp",
                timestamp: "Yesterday, 4:00 PM",
            },
            {
                id: "e2",
                senderId: "me",
                subject: "Re: Invoice #1023 Pending",
                text: "Hi,\n\nChecking this with our finance team now. Will get back to you shortly.\n\nRegards,\nAdmin",
                timestamp: "Yesterday, 5:30 PM",
            },
        ],
    },
    {
        id: "3",
        contactName: "Robert Wolf",
        contactInitial: "R",
        channel: "whatsapp",
        lastMessage: "Can we schedule a call?",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        email: "robert@wolf.com",
        phone: "+44 7700 900077",
        tags: ["Client"],
        messages: [
            { id: "m1", senderId: "me", text: "Hey Robert, how is the project going?", timestamp: "Yesterday 9:00 AM", status: "read" },
            { id: "m2", senderId: "other", text: "Going well! Can we schedule a call to discuss next steps?", timestamp: "Yesterday 2:00 PM" }
        ],
    },
    {
        id: "4",
        contactName: "Sarah Connor",
        contactInitial: "S",
        channel: "email",
        lastMessage: "New Partnership Opportunity",
        lastMessageTime: "2 Days ago",
        unreadCount: 5,
        email: "sarah@skynet.net",
        tags: ["New"],
        messages: [
            {
                id: "e1",
                senderId: "other",
                subject: "New Partnership Opportunity",
                text: "Hello,\n\nWe are looking for partners in the region. Are you interested?\n\n- Sarah",
                timestamp: "2 Days ago",
            }
        ],
    }
];

// --- Components ---

export default function UnifiedInbox() {
    const [activeTab, setActiveTab] = useState<"all" | "whatsapp" | "email">("all");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(DUMMY_CONVERSATIONS[0].id);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputText, setInputText] = useState("");

    // Filter conversations
    const filteredConversations = DUMMY_CONVERSATIONS.filter((conv) => {
        const matchesTab = activeTab === "all" || conv.channel === activeTab;
        const matchesSearch = conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const activeConversation = DUMMY_CONVERSATIONS.find((c) => c.id === selectedChatId);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        // In a real app, this would append to the list. For dummy, we just clear input.
        alert(`Sent to ${activeConversation?.channel}: ${inputText}`);
        setInputText("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
            <PageHeader
                title="Unified Inbox"
                description="Manage all your client communications in one place."
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Omnichannel" },
                    { label: "Inbox" }
                ]}
            />

            <div className="flex flex-1 h-full gap-6 mt-6 overflow-hidden ">
                {/* Sidebar */}
                <div className="w-full md:w-[380px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            {(["all", "whatsapp", "email"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 capitalize flex items-center justify-center gap-2",
                                        activeTab === tab
                                            ? "bg-white text-primary shadow-sm border border-gray-200/50"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    )}
                                >
                                    {tab === "whatsapp" && <MessageCircle className="w-3.5 h-3.5" />}
                                    {tab === "email" && <Mail className="w-3.5 h-3.5" />}
                                    {tab === "all" && <Inbox className="w-3.5 h-3.5" />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedChatId(conv.id)}
                                className={cn(
                                    "p-3 rounded-xl cursor-pointer transition-all duration-200 flex gap-3 group border border-transparent",
                                    selectedChatId === conv.id
                                        ? "bg-blue-50/50 border-blue-100"
                                        : "hover:bg-gray-50 hover:border-gray-100"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm",
                                        conv.channel === "whatsapp" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {conv.contactInitial}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                                        conv.channel === "whatsapp" ? "bg-[#25D366]" : "bg-blue-500"
                                    )}>
                                        {conv.channel === "whatsapp" ? (
                                            <MessageCircle className="w-3 h-3 text-white fill-current" />
                                        ) : (
                                            <Mail className="w-3 h-3 text-white fill-current" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className={cn(
                                            "font-semibold text-sm truncate pr-2",
                                            selectedChatId === conv.id ? "text-gray-900" : "text-gray-700"
                                        )}>
                                            {conv.contactName}
                                        </h3>
                                        <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                                            {conv.lastMessageTime}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm truncate pr-2",
                                        conv.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-500"
                                    )}>
                                        {conv.lastMessage}
                                    </p>

                                    {/* Tags & Unread Badge */}
                                    <div className="flex justify-between items-center mt-1.5">
                                        <div className="flex gap-1.5 overflow-hidden">
                                            {conv.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-primary text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-sm shadow-blue-200">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
                    {activeConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md",
                                        activeConversation.channel === "whatsapp" ? "bg-[#25D366]" : "bg-blue-500"
                                    )}>
                                        {activeConversation.contactInitial}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                            {activeConversation.contactName}
                                            <span className="text-[10px] font-normal px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 border border-gray-200 uppercase tracking-wide">
                                                {activeConversation.channel}
                                            </span>
                                        </h2>
                                        <p className="text-sm text-gray-500 flex items-center gap-4">
                                            {activeConversation.email}
                                            {activeConversation.phone && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    {activeConversation.phone}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AppButton variantStyle="outline" color="primary" className="p-2 h-10 w-10 rounded-full">
                                        <Phone className="w-4 h-4" />
                                    </AppButton>
                                    <AppButton variantStyle="outline" color="primary" className="p-2 h-10 w-10 rounded-full">
                                        <Video className="w-4 h-4" />
                                    </AppButton>
                                    <AppButton variantStyle="outline" color="primary" className="p-2 h-10 w-10 rounded-full">
                                        <Star className="w-4 h-4" />
                                    </AppButton>
                                    <AppButton variantStyle="outline" color="primary" className="p-2 h-10 w-10 rounded-full">
                                        <MoreVertical className="w-4 h-4" />
                                    </AppButton>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fc]">
                                {activeConversation.messages.map((msg) => {
                                    const isMe = msg.senderId === "me";
                                    const isEmail = activeConversation.channel === "email";

                                    if (isEmail) {
                                        return (
                                            <div key={msg.id} className={cn(
                                                "flex flex-col gap-1 max-w-[90%]",
                                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                                            )}>
                                                <div className={cn(
                                                    "p-5 rounded-xl border shadow-sm w-full",
                                                    isMe ? "bg-white border-blue-100" : "bg-white border-gray-100"
                                                )}>
                                                    <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{msg.subject}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">from: {isMe ? "Me" : activeConversation.contactName}</p>
                                                        </div>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{msg.timestamp}</span>
                                                    </div>
                                                    <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    // Default / WhatsApp style
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                isMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[70%] rounded-2xl p-3.5 shadow-sm relative group",
                                                    isMe
                                                        ? "bg-primary text-white rounded-br-sm"
                                                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                                                )}
                                            >
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                                <div className={cn(
                                                    "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                                    isMe ? "text-blue-100" : "text-gray-400"
                                                )}>
                                                    <span>{msg.timestamp}</span>
                                                    {isMe && msg.status === 'read' && <CheckCheck className="w-3 h-3" />}
                                                    {isMe && msg.status !== 'read' && <Check className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <textarea
                                        placeholder={activeConversation.channel === "email" ? "Write a reply..." : "Type a message..."}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        className="flex-1 bg-transparent border-none focus:outline-none resize-none py-2 text-sm max-h-32 min-h-[40px]"
                                        rows={1}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className={cn(
                                            "p-2.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                            inputText.trim() ? "bg-primary text-white hover:bg-primary/90" : "bg-gray-200 text-gray-400"
                                        )}
                                        disabled={!inputText.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-[10px] text-gray-400">
                                        Sending via {activeConversation.channel === 'whatsapp' ? 'WhatsApp Business API' : 'SMTP Relay'}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <Inbox className="w-8 h-8 text-gray-300" />
                            </div>
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
