"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useTicketLinks, useDeleteTicketLink } from "@/lib/hooks/useTickets";
import { usePermission } from "@/lib/hooks/usePermission";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { TicketStatusBadge } from "../TicketBadges";

interface TicketLinksPanelProps {
    ticketId: string;
}

export function TicketLinksPanel({ ticketId }: TicketLinksPanelProps) {
    const { data } = useTicketLinks(ticketId);
    const links = data?.data?.data || [];
    const deleteMutation = useDeleteTicketLink(ticketId);
    const { can } = usePermission();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);
    const { confirm, confirmationPopup } = useConfirmationPopup();

    if (links.length === 0) return null;

    const handleRemove = (linkId: string) => {
        confirm({
            variant: "danger",
            title: "Remove Link",
            description: "Remove this related-ticket link?",
            confirmText: "Remove",
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync(linkId);
                    notify.success("Link removed");
                } catch (error: any) {
                    notify.error("Error", { description: error.message || "Failed to remove link" });
                }
            },
        });
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="mb-3 text-xs font-bold uppercase text-gray-400">Related Tickets</h4>
            <div className="space-y-2">
                {links.map((link) => (
                    <div
                        key={link.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                    >
                        <Link
                            href={`/support/tickets/${link.other_ticket.id}`}
                            className="text-sm font-medium text-[#5479EE] hover:underline truncate"
                        >
                            #{link.other_ticket.ticket_code} - {link.other_ticket.subject}
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                            <TicketStatusBadge status={link.other_ticket.status} />
                            {canWrite && (
                                <button
                                    onClick={() => handleRemove(link.id)}
                                    className="text-gray-400 hover:text-red-600"
                                    aria-label="Remove link"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {confirmationPopup}
        </div>
    );
}
