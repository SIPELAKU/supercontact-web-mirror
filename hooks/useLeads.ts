import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, loginAndGetToken, createLead, Lead } from "@/lib/api";
import type { UseQueryOptions } from "@tanstack/react-query";

// Fully typed useLeads hook
export function useLeads(page: number, limit: number) {
  return useQuery<
    { data: Lead[]; total: number; totalPages: number }, // TQueryFnData
    Error, // TError
    { data: Lead[]; total: number; totalPages: number }, // TQueryData
    readonly [string, number, number] // TQueryKey
  >({
    queryKey: ["leads", page, limit] as const,
    queryFn: async () => {
      const token = await loginAndGetToken();
      return fetchLeads(token, page, limit);
    },
    // keepPreviousData: true, // optional: uncomment if you want smooth pagination
  } as UseQueryOptions<
    { data: Lead[]; total: number; totalPages: number },
    Error,
    { data: Lead[]; total: number; totalPages: number },
    readonly [string, number, number]
  >);
}

// Fully typed useCreateLead hook
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      const token = await loginAndGetToken();
      return createLead(token, leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
