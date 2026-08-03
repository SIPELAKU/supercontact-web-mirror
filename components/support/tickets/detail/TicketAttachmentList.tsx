"use client";

import { Download, Paperclip, X } from "lucide-react";
import { TicketAttachment } from "@/lib/types/Ticket";

function formatSize(bytes?: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TicketAttachmentListProps {
    attachments: TicketAttachment[];
    onDelete?: (attachmentId: string) => void;
}

export function TicketAttachmentList({ attachments, onDelete }: TicketAttachmentListProps) {
    if (!attachments.length) return null;

    return (
        <div className="flex flex-col gap-2">
            {attachments.map((attachment) => (
                <div
                    key={attachment.id}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-sm max-w-sm"
                >
                    <div className="p-1.5 bg-gray-100 rounded-lg shrink-0">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <a
                            href={attachment.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-800 hover:underline truncate block"
                            title={attachment.filename}
                        >
                            {attachment.filename}
                        </a>
                        <span className="text-[11px] text-gray-400">{formatSize(attachment.size_bytes)}</span>
                    </div>
                    <a
                        href={attachment.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-700 shrink-0"
                        aria-label="Download file"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(attachment.id)}
                            className="text-gray-400 hover:text-red-600 shrink-0"
                            aria-label="Remove attachment"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
