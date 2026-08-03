import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
    fetchBusinessHours,
    createBusinessHours,
    updateBusinessHours,
    deleteBusinessHours,
    CreateBusinessHoursDTO,
    UpdateBusinessHoursDTO,
} from "@/lib/api/business-hours";

export function useBusinessHours() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ["business-hours"],
        queryFn: async () => {
            const token = await getToken();
            return fetchBusinessHours(token);
        },
    });
}

export function useCreateBusinessHours() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateBusinessHoursDTO) => {
            const token = await getToken();
            return createBusinessHours(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-hours"] }),
    });
}

export function useUpdateBusinessHours() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateBusinessHoursDTO }) => {
            const token = await getToken();
            return updateBusinessHours(token, id, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-hours"] }),
    });
}

export function useDeleteBusinessHours() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return deleteBusinessHours(token, id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-hours"] }),
    });
}
