// lib/hooks/useTicketForms.ts
//
// Phase 5 / Inc 7 - React Query hooks for ticket forms (admin) and the
// create-flow form picker.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    CreateTicketFormDTO,
    UpdateTicketFormDTO,
    createTicketForm,
    deleteTicketForm,
    fetchTicketForms,
    updateTicketForm,
} from "@/lib/api/ticket-forms";

export function useTicketForms() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-forms"],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicketForms(token);
        },
    });
}

export function useCreateTicketForm() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateTicketFormDTO) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createTicketForm(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-forms"] }),
    });
}

export function useUpdateTicketForm() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTicketFormDTO }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return updateTicketForm(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-forms"] }),
    });
}

export function useDeleteTicketForm() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicketForm(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-forms"] }),
    });
}
