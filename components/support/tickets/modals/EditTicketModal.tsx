import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketForm } from "../TicketForm";
import { useUpdateTicket } from "@/lib/hooks/useTickets";
import { notify } from "@/lib/notifications";
import { Ticket } from "@/lib/types/Ticket";
import { Divider } from "@mui/material";
import { useState } from "react";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

interface EditTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

export function EditTicketModal({ isOpen, onClose, ticket }: EditTicketModalProps) {
    const updateMutation = useUpdateTicket();

    const handleSubmit = async (data: any) => {
        if (!ticket) return;

        try {
            await updateMutation.mutateAsync({ id: ticket.id, data });
            notify.success("Success", { description: "Ticket updated successfully!" });
            onClose();
        } catch (error: any) {
            notify.error("Error", { description: error.message || "Failed to update ticket" });
        }
    };

    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={() => setShowCloseConfirmation(true)} maxWidth="sm">
                <DialogContent>
                    <DialogHeader className="p-0 m-0">
                        <DialogTitle className="text-[#5479EE] p-0 m-0" style={{ fontSize: '22px', fontWeight: 'bold', padding: 0, margin: 0 }}>Edit Ticket</DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">Fill in the details below to update the support ticket</p>
                    </DialogHeader>
                    {ticket && (
                        <TicketForm
                            initialData={ticket}
                            onSubmit={handleSubmit}
                            onCancel={handleClose}
                            isLoading={updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmationPopup
                isOpen={showCloseConfirmation}
                onClose={() => setShowCloseConfirmation(false)}
                onConfirm={() => {
                    setShowCloseConfirmation(false);
                    handleClose();
                }}
                title="Are you sure?"
                description="This will discard your current record."
                confirmText="Discard record"
                cancelText="Cancel"
                variant="discard"
            />
        </>
    );
}
