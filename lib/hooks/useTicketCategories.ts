import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTicketCategories,
    createTicketCategory,
    updateTicketCategory,
    deleteTicketCategory,
} from "@/lib/api/ticket-categories";

export function useTicketCategories(activeOnly: boolean = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-categories", activeOnly],
        queryFn: async () => {
            const token = await getToken();
            return fetchTicketCategories(token, activeOnly);
        },
    });
}

export function useCreateTicketCategory() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; display_order?: number }) => {
            const token = await getToken();
            return createTicketCategory(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-categories"] }),
    });
}

export function useUpdateTicketCategory() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: { name?: string; display_order?: number; is_active?: boolean };
        }) => {
            const token = await getToken();
            return updateTicketCategory(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-categories"] }),
    });
}

export function useDeleteTicketCategory() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteTicketCategory(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-categories"] }),
    });
}
