// lib/hooks/useTicketCollab.ts
//
// Phase 5 / Inc 5 - React Query hooks for ticket collaboration:
// followers/CC participants, the agent reply signature, and per-ticket drafts.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    AddTicketParticipantPayload,
    AgentSignature,
    TicketDraft,
    addTicketParticipant,
    deleteTicketDraft,
    deleteTicketParticipant,
    fetchTicketDraft,
    fetchTicketParticipants,
    fetchTicketSignature,
    saveTicketDraft,
    saveTicketSignature,
} from "@/lib/api/ticket-collab";

// ---------------------------------------------------------------------------
// Participants (followers / CC)
// ---------------------------------------------------------------------------
export function useTicketParticipants(ticketId: string) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-participants", ticketId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicketParticipants(token, ticketId);
        },
        enabled: !!ticketId,
    });
}

export function useAddTicketParticipant(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AddTicketParticipantPayload) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return addTicketParticipant(token, ticketId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-participants", ticketId] });
        },
    });
}

export function useDeleteTicketParticipant(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (participantId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicketParticipant(token, ticketId, participantId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-participants", ticketId] });
        },
    });
}

// ---------------------------------------------------------------------------
// Agent signature (per current user)
// ---------------------------------------------------------------------------
export function useTicketSignature() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-signature"],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicketSignature(token);
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}

export function useSaveTicketSignature() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AgentSignature) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return saveTicketSignature(token, payload);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["ticket-signature"], data);
        },
    });
}

// ---------------------------------------------------------------------------
// Reply drafts (composer autosave).
// Kept under an independent ['ticket-drafts', id] key (NOT nested under the
// ticket / comments keys) so the broad invalidations fired on comment send /
// ticket update don't churn or race the composer's own draft GET while the
// agent is typing. The composer manages hydration/autosave explicitly; the
// mutations keep the cache in sync via setQueryData.
// ---------------------------------------------------------------------------
export function useTicketDraft(ticketId: string | null) {
    const { getToken } = useAuth();
    return useQuery<TicketDraft, Error>({
        queryKey: ["ticket-drafts", ticketId],
        queryFn: async () => {
            if (!ticketId) return { body: "" };
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicketDraft(token, ticketId);
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
        enabled: !!ticketId,
    });
}

export function useSaveTicketDraft() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticketId, body }: { ticketId: string; body: string }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return saveTicketDraft(token, ticketId, body);
        },
        onSuccess: (data, { ticketId }) => {
            queryClient.setQueryData(["ticket-drafts", ticketId], data);
        },
    });
}

export function useDeleteTicketDraft() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ticketId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicketDraft(token, ticketId);
        },
        onSuccess: (_, ticketId) => {
            queryClient.setQueryData(["ticket-drafts", ticketId], { body: "" });
        },
    });
}
