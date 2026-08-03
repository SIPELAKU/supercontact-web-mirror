import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTicketAutomationRules,
    createTicketAutomationRule,
    updateTicketAutomationRule,
    deleteTicketAutomationRule,
    CreateTicketAutomationRuleDTO,
    UpdateTicketAutomationRuleDTO,
} from "@/lib/api/ticket-automation-rules";

export function useTicketAutomationRules() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-automation-rules"],
        queryFn: async () => {
            const token = await getToken();
            return fetchTicketAutomationRules(token);
        },
    });
}

export function useCreateTicketAutomationRule() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateTicketAutomationRuleDTO) => {
            const token = await getToken();
            return createTicketAutomationRule(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-automation-rules"] }),
    });
}

export function useUpdateTicketAutomationRule() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTicketAutomationRuleDTO }) => {
            const token = await getToken();
            return updateTicketAutomationRule(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-automation-rules"] }),
    });
}

export function useDeleteTicketAutomationRule() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteTicketAutomationRule(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-automation-rules"] }),
    });
}
