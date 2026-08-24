// lib/hooks/useTicketSideConversations.ts
//
// Phase 5 / Inc 7 - React Query hooks for ticket side conversations.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    closeSideConversation,
    createSideConversation,
    fetchSideConversation,
    fetchSideConversations,
    postSideConversationMessage,
} from "@/lib/api/ticket-side-conversations";

export function useSideConversations(ticketId: string) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-side-conversations", ticketId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchSideConversations(token, ticketId);
        },
        enabled: !!ticketId,
    });
}

export function useSideConversation(ticketId: string, scId: string | null) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-side-conversation", ticketId, scId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchSideConversation(token, ticketId, scId as string);
        },
        enabled: !!ticketId && !!scId,
    });
}

export function useCreateSideConversation(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (subject: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createSideConversation(token, ticketId, subject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-side-conversations", ticketId] });
        },
    });
}

export function usePostSideConversationMessage(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ scId, body }: { scId: string; body: string }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return postSideConversationMessage(token, ticketId, scId, body);
        },
        onSuccess: (_data, { scId }) => {
            // Refresh both the thread (new message) and the list (message_count).
            queryClient.invalidateQueries({ queryKey: ["ticket-side-conversation", ticketId, scId] });
            queryClient.invalidateQueries({ queryKey: ["ticket-side-conversations", ticketId] });
        },
    });
}

export function useCloseSideConversation(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (scId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return closeSideConversation(token, ticketId, scId);
        },
        onSuccess: (_data, scId) => {
            queryClient.invalidateQueries({ queryKey: ["ticket-side-conversation", ticketId, scId] });
            queryClient.invalidateQueries({ queryKey: ["ticket-side-conversations", ticketId] });
        },
    });
}
