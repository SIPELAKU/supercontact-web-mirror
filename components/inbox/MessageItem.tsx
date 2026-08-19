"use client";

import { CheckCircle2, Download, Loader2 } from "lucide-react";
import VoiceMessageBubble from "./VoiceMessageBubble";
import { ChatUser, ChatMessage } from "@/lib/api/chat";
import { UIMessage } from "@/lib/hooks/useChat";

interface MessageItemProps {
    msg: UIMessage;
    sentByMe: boolean;
    activeChatUser: ChatUser;
    selectionMode: boolean;
    selectedMessages: string[];
    handleMessageClick: (msg: ChatMessage, e: React.MouseEvent) => void;
    setPreviewImage: (preview: { url: string; id: string; sender: string; time: string; avatar: string | null; initial: string } | null) => void;
}

export default function MessageItem({
    msg,
    sentByMe,
    activeChatUser,
    selectionMode,
    selectedMessages,
    handleMessageClick,
    setPreviewImage,
}: MessageItemProps) {
    return (
        <div className="group flex items-start gap-3 w-full hover:bg-gray-300 transition-colors cursor-pointer p-2 rounded-xl">
            {selectionMode && (
                <div className="self-center shrink-0 animate-in fade-in zoom-in duration-200">
                    <button
                        onClick={() => handleMessageClick(msg, {} as any)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedMessages.includes(msg.id)
                            ? "bg-[#5479EE] border-[#5479EE] text-white"
                            : "border-gray-300 bg-white"
                            }`}
                    >
                        {selectedMessages.includes(msg.id) && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            )}

            <div
                onClick={(e) => handleMessageClick(msg, e)}
                className={`flex gap-3 flex-1 ${sentByMe ? "justify-end" : "justify-start"
                    } cursor-pointer`}
            >
                {!sentByMe && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold self-end mb-1 shadow-sm bg-indigo-100 text-[#5479EE] overflow-hidden">
                        {activeChatUser.user_avatar ? (
                            <img
                                src={activeChatUser.user_avatar}
                                className="w-full h-full object-cover"
                                alt="avatar"
                            />
                        ) : (
                            activeChatUser.user_avatar_initial
                        )}
                    </div>
                )}

                <div
                    className={`flex flex-col max-w-[75%] ${sentByMe ? "items-end" : "items-start"
                        }`}
                >
                    {msg.type === "Image" ? (
                        <div
                            className={`rounded-[12px] p-2 shadow-sm hover:opacity-95 transition-opacity relative ${sentByMe
                                ? "bg-[#5479EE] rounded-br-none"
                                : "bg-white rounded-bl-none border border-gray-100"
                                }`}
                        >
                            <img
                                src={msg.localPreviewUrl || msg.media_url || ""}
                                alt="attachment"
                                loading="lazy"
                                onClick={() =>
                                    setPreviewImage({
                                        url: msg.media_url || msg.localPreviewUrl || "",
                                        id: msg.id,
                                        sender: sentByMe
                                            ? "You"
                                            : activeChatUser?.user_fullname || "Unknown",
                                        time: msg.created_at,
                                        avatar: sentByMe ? null : activeChatUser?.user_avatar || null,
                                        initial: sentByMe
                                            ? "Y"
                                            : activeChatUser?.user_avatar_initial || "?",
                                    })
                                }
                                className={`rounded-lg w-full h-[150px] md:h-[200px] object-cover bg-gray-100 mb-2 cursor-pointer hover:opacity-95 transition-opacity ${msg.isPending ? "blur-sm brightness-90" : ""
                                    }`}
                            />
                            {msg.isPending && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin drop-shadow-md" />
                                </div>
                            )}
                            {msg.message && (
                                <div
                                    className={`px-2 pb-1 text-[13px] font-medium leading-relaxed ${sentByMe ? "text-white" : "text-gray-700"
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            )}
                        </div>
                    ) : msg.type === "File" ? (
                        <div
                            className={`px-4 py-3 rounded-[18px] text-[14px] leading-relaxed shadow-sm flex items-center gap-2 ${sentByMe
                                ? "bg-[#5479EE] text-white rounded-br-none"
                                : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                                }`}
                        >
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Download className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <a
                                    href={msg.media_url || "#"}
                                    target="_blank"
                                    className="font-semibold underline"
                                >
                                    Download File
                                </a>
                                <span className="text-[10px] opacity-80">Attachment</span>
                            </div>
                        </div>
                    ) : msg.type === "Voice" ? (
                        <VoiceMessageBubble
                            src={msg.localPreviewUrl || msg.media_url || ""}
                            isMe={sentByMe}
                        />
                    ) : (
                        <div
                            className={`px-4 py-3 rounded-[18px] text-[14px] leading-relaxed shadow-sm ${sentByMe
                                ? "bg-[#5479EE] text-white rounded-br-none"
                                : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                                }`}
                        >
                            {msg.message}
                        </div>
                    )}

                    <span className="text-[10px] font-medium text-gray-400 mt-1.5 flex items-center gap-1 px-1">
                        {sentByMe && (
                            <span className={`text-indigo-500`}>
                                {msg.is_read ? "✓✓" : "✓"}
                            </span>
                        )}
                        {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
