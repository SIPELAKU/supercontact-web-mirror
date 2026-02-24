"use client";

import { Mic, Paperclip, Send, X } from "lucide-react";

interface ChatInputProps {
    selectionMode: boolean;
    selectedMessages: string[];
    handleDeleteSelected: (msgId?: string) => void;
    toggleSelectionMode: () => void;
    messageInput: string;
    setMessageInput: (input: string) => void;
    handleSendMessage: () => void;
    isRecording: boolean;
    recordingDuration: number;
    cancelRecording: () => void;
    stopRecording: () => void;
    startRecording: () => void;
    setIsUploadModalOpen: (open: boolean) => void;
}

export default function ChatInput({
    selectionMode,
    selectedMessages,
    handleDeleteSelected,
    toggleSelectionMode,
    messageInput,
    setMessageInput,
    handleSendMessage,
    isRecording,
    recordingDuration,
    cancelRecording,
    stopRecording,
    startRecording,
    setIsUploadModalOpen,
}: ChatInputProps) {
    const formatDuration = (sec: number) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
            {selectionMode ? (
                <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-in slide-in-from-bottom-2 fade-in">
                    <div className="flex items-center gap-2 pl-2">
                        <span className="text-sm font-semibold text-indigo-900">
                            {selectedMessages.length} Selected
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleDeleteSelected()}
                            className="p-2 text-[#5479EE] hover:bg-white rounded-lg transition-all"
                            title="Delete"
                        >
                            <Send className="w-5 h-5 rotate-90" /> {/* Placeholder for Trash if not imported */}
                        </button>
                        <div className="w-px h-6 bg-indigo-200"></div>
                        <button
                            onClick={toggleSelectionMode}
                            className="p-2 text-gray-500 hover:bg-white rounded-lg transition-all hover:text-red-500"
                            title="Cancel"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 pl-4 rounded-[16px] border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-sm">
                    <input
                        type="text"
                        placeholder="Type your message here..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-400 h-10"
                    />
                    <div className="flex items-center gap-1 text-gray-400 pr-2">
                        {isRecording ? (
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-4">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs font-medium text-red-600 min-w-[35px]">
                                    {formatDuration(recordingDuration)}
                                </span>
                                <button
                                    onClick={cancelRecording}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={stopRecording}
                                    className="p-1.5 ml-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={startRecording}
                                className="p-2 hover:text-[#5479EE] hover:bg-white rounded-full transition-all"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="p-2 hover:text-[#5479EE] hover:bg-white rounded-full transition-all"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 px-5 shadow-sm hover:shadow-md active:scale-95"
                    >
                        <span className="text-sm font-semibold hidden md:inline">
                            Send
                        </span>
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
