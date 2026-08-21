"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Paperclip, PenLine, X, MessageCircle, Mail, Globe, Smartphone } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { KbSearchPopover } from "@/components/knowledge/KbSearchPopover";
import { CopilotLauncher } from "@/components/support/copilot/CopilotDrawer";
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
import {
    useTicketSignature,
    useTicketDraft,
    useSaveTicketDraft,
    useDeleteTicketDraft,
} from "@/lib/hooks/useTicketCollab";
import { TicketCommentItem } from "./TicketCommentItem";
import type { ChannelType } from "@/lib/types/omnichannel";

interface TicketCommentThreadProps {
    ticketId: string;
    channelType?: ChannelType | null;
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const comments = data?.data?.data || [];

    // --- Agent signature (append-on-demand, never double-appended) ---
    const { data: signature } = useTicketSignature();
    const signatureBody = signature?.is_active ? (signature.body ?? "").trim() : "";
    // Hide the button once the signature is already present so it can't be added twice.
    const canInsertSignature = signatureBody !== "" && !body.includes(signatureBody);

    const insertSignature = () => {
        if (!signatureBody || body.includes(signatureBody)) return;
        setBody((prev) => {
            const trimmed = prev.replace(/\s+$/, "");
            const separator = trimmed.length > 0 ? "\n\n" : "";
            return `${trimmed}${separator}${signatureBody}`;
        });
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

    // --- Reply drafts (prefill on ticket change, debounced autosave, delete on
    // send). Kept keyed by ticketId so switching tickets never clobbers the
    // in-progress body, and flows through setBody so KB / Copilot / signature
    // inserts autosave too. ---
    const draftQuery = useTicketDraft(ticketId);
    const saveDraft = useSaveTicketDraft();
    const deleteDraft = useDeleteTicketDraft();
    const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
    // Whether the saved draft has been loaded into the input for this ticket.
    const prefilledRef = useRef(false);
    // The body currently persisted server-side, so autosave can skip no-op PUTs
    // and stale saves after a ticket switch.
    const lastSavedRef = useRef<{ ticketId: string; body: string } | null>(null);

    // Reset the composer when the ticket changes; the saved draft (if any) is
    // re-hydrated by the prefill effect below.
    useEffect(() => {
        setBody("");
        setFiles([]);
        prefilledRef.current = false;
        setDraftStatus("idle");
    }, [ticketId]);

    // Prefill the composer with the saved draft once it resolves - but only if
    // the input is still empty (don't clobber text the agent already started).
    useEffect(() => {
        if (!ticketId) return;
        if (prefilledRef.current) return;
        if (draftQuery.isLoading) return; // wait for the GET (or cache) to resolve
        prefilledRef.current = true;
        const draftBody = draftQuery.data?.body ?? "";
        lastSavedRef.current = { ticketId, body: draftBody };
        if (draftBody) {
            setBody((prev) => (prev.trim() === "" ? draftBody : prev));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId, draftQuery.isLoading, draftQuery.data]);

    // Debounced autosave. Skips no-op saves, waits until the draft has been
    // hydrated (so load doesn't overwrite an existing draft with an empty body),
    // and captures the ticket id so a switch can't misroute an in-flight save.
    useEffect(() => {
        if (!ticketId) return;
        if (!prefilledRef.current) return;
        const nextBody = body;
        const saved = lastSavedRef.current;
        if (saved && saved.ticketId === ticketId && saved.body === nextBody) return;

        const tid = ticketId;
        const timer = setTimeout(() => {
            setDraftStatus("saving");
            saveDraft.mutate(
                { ticketId: tid, body: nextBody },
                {
                    onSuccess: () => {
                        lastSavedRef.current = { ticketId: tid, body: nextBody };
                        setDraftStatus("saved");
                    },
                    onError: () => setDraftStatus("idle"),
                }
            );
        }, 700);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [body, ticketId]);

    // Insert a Knowledge Base snippet at the caret (falls back to append).
    const insertAtCaret = (snippet: string) => {
        const el = textareaRef.current;
        const start = el?.selectionStart ?? body.length;
        const end = el?.selectionEnd ?? body.length;
        setBody(body.slice(0, start) + snippet + body.slice(end));
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

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
            // Sent - drop the saved draft so it doesn't reappear. Mark the last
            // saved body as empty first so the autosave effect treats setBody("")
            // as a no-op instead of racing a fresh PUT against the DELETE.
            lastSavedRef.current = { ticketId, body: "" };
            setDraftStatus("idle");
            deleteDraft.mutate(ticketId);
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
                            {channelType === "sms" && <Smartphone size={12} />}
                            {channelType === "email" && <Mail size={12} />}
                            {channelType === "web_widget" && <Globe size={12} />}
                            {channelType === "whatsapp"
                                ? "Reply via WhatsApp"
                                : channelType === "sms"
                                    ? "Reply via SMS"
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
                            This will be sent to the customer over {channelType === "whatsapp" ? "WhatsApp" : channelType === "sms" ? "SMS" : channelType === "web_widget" ? "the website chat" : "email"}.
                        </p>
                    )}
                    <textarea
                        ref={textareaRef}
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
                        <div className="flex items-center gap-1">
                            <label className="cursor-pointer p-1 text-gray-500 hover:text-gray-700">
                                <Paperclip size={16} />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            {/* Knowledge base search - inserts an article link + excerpt at the caret. */}
                            <KbSearchPopover direction="down" onInsert={insertAtCaret} />
                            {/* AI Copilot - Rewrite ONLY: a ticket is not an
                                omnichannel conversation, so summarize/suggest-reply
                                (which need conversation_id) don't apply. No
                                conversationId is passed, so the drawer shows only
                                Rewrite. */}
                            <CopilotLauncher
                                getDraft={() => body}
                                onInsert={(value, mode) =>
                                    mode === "replace" ? setBody(value) : insertAtCaret(value)
                                }
                            />
                            {/* Agent signature - appends the saved signature to the
                                draft (never twice). Draft-only: the agent still sends. */}
                            {canInsertSignature && (
                                <button
                                    type="button"
                                    onClick={insertSignature}
                                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-gray-500 hover:text-gray-700"
                                    title="Insert your signature"
                                >
                                    <PenLine size={16} />
                                    <span className="hidden sm:inline">Signature</span>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Draft autosave indicator. */}
                            {draftStatus !== "idle" && (
                                <span className="hidden items-center gap-1 text-[11px] text-gray-400 sm:inline-flex">
                                    {draftStatus === "saving" ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-3 w-3 text-emerald-500" />
                                            Draft saved
                                        </>
                                    )}
                                </span>
                            )}
                            <AppButton
                                onClick={handleSubmit}
                                variantStyle="primary"
                                disabled={createMutation.isPending || !body.trim()}
                            >
                                {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Send"}
                            </AppButton>
                        </div>
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
