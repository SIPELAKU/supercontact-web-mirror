"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, GitMerge, Link2 } from "lucide-react";
import { AppTabs } from "@/components/ui/app-tabs";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { notify } from "@/lib/notifications";
import { useTicket, useDeleteTicket } from "@/lib/hooks/useTickets";
import { useConversation } from "@/lib/hooks/useOmnichannel";
import { useTicketCustomFields } from "@/lib/hooks/useTicketCustomFields";
import { useUploadTicketAttachments, useDeleteTicketAttachment } from "@/lib/hooks/useTicketAttachments";
import { TicketPriorityBadge, TicketStatusBadge, TicketTypeBadge } from "../TicketBadges";
import { TicketSlaBadge } from "../TicketSlaBadge";
import { EditTicketModal } from "../modals/EditTicketModal";
import { TicketCommentThread } from "./TicketCommentThread";
import { TicketAttachmentList } from "./TicketAttachmentList";
import { TicketAttachmentUploader } from "./TicketAttachmentUploader";
import { TicketViewersIndicator } from "./TicketViewersIndicator";
import { ApplyMacroButton } from "./ApplyMacroButton";
import { TicketLinksPanel } from "./TicketLinksPanel";
import { TicketConversationPanel } from "./TicketConversationPanel";
import { MergeTicketModal } from "../modals/MergeTicketModal";
import { LinkTicketModal } from "../modals/LinkTicketModal";

interface TicketDetailClientProps {
    id: string;
}

type DetailTab = "overview" | "activity" | "conversation";
const VALID_TABS: DetailTab[] = ["overview", "activity", "conversation"];

