"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2, Lock } from "lucide-react";
import { TicketComment } from "@/lib/types/Ticket";
import { AppButton } from "@/components/ui/app-button";
import { TicketAttachmentList } from "./TicketAttachmentList";

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

interface TicketCommentItemProps {
    comment: TicketComment;
    canModify: boolean;
    onEdit: (commentId: string, body: string) => Promise<void> | void;
    onDelete: (commentId: string) => void;
}

export function TicketCommentItem({ comment, canModify, onEdit, onDelete }: TicketCommentItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(comment.body);

    const isInternal = comment.is_internal_note;
    const authorName = comment.author?.fullname || "Unknown";

    const handleSave = async () => {
        if (!draft.trim()) return;
        await onEdit(comment.id, draft.trim());
        setIsEditing(false);
    };

    return (
        <div className="relative flex gap-4">
            <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${isInternal ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-600"
                    }`}
            >
                {getInitials(authorName)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{authorName}</span>
                        {isInternal && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                <Lock size={10} />
                                Internal note
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="text-xs text-gray-500"
                            title={new Date(comment.created_at).toLocaleString()}
                        >
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {canModify && !isEditing && (
                            <>
                                <button
                                    onClick={() => {
                                        setDraft(comment.body);
                                        setIsEditing(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-700"
                                    aria-label="Edit comment"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="text-gray-400 hover:text-red-600"
                                    aria-label="Delete comment"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div
                    className={`rounded-lg px-4 py-3 border ${isInternal ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
                        }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="w-full min-h-[80px] bg-white p-2 rounded-md border border-gray-200 focus:border-primary resize-none focus:outline-none text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <AppButton variantStyle="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </AppButton>
                                <AppButton variantStyle="primary" onClick={handleSave}>
                                    Save
                                </AppButton>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                            {comment.body}
                        </p>
                    )}
                </div>

                {comment.attachments.length > 0 && (
                    <div className="mt-2">
                        <TicketAttachmentList attachments={comment.attachments} />
                    </div>
                )}
            </div>
        </div>
    );
}
