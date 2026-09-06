import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { archiveUnit, createUnit, fetchUnits, updateUnit } from "@/lib/api/units";
import type { UnitCreate, UnitListParams, UnitUpdate } from "@/lib/types/Unit";

export const UNITS_KEY = "units";

export function useUnits(params: UnitListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [UNITS_KEY, params],
    queryFn: async () => fetchUnits(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

const ACTIVE_UNITS_PARAMS: UnitListParams = { limit: 100, include_inactive: false, include_total: false };

/** Every active unit in one request - the product form's "Satuan" picker. */
export function useActiveUnits(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [UNITS_KEY, ACTIVE_UNITS_PARAMS],
    queryFn: async () => fetchUnits(await getToken(), ACTIVE_UNITS_PARAMS),
    enabled: options?.enabled !== false,
  });
}

/** Renaming a unit changes the `unit` brief on every product that uses it. */
function invalidateUnits(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [UNITS_KEY] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useCreateUnit() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UnitCreate) => createUnit(await getToken(), data),
    onSuccess: () => invalidateUnits(queryClient),
  });
}

export function useUpdateUnit() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UnitUpdate }) => updateUnit(await getToken(), id, data),
    onSuccess: () => invalidateUnits(queryClient),
  });
}

export function useArchiveUnit() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveUnit(await getToken(), id),
    onSuccess: () => invalidateUnits(queryClient),
  });
}