export function TicketDetailClient({ id }: TicketDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { can } = usePermission();
    const { confirm, confirmationPopup } = useConfirmationPopup();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);
    const canDelete = can(["tickets:delete", "tickets"]);

    const { data, isLoading, error } = useTicket(id);
    const deleteMutation = useDeleteTicket();
    const uploadMutation = useUploadTicketAttachments(id);
    const deleteAttachmentMutation = useDeleteTicketAttachment(id);
    const { data: customFieldDefs } = useTicketCustomFields();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isMergeOpen, setIsMergeOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>(() => {
        const requested = searchParams.get("tab") as DetailTab | null;
        return requested && VALID_TABS.includes(requested) ? requested : "overview";
    });

    const ticket = data?.data;

    // Lifted up from TicketConversationPanel so the Activity tab knows the
    // channel type without requiring a visit to the Conversation tab first -
    // React Query dedupes against the same cache key, so this costs nothing
    // extra once the Conversation tab is also visited.
    const { data: conversation } = useConversation(ticket?.source_conversation_id || "");

    const fieldLabelByKey = useMemo(() => {
        const defs = customFieldDefs?.data?.data || [];
        return Object.fromEntries(defs.map((d: any) => [d.field_key, d.label]));
    }, [customFieldDefs]);

    const handleTabChange = (tab: DetailTab) => {
        setActiveTab(tab);
        router.replace(`/support/tickets/${id}?tab=${tab}`, { scroll: false });
    };

    const handleDelete = () => {
        if (!ticket) return;
        confirm({
            variant: "danger",
            title: "Delete Ticket",
            description: `Are you sure you want to delete ticket #${ticket.ticket_code}? This action cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync(ticket.id);
                    notify.success("Ticket deleted successfully!");
                    router.push("/support/tickets");
                } catch (err: any) {
                    notify.error(err?.message || "Failed to delete ticket");
                }
            },
        });
    };

    const handleUpload = async (files: File[]) => {
        try {
            await uploadMutation.mutateAsync(files);
            notify.success("Attachment(s) uploaded");
        } catch (err: any) {
            notify.error(err?.message || "Failed to upload attachment");
        }
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        confirm({
            variant: "danger",
            title: "Remove Attachment",
            description: "Are you sure you want to remove this attachment?",
            confirmText: "Remove",
            onConfirm: async () => {
                try {
                    await deleteAttachmentMutation.mutateAsync(attachmentId);
                    notify.success("Attachment removed");
                } catch (err: any) {
                    notify.error(err?.message || "Failed to remove attachment");
                }
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-gray-600">Loading ticket...</div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Ticket Not Found</h1>
                    <p className="mt-2 text-gray-600">
                        The ticket you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                    </p>
                    <AppButton
                        variantStyle="primary"
                        onClick={() => router.push("/support/tickets")}
                        className="mt-4"
                    >
                        Back to Tickets
                    </AppButton>
                </div>
            </div>
        );
    }

    const ticketLevelAttachments = (ticket.attachments || []).filter((a) => !a.comment_id);

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title={`#${ticket.ticket_code} - ${ticket.subject}`}
                breadcrumbs={[
                    { label: "Support" },
                    { label: "Tickets", href: "/support/tickets" },
                    { label: ticket.ticket_code || ticket.id },
                ]}
            />

            {ticket.merged_into_ticket_id && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    This ticket was merged into{" "}
                    <a
                        href={`/support/tickets/${ticket.merged_into_ticket_id}`}
                        className="font-medium underline"
                    >
                        another ticket
                    </a>{" "}
                    and is now closed.
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
                <TicketTypeBadge type={ticket.type} />
                <TicketSlaBadge sla={ticket.sla} />
                <TicketViewersIndicator ticketId={ticket.id} />
                {ticket.category && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {ticket.category.name}
                    </span>
                )}
                {(ticket.tags || []).map((tag) => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                        {tag.name}
                    </span>
                ))}
                <div className="ml-auto flex items-center gap-2">
                    {canWrite && <ApplyMacroButton ticketId={ticket.id} />}
                    {canWrite && !ticket.merged_into_ticket_id && (
                        <AppButton
                            variantStyle="outline"
                            onClick={() => setIsLinkOpen(true)}
                            startIcon={<Link2 size={14} />}
                        >
                            Link
                        </AppButton>
                    )}
                    {canWrite && !ticket.merged_into_ticket_id && (
                        <AppButton
                            variantStyle="outline"
                            onClick={() => setIsMergeOpen(true)}
                            startIcon={<GitMerge size={14} />}
                        >
                            Merge
                        </AppButton>
                    )}
                    {canWrite && (
                        <AppButton
                            variantStyle="outline"
                            onClick={() => setIsEditOpen(true)}
                            startIcon={<Pencil size={14} />}
                        >
                            Edit
                        </AppButton>
                    )}
                    {canDelete && (
                        <AppButton
                            variantStyle="danger"
                            onClick={handleDelete}
                            startIcon={<Trash2 size={14} />}
                        >
                            Delete
                        </AppButton>
                    )}
                </div>
            </div>

            <AppTabs<DetailTab>
                value={activeTab}
                onChange={handleTabChange}
                tabs={[
                    { value: "overview", label: "Overview" },
                    { value: "activity", label: "Activity" },
                    { value: "conversation", label: "Conversation" },
                ]}
            />

            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-3 text-xs font-bold uppercase text-gray-400">Description</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-gray-400">Customer</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">{ticket.customer_name}</p>
                            <p className="text-xs text-gray-500">{ticket.customer_email}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-gray-400">Assigned Agent</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {ticket.assigned_agent?.fullname || "Unassigned"}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-gray-400">Created By</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {ticket.created_by?.fullname || "-"}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-gray-400">Last Updated</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : "-"}
                            </p>
                        </div>
                    </div>

                    {ticket.custom_fields && Object.keys(ticket.custom_fields).length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h4 className="mb-3 text-xs font-bold uppercase text-gray-400">Custom Fields</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {Object.entries(ticket.custom_fields).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="block text-xs text-gray-400">
                                            {fieldLabelByKey[key] || key}
                                        </span>
                                        <span className="text-sm text-gray-800">{String(value ?? "-")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-3 text-xs font-bold uppercase text-gray-400">Attachments</h4>
                        <div className="space-y-3">
                            <TicketAttachmentList
                                attachments={ticketLevelAttachments}
                                onDelete={canWrite ? handleDeleteAttachment : undefined}
                            />
                            {canWrite && (
                                <TicketAttachmentUploader
                                    onUpload={handleUpload}
                                    isUploading={uploadMutation.isPending}
                                />
                            )}
                        </div>
                    </div>

                    <TicketLinksPanel ticketId={id} />
                </div>
            )}

            {activeTab === "activity" && (
                <TicketCommentThread
                    ticketId={id}
                    channelType={conversation?.channel_type}
                    customerName={ticket.customer_name}
                />
            )}

            {activeTab === "conversation" && (
                <TicketConversationPanel conversationId={ticket.source_conversation_id} />
            )}

            <EditTicketModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} ticket={ticket} />
            <MergeTicketModal isOpen={isMergeOpen} onClose={() => setIsMergeOpen(false)} ticket={ticket} />
            <LinkTicketModal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)} ticket={ticket} />
            {confirmationPopup}
        </div>
    );
}
