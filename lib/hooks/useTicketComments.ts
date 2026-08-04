import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTicketComments,
    createTicketComment,
    createTicketCommentWithUpload,
    updateTicketComment,
    deleteTicketComment,
} from "@/lib/api/ticket-comments";

export function useTicketComments(ticketId: string, options?: { live?: boolean }) {
    const { getToken } = useAuth();

    return useQuery({
        queryKey: ["ticket-comments", ticketId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicketComments(token, ticketId);
        },
        enabled: !!ticketId,
        // Only poll when the ticket has a linked WhatsApp/email conversation -
        // that's the only case a customer reply can land here without a
        // manual refresh. Avoids needless polling on every other ticket.
        refetchInterval: options?.live ? 8000 : undefined,
        refetchOnWindowFocus: options?.live ? true : undefined,
    });
}

export function useCreateTicketComment(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { body: string; is_internal_note: boolean; files?: File[] }) => {
            if (data.files && data.files.length > 0) {
                const formData = new FormData();
                formData.append("body", data.body);
                formData.append("is_internal_note", String(data.is_internal_note));
                data.files.forEach((file) => formData.append("files", file));
                return createTicketCommentWithUpload(ticketId, formData);
            }
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createTicketComment(token, ticketId, {
                body: data.body,
                is_internal_note: data.is_internal_note,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
        },
    });
}

export function useUpdateTicketComment(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, body }: { commentId: string; body: string }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return updateTicketComment(token, ticketId, commentId, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
        },
    });
}

export function useDeleteTicketComment(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicketComment(token, ticketId, commentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
        },
    });
}
