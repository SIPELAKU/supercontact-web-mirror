import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchTickets, fetchTicket, createTicket, updateTicket, deleteTicket } from "@/lib/api/tickets";
import { CreateTicketDTO, UpdateTicketDTO } from "@/lib/types/Ticket";

export function useTickets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    priority?: string,
    agentId?: string
) {
    const { getToken } = useAuth();

    return useQuery({
        queryKey: ["tickets", page, limit, search, status, priority, agentId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTickets(token, page, limit, search, status, priority, agentId);
        },
        placeholderData: keepPreviousData,
    });
}

export function useTicket(id: string) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket", id],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicket(token, id);
        },
        enabled: !!id,
    });
}

export function useCreateTicket() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTicketDTO) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createTicket(token, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useUpdateTicket() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTicketDTO }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return updateTicket(token, id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket"] });
        },
    });
}

export function useDeleteTicket() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicket(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}
