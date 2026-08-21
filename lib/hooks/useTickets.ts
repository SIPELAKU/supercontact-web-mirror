import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchTickets,
    fetchTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    fetchAssignableAgents,
    bulkDeleteTickets,
    bulkUpdateTickets,
    bulkAssignTickets,
    mergeTicket,
    createTicketLink,
    fetchTicketLinks,
    deleteTicketLink,
} from "@/lib/api/tickets";
import { CreateTicketDTO, TicketPriority, TicketStatus, UpdateTicketDTO } from "@/lib/types/Ticket";

export function useTickets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    priority?: string,
    type?: string,
    agentId?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) {
    const { getToken } = useAuth();

    return useQuery({
        queryKey: ["tickets", page, limit, search, status, priority, type, agentId, sortBy, sortOrder],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTickets(token, page, limit, search, status, priority, type, agentId, sortBy, sortOrder);
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

export function useBulkDeleteTickets() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ticketIds: string[]) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return bulkDeleteTickets(token, ticketIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useBulkUpdateTickets() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ticketIds,
            data,
        }: {
            ticketIds: string[];
            data: { status?: TicketStatus; priority?: TicketPriority; category_id?: string | null };
        }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return bulkUpdateTickets(token, ticketIds, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useBulkAssignTickets() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ticketIds, assignedAgentId }: { ticketIds: string[]; assignedAgentId: string }) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return bulkAssignTickets(token, ticketIds, assignedAgentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useMergeTicket(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (duplicateTicketId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return mergeTicket(token, ticketId, duplicateTicketId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useTicketLinks(ticketId: string) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["ticket-links", ticketId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            return fetchTicketLinks(token, ticketId);
        },
        enabled: !!ticketId,
    });
}

export function useCreateTicketLink(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (linkedTicketId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return createTicketLink(token, ticketId, linkedTicketId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-links", ticketId] });
        },
    });
}

export function useDeleteTicketLink(ticketId: string) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (linkId: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return deleteTicketLink(token, ticketId, linkId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-links", ticketId] });
        },
    });
}

export function useAssignableAgents(search?: string) {
    const { getToken } = useAuth();

    return useQuery({
        queryKey: ["assignable-agents", search],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return fetchAssignableAgents(token, search);
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
