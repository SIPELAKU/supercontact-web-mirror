"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import { ChatUser } from "@/lib/api/chat";
import { RefObject } from "react";

interface ChatHeaderProps {
    activeChatUser: ChatUser;
    setActiveChatId: (id: string | null) => void;
    showChatOptions: boolean;
    setShowChatOptions: (show: boolean) => void;
    chatOptionsRef: RefObject<HTMLDivElement>;
    setShowContactInfo: (show: boolean) => void;
    toggleSelectionMode: () => void;
    setDeleteType: (type: "conversation" | "messages" | null) => void;
    setShowDeleteModal: (show: boolean) => void;
}

export default function ChatHeader({
    activeChatUser,
    setActiveChatId,
    showChatOptions,
    setShowChatOptions,
    chatOptionsRef,
    setShowContactInfo,
    toggleSelectionMode,
    setDeleteType,
    setShowDeleteModal,
}: ChatHeaderProps) {
    return (
        <div className="bg-white/80 backdrop-blur-md p-4 px-6 border-b border-gray-200/60 sticky top-0 z-10 flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveChatId(null)}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        {activeChatUser.user_avatar ? (
                            <img
                                src={activeChatUser.user_avatar}
                                className="w-10 h-10 rounded-full object-cover"
                                alt="avatar"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#5479EE] flex items-center justify-center text-sm font-bold shadow-sm">
                                {activeChatUser.user_avatar_initial}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            {activeChatUser.user_fullname}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs text-gray-500 capitalize">
                                {activeChatUser.user_position}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setShowChatOptions(!showChatOptions)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showChatOptions && (
                        <div
                            ref={chatOptionsRef}
                            className="absolute top-10 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
                        >
                            <button
                                onClick={() => {
                                    setShowContactInfo(true);
                                    setShowChatOptions(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                            >
                                Contact Info
                            </button>
                            <button
                                onClick={toggleSelectionMode}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-[#5479EE] transition-colors"
                            >
                                Select Messages
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteType("conversation");
                                    setShowDeleteModal(true);
                                    setShowChatOptions(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                Clear Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
