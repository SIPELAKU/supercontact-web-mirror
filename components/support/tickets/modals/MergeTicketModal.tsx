"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/app-button";
import { TicketPickerAutocomplete } from "../detail/TicketPickerAutocomplete";
import { useMergeTicket } from "@/lib/hooks/useTickets";
import { notify } from "@/lib/notifications";
import { Ticket } from "@/lib/types/Ticket";

interface MergeTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

export function MergeTicketModal({ isOpen, onClose, ticket }: MergeTicketModalProps) {
    const [duplicate, setDuplicate] = useState<Ticket | null>(null);
    const mergeMutation = useMergeTicket(ticket.id);

    const handleClose = () => {
        setDuplicate(null);
        onClose();
    };

    const handleMerge = async () => {
        if (!duplicate) return;
        try {
            await mergeMutation.mutateAsync(duplicate.id);
            notify.success("Tickets merged", {
                description: `#${duplicate.ticket_code} was merged into this ticket.`,
            });
            handleClose();
        } catch (error: any) {
            notify.error("Error", { description: error.message || "Failed to merge ticket" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose} maxWidth="sm">
            <DialogContent>
                <DialogHeader className="p-0 m-0">
                    <DialogTitle className="text-[#5479EE] p-0 m-0" style={{ fontSize: "22px", fontWeight: "bold", padding: 0, margin: 0 }}>
                        Merge Duplicate Ticket
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        The selected ticket&apos;s comments, attachments, and SLA targets will be moved onto
                        this ticket (#{ticket.ticket_code}). The duplicate will be closed and linked here -
                        it is not deleted.
                    </p>
                </DialogHeader>

                <div className="py-4">
                    <TicketPickerAutocomplete
                        excludeTicketId={ticket.id}
                        value={duplicate}
                        onChange={setDuplicate}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <AppButton variantStyle="outline" onClick={handleClose}>
                        Cancel
                    </AppButton>
                    <AppButton
                        variantStyle="primary"
                        onClick={handleMerge}
                        disabled={!duplicate || mergeMutation.isPending}
                    >
                        {mergeMutation.isPending ? "Merging..." : "Merge"}
                    </AppButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
