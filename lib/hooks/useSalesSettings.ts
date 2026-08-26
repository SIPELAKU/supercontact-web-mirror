import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSalesSettings, updateSalesSettings } from "@/lib/api/sales-settings";

const KEY = ["sales-settings"];

export function useSalesSettings() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: KEY,
        queryFn: async () => {
            const token = await getToken();
            return fetchSalesSettings(token);
        },
    });
}

export function useUpdateSalesSettings() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { enabled: boolean; note?: string | null }) => {
            const token = await getToken();
            return updateSalesSettings(token, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
}
