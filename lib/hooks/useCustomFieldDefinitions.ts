import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  createCustomFieldDefinition,
  deleteCustomFieldDefinition,
  fetchCustomFieldDefinitions,
  updateCustomFieldDefinition,
} from "@/lib/api/custom-field-definitions";
import type {
  CustomFieldDefinitionCreate,
  CustomFieldDefinitionListParams,
  CustomFieldDefinitionUpdate,
  CustomFieldEntityType,
} from "@/lib/types/CustomFieldDefinition";
import { MAX_ACTIVE_DEFINITIONS_PER_ENTITY } from "@/lib/constants/custom-field-entities";

export const CUSTOM_FIELD_DEFINITIONS_KEY = "custom-field-definitions";

/**
 * Keyed by entity first, then active flag, then the rest - so the product,
 * contact and quotation lists can never collide in the cache.
 */
export function useCustomFieldDefinitions(
  params: CustomFieldDefinitionListParams,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [
      CUSTOM_FIELD_DEFINITIONS_KEY,
      params.entity_type ?? "all",
      params.active_only ?? true,
      params,
    ],
    queryFn: async () => fetchCustomFieldDefinitions(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

/**
 * Every ACTIVE definition of one entity, in display order, in one request -
 * the cap of 100 active definitions per entity is what makes a single page
 * enough. This is what the forms (product, quotation, contact, CRM company)
 * render from.
 */
export function useCustomFieldDefinitionsFor(
  entityType: CustomFieldEntityType,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  const params: CustomFieldDefinitionListParams = {
    entity_type: entityType,
    active_only: true,
    limit: MAX_ACTIVE_DEFINITIONS_PER_ENTITY,
    sort_by: "display_order",
    sort_order: "asc",
    include_total: false,
  };
  const query = useQuery({
    queryKey: [CUSTOM_FIELD_DEFINITIONS_KEY, entityType, true, params],
    queryFn: async () => fetchCustomFieldDefinitions(await getToken(), params),
    enabled: options?.enabled !== false,
  });
  return { ...query, definitions: query.data?.definitions ?? [] };
}

/** A definition change alters what product forms show and validate. */
function invalidateDefinitions(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [CUSTOM_FIELD_DEFINITIONS_KEY] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useCreateCustomFieldDefinition() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CustomFieldDefinitionCreate) => createCustomFieldDefinition(await getToken(), data),
    onSuccess: () => invalidateDefinitions(queryClient),
  });
}

export function useUpdateCustomFieldDefinition() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomFieldDefinitionUpdate }) =>
      updateCustomFieldDefinition(await getToken(), id, data),
    onSuccess: () => invalidateDefinitions(queryClient),
  });
}

export function useDeleteCustomFieldDefinition() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteCustomFieldDefinition(await getToken(), id),
    onSuccess: () => invalidateDefinitions(queryClient),
  });
}
