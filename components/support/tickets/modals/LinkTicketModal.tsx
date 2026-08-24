"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { TicketPickerAutocomplete } from "../detail/TicketPickerAutocomplete";
import { useCreateTicketLink } from "@/lib/hooks/useTickets";
import { notify } from "@/lib/notifications";
import { Ticket, TicketLinkType, TICKET_LINK_TYPE_OPTIONS } from "@/lib/types/Ticket";

interface LinkTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

export function LinkTicketModal({ isOpen, onClose, ticket }: LinkTicketModalProps) {
    const [related, setRelated] = useState<Ticket | null>(null);
    const [linkType, setLinkType] = useState<TicketLinkType>("related");
    const linkMutation = useCreateTicketLink(ticket.id);

    const handleClose = () => {
        setRelated(null);
        setLinkType("related");
        onClose();
    };

    const handleLink = async () => {
        if (!related) return;
        try {
            await linkMutation.mutateAsync({ linkedTicketId: related.id, linkType });
            notify.success("Tickets linked");
            handleClose();
        } catch (error: any) {
            notify.error("Error", { description: error.message || "Failed to link ticket" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose} maxWidth="sm">
            <DialogContent>
                <DialogHeader className="p-0 m-0">
                    <DialogTitle className="text-[#5479EE] p-0 m-0" style={{ fontSize: "22px", fontWeight: "bold", padding: 0, margin: 0 }}>
                        Link Related Ticket
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Connect this ticket to a related one for reference - no data is moved or merged.
                    </p>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Relationship
                        </label>
                        <AppSelect
                            options={TICKET_LINK_TYPE_OPTIONS}
                            value={linkType}
                            isBgWhite={true}
                            onChange={(e) => setLinkType(e.target.value as TicketLinkType)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Ticket
                        </label>
                        <TicketPickerAutocomplete
                            excludeTicketId={ticket.id}
                            value={related}
                            onChange={setRelated}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <AppButton variantStyle="outline" onClick={handleClose}>
                        Cancel
                    </AppButton>
                    <AppButton
                        variantStyle="primary"
                        onClick={handleLink}
                        disabled={!related || linkMutation.isPending}
                    >
                        {linkMutation.isPending ? "Linking..." : "Link"}
                    </AppButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
