import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketForm } from "../TicketForm";
import { useCreateTicket } from "@/lib/hooks/useTickets";
import { notify } from "@/lib/notifications";

interface AddTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddTicketModal({ isOpen, onClose }: AddTicketModalProps) {
    const createMutation = useCreateTicket();

    const handleSubmit = async (data: any) => {
        try {
            await createMutation.mutateAsync(data);
            notify.success("Success", { description: "Ticket created successfully!" });
            onClose();
        } catch (error: any) {
            notify.error("Error", { description: error.message || "Failed to create ticket" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} maxWidth="sm">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#5479EE]">Add Ticket</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new support ticket</p>
                </DialogHeader>
                <TicketForm
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={createMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
