"use client";

import { Loader2, Search } from "lucide-react";
import { ChatUser } from "@/lib/api/chat";

interface ChatSidebarProps {
    inboxList: ChatUser[];
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    loadingInbox: boolean;
    onStartConversation: () => void;
}

export default function ChatSidebar({
    inboxList,
    activeChatId,
    setActiveChatId,
    searchTerm,
    setSearchTerm,
    loadingInbox,
    onStartConversation,
}: ChatSidebarProps) {
    return (
        <div
            className={`w-full md:w-[320px] lg:w-[350px] flex flex-col border-r border-gray-100 ${activeChatId ? "hidden md:flex" : "flex"
                }`}
        >
            <div className="p-5 border-b border-gray-100/80 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-[#5479EE] font-bold">
                        ME
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-indigo-300 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <h2 className="text-[#5479EE] font-semibold px-1">Chats</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {loadingInbox ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-indigo-500" />
                    </div>
                ) : (
                    inboxList
                        .filter((chat) =>
                            chat.user_fullname
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                        )
                        .map((chat) => (
                            <div
                                key={chat.user_id}
                                onClick={() => setActiveChatId(chat.user_id)}
                                className={`flex items-center p-3.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${activeChatId === chat.user_id
                                        ? "bg-indigo-50 border-indigo-100/50"
                                        : "hover:bg-gray-50 hover:border-gray-100"
                                    }`}
                            >
                                <div className="relative mr-4 shrink-0">
                                    {chat.user_avatar ? (
                                        <img
                                            src={chat.user_avatar}
                                            className="w-11 h-11 rounded-full object-cover shadow-sm"
                                            alt={chat.user_fullname}
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-indigo-100 text-[#5479EE] flex items-center justify-center text-sm font-bold shadow-sm">
                                            {chat.user_avatar_initial}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3
                                            className={`text-sm font-semibold truncate ${activeChatId === chat.user_id
                                                    ? "text-indigo-900"
                                                    : "text-gray-900"
                                                }`}
                                        >
                                            {chat.user_fullname}
                                        </h3>
                                        <span
                                            className={`text-[11px] font-medium ${activeChatId === chat.user_id
                                                    ? "text-indigo-400"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {new Date(chat.last_message_time).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <p
                                            className={`text-xs truncate ${activeChatId === chat.user_id
                                                    ? "text-indigo-500 font-medium"
                                                    : "text-gray-500"
                                                } max-w-[180px]`}
                                        >
                                            {chat.last_message_preview}
                                        </p>
                                        {chat.unread_count > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {chat.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onStartConversation}
                    className="w-full bg-[#5479EE] hover:bg-[#3F66E0] text-white font-medium py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    Start Conversation
                </button>
            </div>
        </div>
    );
}
