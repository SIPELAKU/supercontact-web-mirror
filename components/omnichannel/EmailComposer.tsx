"use client";

import React from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import RichTextToolbar from "../email-marketing/campaigns/RichTextToolbar";

interface EmailComposerProps {
    isOpen: boolean;
    onOpen: () => void;
    onCancel: () => void;
    toValue: string;
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
    onSend: () => void;
    isSending: boolean;
}

// Email reply composer for column 2: an open/collapsed toggle, To/CC/BCC/
// Subject rows, the rich-text toolbar, and a contentEditable body. The body
// is intentionally uncontrolled (contentEditable) - `editorRef` and
// `onBodyInput` mirror the original inline behavior exactly.
export default function EmailComposer({
    isOpen,
    onOpen,
    onCancel,
    toValue,
    cc,
    onCcChange,
    bcc,
    onBccChange,
    subject,
    onSubjectChange,
    editorRef,
    onBodyInput,
    onBodyKeyDown,
    onToolbarAction,
    onSend,
    isSending,
}: EmailComposerProps) {
    if (!isOpen) {
        return (
            <div className="flex justify-end p-2 pb-0">
                <AppButton onClick={onOpen} startIcon={<Mail className="w-4 h-4" />}>
                    Reply via Email
                </AppButton>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all focus-within:shadow-md">
            {/* Recipient Rows */}
            <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">TO</span>
                    <input
                        type="text"
                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-700 placeholder:text-gray-300 font-medium"
                        defaultValue={toValue}
                        readOnly
                    />
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">CC</span>
                    <input
                        type="text"
                        value={cc}
                        onChange={(e) => onCcChange(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-600 placeholder:text-gray-300"
                        placeholder="cc@example.com (optional)"
                    />
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">BCC</span>
                    <input
                        type="text"
                        value={bcc}
                        onChange={(e) => onBccChange(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 text-gray-600 placeholder:text-gray-300"
                        placeholder="bcc@example.com (optional)"
                    />
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-12 shrink-0">SUBJECT</span>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs flex-1 p-0 font-bold text-gray-900 placeholder:text-gray-300 uppercase tracking-tight"
                        placeholder="Subject"
                    />
                </div>
            </div>

            {/* Rich Text Toolbar */}
            <RichTextToolbar onAction={onToolbarAction} />

            {/* Email Body */}
            <div className="p-0">
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={onBodyInput}
                    onKeyDown={onBodyKeyDown}
                    data-placeholder="Write an email reply..."
                    className="w-full bg-white border-none focus:outline-none text-[13px] p-4 min-h-[220px] text-gray-700 leading-relaxed overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
                    style={{ border: 'none' }}
                />
            </div>

            {/* Send Button Trigger Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <AppButton
                    type="button"
                    variantStyle="outline"
                    color="gray"
                    className="text-xs py-1.5"
                    onClick={onCancel}
                >
                    Cancel
                </AppButton>
                <AppButton
                    type="button"
                    className="text-xs py-1.5"
                    onClick={onSend}
                    disabled={isSending}
                    startIcon={isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                >
                    Send Email
                </AppButton>
            </div>
        </div>
    );
}
