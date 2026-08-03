import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTicketMacros,
    createTicketMacro,
    updateTicketMacro,
    deleteTicketMacro,
    applyTicketMacro,
    CreateTicketMacroDTO,
    UpdateTicketMacroDTO,
} from "@/lib/api/ticket-macros";

export function useTicketMacros(activeOnly: boolean = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-macros", activeOnly],
        queryFn: async () => {
            const token = await getToken();
            return fetchTicketMacros(token, activeOnly);
        },
    });
}

export function useCreateTicketMacro() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateTicketMacroDTO) => {
            const token = await getToken();
            return createTicketMacro(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-macros"] }),
    });
}

export function useUpdateTicketMacro() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTicketMacroDTO }) => {
            const token = await getToken();
            return updateTicketMacro(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-macros"] }),
    });
}

export function useDeleteTicketMacro() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteTicketMacro(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-macros"] }),
    });
}

export function useApplyTicketMacro(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (macroId: string) => {
            const token = await getToken();
            return applyTicketMacro(token, ticketId, macroId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
        },
    });
}
