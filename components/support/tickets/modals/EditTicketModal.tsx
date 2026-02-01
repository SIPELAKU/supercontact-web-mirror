import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketForm } from "../TicketForm";
import { useUpdateTicket } from "@/lib/hooks/useTickets";
import { notify } from "@/lib/notifications";
import { Ticket } from "@/lib/types/Ticket";

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose} maxWidth="sm">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#5479EE]">Edit Ticket</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">Fill in the details below to update the support ticket</p>
                </DialogHeader>
                {ticket && (
                    <TicketForm
                        initialData={ticket}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={updateMutation.isPending}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
