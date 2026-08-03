import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { uploadTicketAttachments, deleteTicketAttachment } from "@/lib/api/ticket-attachments";

export function useUploadTicketAttachments(ticketId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (files: File[]) => uploadTicketAttachments(ticketId, files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });
}

export function useDeleteTicketAttachment(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attachmentId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicketAttachment(token, ticketId, attachmentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });
}
