"use client";

import { useState } from "react";
import { Loader2, Paperclip, X, MessageCircle, Mail, Globe } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { notify } from "@/lib/notifications";
import {
    useTicketComments,
    useCreateTicketComment,
    useUpdateTicketComment,
    useDeleteTicketComment,
} from "@/lib/hooks/useTicketComments";
import { TicketCommentItem } from "./TicketCommentItem";

interface TicketCommentThreadProps {
    ticketId: string;
    channelType?: "whatsapp" | "email" | "web_widget" | null;
    customerName?: string;
}

export function TicketCommentThread({ ticketId, channelType, customerName }: TicketCommentThreadProps) {
    const { userProfile } = useAuth();
    const { can } = usePermission();
    const { confirm, confirmationPopup } = useConfirmationPopup();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);
    const canModerate = can(["tickets:delete", "tickets"]);

    const { data, isLoading } = useTicketComments(ticketId, { live: !!channelType });
    const createMutation = useCreateTicketComment(ticketId);
    const updateMutation = useUpdateTicketComment(ticketId);
    const deleteMutation = useDeleteTicketComment(ticketId);

    const [replyMode, setReplyMode] = useState<"public" | "internal">("public");
    const [body, setBody] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const comments = data?.data?.data || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
        }
        e.target.value = "";
    };

    const handleSubmit = async () => {
        if (!body.trim()) return;
        try {
            await createMutation.mutateAsync({
                body: body.trim(),
                is_internal_note: replyMode === "internal",
                files,
            });
            setBody("");
            setFiles([]);
        } catch (err: any) {
            notify.error(err?.message || "Failed to add comment");
        }
    };

    const handleEdit = async (commentId: string, newBody: string) => {
        try {
            await updateMutation.mutateAsync({ commentId, body: newBody });
        } catch (err: any) {
            notify.error(err?.message || "Failed to update comment");
        }
    };

    const handleDelete = (commentId: string) => {
        confirm({
            variant: "danger",
            title: "Delete Comment",
            description: "Are you sure you want to delete this comment? This action cannot be undone.",
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync(commentId);
                    notify.success("Comment deleted");
                } catch (err: any) {
                    notify.error(err?.message || "Failed to delete comment");
                }
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {canWrite && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setReplyMode("public")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${replyMode === "public"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {channelType === "whatsapp" && <MessageCircle size={12} />}
                            {channelType === "email" && <Mail size={12} />}
                            {channelType === "web_widget" && <Globe size={12} />}
                            {channelType === "whatsapp"
                                ? "Reply via WhatsApp"
                                : channelType === "email"
                                    ? "Reply via Email"
                                    : channelType === "web_widget"
                                        ? "Reply via Website Chat"
                                        : "Public Reply"}
                        </button>
                        <button
                            onClick={() => setReplyMode("internal")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${replyMode === "internal"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            Internal Note
                        </button>
                    </div>
                    {channelType && replyMode === "public" && (
                        <p className="text-xs text-gray-400">
                            This will be sent to the customer over {channelType === "whatsapp" ? "WhatsApp" : channelType === "web_widget" ? "the website chat" : "email"}.
                        </p>
                    )}
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={
                            replyMode === "internal"
                                ? "Add an internal note (agents only)..."
                                : "Write a reply..."
                        }
                        className="w-full min-h-[100px] bg-[#F6F6F8] p-3 rounded-lg border border-gray-200 focus:border-primary resize-none placeholder-gray-400 focus:outline-none text-sm"
                    />

                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file, index) => (
                                <span
                                    key={`${file.name}-${index}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                                >
                                    <Paperclip size={12} />
                                    {file.name}
                                    <button
                                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                            <Paperclip size={16} />
                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                        </label>
                        <AppButton
                            onClick={handleSubmit}
                            variantStyle="primary"
                            disabled={createMutation.isPending || !body.trim()}
                        >
                            {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Send"}
                        </AppButton>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Activity</h3>

                {isLoading && <p className="text-sm text-gray-400">Loading comments...</p>}
                {!isLoading && comments.length === 0 && (
                    <p className="text-sm text-gray-400">No activity yet.</p>
                )}

                <div className="relative space-y-6">
                    {comments.map((comment, index) => (
                        <div key={comment.id} className="relative">
                            {index !== comments.length - 1 && (
                                <span className="absolute left-5 top-12 h-full w-px bg-gray-200" />
                            )}
                            <TicketCommentItem
                                comment={comment}
                                canModify={comment.author?.id === userProfile?.id || canModerate}
                                customerName={customerName}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {confirmationPopup}
        </div>
    );
}
