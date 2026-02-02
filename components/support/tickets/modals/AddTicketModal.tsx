import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketForm } from "../TicketForm";
import { useCreateTicket } from "@/lib/hooks/useTickets";
import { notify } from "@/lib/notifications";
import { Divider } from "@mui/material";

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
                <DialogHeader className="p-0 m-0">
                    <DialogTitle className="text-[#5479EE] p-0 m-0" style={{ fontSize: '22px', fontWeight: 'bold', padding: 0, margin: 0 }}>Add Ticket</DialogTitle>
                    <p className="text-sm text-black-500 mt-1 mb-2">Fill in the details below to create a new support ticket</p>
                </DialogHeader>
                <Divider />
                <div className="mt-6">
                    <TicketForm
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={createMutation.isPending}
                    />
                </div>

            </DialogContent>
        </Dialog>
    );
}
