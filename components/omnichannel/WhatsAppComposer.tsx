"use client";

import React from "react";
import { X, Send, File as FileIcon, Paperclip } from "lucide-react";
import { AppTextarea } from "@/components/ui/app-textarea";
import { CircularProgress } from "@mui/material";
import { CopilotLauncher, type CopilotComposerConfig } from "@/components/support/copilot/CopilotDrawer";

interface WhatsAppComposerProps {
    inputText: string;
    onInputChange: (value: string) => void;
    onSend: (e?: React.FormEvent) => void;
    selectedFile: File | null;
    previewUrl: string | null;
    onFileTrigger: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isSending: boolean;
    // AI Copilot config from the parent (which owns draft text + conversationId).
    // Present -> full drawer when a conversation exists, else Rewrite-only.
    copilot?: CopilotComposerConfig;
}

// WhatsApp reply composer for column 2: textarea, file attach/preview, send
// button. Enter sends (Shift+Enter for a newline), matching the original
// inline behavior.
export default function WhatsAppComposer({
    inputText,
    onInputChange,
    onSend,
    selectedFile,
    previewUrl,
    onFileTrigger,
    onFileChange,
    onRemoveFile,
    fileInputRef,
    isSending,
    copilot,
}: WhatsAppComposerProps) {
    return (
        <div className="flex items-center gap-2 p-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
            />
            <button
                type="button"
                onClick={onFileTrigger}
                className="p-2 text-gray-400 hover:text-primary cursor-pointer transition-all shrink-0"
            >
                <Paperclip className="w-5 h-5" />
            </button>

            {/* AI Copilot - output only writes into the draft; never auto-sends. */}
            {copilot && <CopilotLauncher {...copilot} disabled={isSending} />}

            <form onSubmit={onSend} className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative group rounded-[28px] border border-gray-300 overflow-hidden">
                    {selectedFile && (
                        <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                            {previewUrl ? (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                    <FileIcon className="w-6 h-6" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                                type="button"
                                onClick={onRemoveFile}
                                className="p-1.5 rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <AppTextarea
                        placeholder="Type a message..."
                        value={inputText}
                        isBgWhite
                        rounded="28px"
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        className="w-full bg-transparent focus:bg-white transition-all shadow-none"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                minHeight: "44px",
                                padding: "8px 16px",
                                "& fieldset": { border: "none" }
                            }
                        }}
                        rows={1}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="w-11 h-11 bg-transparent text-green-500 hover:text-white border border-green-500 rounded-full flex items-center justify-center hover:bg-green-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                    {isSending ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </form>
        </div>
    );
}
