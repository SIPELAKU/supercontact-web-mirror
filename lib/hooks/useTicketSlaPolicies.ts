import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTicketSlaPolicies,
    createTicketSlaPolicy,
    updateTicketSlaPolicy,
    deleteTicketSlaPolicy,
    CreateTicketSlaPolicyDTO,
    UpdateTicketSlaPolicyDTO,
} from "@/lib/api/ticket-sla-policies";

export function useTicketSlaPolicies(activeOnly: boolean = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-sla-policies", activeOnly],
        queryFn: async () => {
            const token = await getToken();
            return fetchTicketSlaPolicies(token, activeOnly);
        },
    });
}

export function useCreateTicketSlaPolicy() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateTicketSlaPolicyDTO) => {
            const token = await getToken();
            return createTicketSlaPolicy(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-sla-policies"] }),
    });
}

export function useUpdateTicketSlaPolicy() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTicketSlaPolicyDTO }) => {
            const token = await getToken();
            return updateTicketSlaPolicy(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-sla-policies"] }),
    });
}

export function useDeleteTicketSlaPolicy() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteTicketSlaPolicy(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-sla-policies"] }),
    });
}
