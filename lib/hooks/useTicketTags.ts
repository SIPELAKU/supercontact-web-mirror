import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchTicketTags, createTicketTag, deleteTicketTag } from "@/lib/api/ticket-tags";

export function useTicketTags() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-tags"],
        queryFn: async () => {
            const token = await getToken();
            return fetchTicketTags(token);
        },
    });
}

export function useCreateTicketTag() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            const token = await getToken();
            return createTicketTag(token, name);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-tags"] }),
    });
}

export function useDeleteTicketTag() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteTicketTag(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-tags"] }),
    });
}
