"use client";

import { useState } from "react";
import {
    ArrowLeft,
    Loader2,
    MessageSquarePlus,
    MessagesSquare,
    Plus,
    Send,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { usePermission } from "@/lib/hooks/usePermission";
import {
    useCloseSideConversation,
    useCreateSideConversation,
    usePostSideConversationMessage,
    useSideConversation,
    useSideConversations,
} from "@/lib/hooks/useTicketSideConversations";
import type { SideConversationState } from "@/lib/api/ticket-side-conversations";
import { notify } from "@/lib/notifications";

interface TicketSideConversationsPanelProps {
    ticketId: string;
}

function StateBadge({ state }: { state: SideConversationState }) {
    const isOpen = state === "open";
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isOpen ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}
        >
            {isOpen ? "Open" : "Closed"}
        </span>
    );
}

function formatWhen(value?: string | null) {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

export function TicketSideConversationsPanel({ ticketId }: TicketSideConversationsPanelProps) {
    const { can } = usePermission();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);

    const { data: sideConversations = [], isLoading } = useSideConversations(ticketId);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newSubject, setNewSubject] = useState("");
    const [replyBody, setReplyBody] = useState("");

    const createMutation = useCreateSideConversation(ticketId);
    const messageMutation = usePostSideConversationMessage(ticketId);
    const closeMutation = useCloseSideConversation(ticketId);

    const { data: detail, isLoading: isDetailLoading } = useSideConversation(ticketId, selectedId);

    const inputClass =
        "w-full rounded-lg border border-gray-200 bg-[#F6F6F8] px-3 py-2 text-sm placeholder-gray-400 focus:border-primary focus:outline-none";

    const handleCreate = async () => {
        const subject = newSubject.trim();
        if (!subject) {
            notify.warning("Subject required", { description: "Enter a subject for the side conversation." });
            return;
        }
        try {
            const created = await createMutation.mutateAsync(subject);
            notify.success("Side conversation created");
            setNewSubject("");
            setShowNewForm(false);
            if (created?.id) setSelectedId(created.id);
        } catch (err: any) {
            notify.error(err?.message || "Failed to create side conversation");
        }
    };

    const handleSendMessage = async () => {
        const body = replyBody.trim();
        if (!body || !selectedId) return;
        try {
            await messageMutation.mutateAsync({ scId: selectedId, body });
            setReplyBody("");
        } catch (err: any) {
            notify.error(err?.message || "Failed to send message");
        }
    };

    const handleClose = async () => {
        if (!selectedId) return;
        try {
            await closeMutation.mutateAsync(selectedId);
            notify.success("Side conversation closed");
        } catch (err: any) {
            notify.error(err?.message || "Failed to close side conversation");
        }
    };

    // ---------------------------------------------------------------- Detail view
    if (selectedId) {
        const isClosed = detail?.state === "closed";
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <button
                            onClick={() => {
                                setSelectedId(null);
                                setReplyBody("");
                            }}
                            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
                        >
                            <ArrowLeft size={13} /> Back to side conversations
                        </button>
                        <div className="flex items-center gap-2">
                            <h4 className="truncate text-sm font-semibold text-gray-900">
                                {detail?.subject || "Side conversation"}
                            </h4>
                            {detail && <StateBadge state={detail.state} />}
                        </div>
                    </div>
                    {canWrite && !isClosed && detail && (
                        <AppButton
                            variantStyle="outline"
                            onClick={handleClose}
                            disabled={closeMutation.isPending}
                        >
                            Close
                        </AppButton>
                    )}
                </div>

                {isDetailLoading ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
                        <Loader2 className="animate-spin" size={14} /> Loading...
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                            {(detail?.messages || []).length === 0 && (
                                <p className="py-4 text-center text-sm text-gray-400">
                                    No messages yet.
                                </p>
                            )}
                            {(detail?.messages || []).map((m) => (
                                <div
                                    key={m.id}
                                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                                >
                                    <div className="mb-1 flex items-center justify-between text-[11px] text-gray-400">
                                        <span className="font-medium text-gray-600">
                                            {m.sender_name || "Unknown"}
                                        </span>
                                        <span>{formatWhen(m.created_at)}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm text-gray-700">{m.body}</p>
                                </div>
                            ))}
                        </div>

                        {canWrite && !isClosed && (
                            <div className="flex items-end gap-2 pt-2">
                                <textarea
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Write a reply... (Ctrl+Enter to send)"
                                    rows={2}
                                    className={`${inputClass} resize-none`}
                                />
                                <AppButton
                                    onClick={handleSendMessage}
                                    disabled={messageMutation.isPending || !replyBody.trim()}
                                    startIcon={<Send size={14} />}
                                >
                                    Send
                                </AppButton>
                            </div>
                        )}
                        {isClosed && (
                            <p className="pt-2 text-xs text-gray-400">
                                This side conversation is closed.
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ------------------------------------------------------------------ List view
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-gray-400">Side Conversations</h4>
                {canWrite && (
                    <button
                        onClick={() => setShowNewForm((v) => !v)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#5479EE] hover:underline"
                    >
                        <MessageSquarePlus size={14} /> New side conversation
                    </button>
                )}
            </div>

            {showNewForm && canWrite && (
                <div className="mb-4 flex items-end gap-2 rounded-lg border border-gray-200 p-3">
                    <input
                        autoFocus
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleCreate();
                            }
                        }}
                        placeholder="Subject..."
                        className={inputClass}
                    />
                    <AppButton
                        onClick={handleCreate}
                        disabled={createMutation.isPending || !newSubject.trim()}
                        startIcon={<Plus size={14} />}
                    >
                        Create
                    </AppButton>
                </div>
            )}

            {isLoading ? (
                <p className="text-sm text-gray-400">Loading side conversations...</p>
            ) : sideConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                    <MessagesSquare size={28} className="mb-2" />
                    <p className="text-sm">No side conversations yet.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {sideConversations.map((sc) => (
                        <li key={sc.id}>
                            <button
                                onClick={() => setSelectedId(sc.id)}
                                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-gray-50"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-sm font-medium text-gray-900">
                                            {sc.subject}
                                        </span>
                                        <StateBadge state={sc.state} />
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {sc.created_by_name || "Unknown"} · {formatWhen(sc.created_at)}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                    {sc.message_count} {sc.message_count === 1 ? "message" : "messages"}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
