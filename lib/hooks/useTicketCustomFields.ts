import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTicketCustomFields,
    createTicketCustomField,
    updateTicketCustomField,
    deleteTicketCustomField,
    CreateTicketCustomFieldDTO,
    UpdateTicketCustomFieldDTO,
} from "@/lib/api/ticket-custom-fields";

export function useTicketCustomFields(activeOnly: boolean = true) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-custom-fields", activeOnly],
        queryFn: async () => {
            const token = await getToken();
            return fetchTicketCustomFields(token, activeOnly);
        },
    });
}

export function useCreateTicketCustomField() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateTicketCustomFieldDTO) => {
            const token = await getToken();
            return createTicketCustomField(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-custom-fields"] }),
    });
}

export function useUpdateTicketCustomField() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTicketCustomFieldDTO }) => {
            const token = await getToken();
            return updateTicketCustomField(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-custom-fields"] }),
    });
}

export function useDeleteTicketCustomField() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteTicketCustomField(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-custom-fields"] }),
    });
}
