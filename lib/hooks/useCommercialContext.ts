// lib/hooks/useCommercialContext.ts
//
// React Query hooks for the four Phase 3 master tables, the `usePriceLists.ts`
// shape.
//
// Every write invalidates `["commercial-context"]` AND `["price-lists"]`: a
// customer type, segment, channel or region is a RESOLUTION LEVEL, so changing
// one changes which price list a quotation line resolves to (spec E5.3). The
// contact and company caches go too where a reference column can move with it.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  archiveCustomerSegment,
  archiveCustomerType,
  archiveRegion,
  archiveSalesChannel,
  createCustomerSegment,
  createCustomerType,
  createRegion,
  createSalesChannel,
  evaluateSegments,
  fetchCustomerSegment,
  fetchCustomerSegments,
  fetchCustomerType,
  fetchCustomerTypes,
  fetchRegion,
  fetchRegionTree,
  fetchRegions,
  fetchSalesChannel,
  fetchSalesChannels,
  importReferenceRegions,
  importRegionsFromCrm,
  updateCrmCompanyCommercial,
  updateCustomerSegment,
  updateCustomerType,
  updateRegion,
  updateSalesChannel,
} from "@/lib/api/commercial-context";
import type {
  CrmCompanyCommercialUpdate,
  CustomerSegmentCreate,
  CustomerSegmentListParams,
  CustomerSegmentUpdate,
  CustomerTypeCreate,
  CustomerTypeListParams,
  CustomerTypeUpdate,
  RegionCreate,
  RegionCrmImportRequest,
  RegionListParams,
  RegionUpdate,
  SalesChannelCreate,
  SalesChannelListParams,
  SalesChannelUpdate,
  SegmentEvaluateRequest,
} from "@/lib/types/CommercialContext";

export const COMMERCIAL_CONTEXT_KEY = "commercial-context";

/**
 * A master row is a resolution level, so a write here can change what a
 * quotation line costs: the price-list slice is stale too. `["products"]`
 * carries the catalogue rows the quotation picker reads.
 */
function invalidateCommercialContext(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [COMMERCIAL_CONTEXT_KEY] });
  queryClient.invalidateQueries({ queryKey: ["price-lists"] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

// ── Customer types ────────────────────────────────────────────────────────

export function useCustomerTypes(params: CustomerTypeListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "customer-types", params],
    queryFn: async () => fetchCustomerTypes(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

const ACTIVE_LIST_PARAMS = {
  page: 1,
  limit: 200,
  include_total: false,
  include_inactive: false,
} as const;

/**
 * Every ACTIVE customer type in one request - what the contact form, the
 * Company 360 card and the segment builder render. Read is open to the entity
 * grants (`contacts` / `companies` / `quotations`), not only to the sales
 * config grant (spec A27), so these pickers never 403 for a normal seller.
 */
export function useActiveCustomerTypes(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  const params: CustomerTypeListParams = { ...ACTIVE_LIST_PARAMS, sort_by: "sort_order", sort_order: "asc" };
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "customer-types", params],
    queryFn: async () => fetchCustomerTypes(await getToken(), params),
    enabled: options?.enabled !== false,
  });
}

export function useCustomerType(id: string | null | undefined, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "customer-types", "detail", id],
    queryFn: async () => fetchCustomerType(await getToken(), id as string),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

export function useCreateCustomerType() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CustomerTypeCreate) => createCustomerType(await getToken(), data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useUpdateCustomerType() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerTypeUpdate }) =>
      updateCustomerType(await getToken(), id, data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useArchiveCustomerType() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveCustomerType(await getToken(), id),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

// ── Customer segments ─────────────────────────────────────────────────────

export function useCustomerSegments(
  params: CustomerSegmentListParams,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "customer-segments", params],
    queryFn: async () => fetchCustomerSegments(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

export function useCustomerSegment(id: string | null | undefined, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "customer-segments", "detail", id],
    queryFn: async () => fetchCustomerSegment(await getToken(), id as string),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

export function useCreateCustomerSegment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CustomerSegmentCreate) => createCustomerSegment(await getToken(), data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useUpdateCustomerSegment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerSegmentUpdate }) =>
      updateCustomerSegment(await getToken(), id, data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useArchiveCustomerSegment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveCustomerSegment(await getToken(), id),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

/** Nothing is written and nothing is persisted, so this is a mutation only in
 *  the "POST on demand" sense - it invalidates no cache. */
export function useEvaluateSegments() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (data: SegmentEvaluateRequest) => evaluateSegments(await getToken(), data),
  });
}

// ── Sales channels ────────────────────────────────────────────────────────

export function useSalesChannels(params: SalesChannelListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "sales-channels", params],
    queryFn: async () => fetchSalesChannels(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

/**
 * Every ACTIVE channel in one request - the quotation form's and the lead
 * form's picker. `comm02seed` seeds four channels for EVERY company, so this
 * is non-empty on day one for every tenant (spec A20).
 */
export function useActiveSalesChannels(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  const params: SalesChannelListParams = { ...ACTIVE_LIST_PARAMS, sort_by: "name", sort_order: "asc" };
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "sales-channels", params],
    queryFn: async () => fetchSalesChannels(await getToken(), params),
    enabled: options?.enabled !== false,
  });
}

export function useSalesChannel(id: string | null | undefined, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "sales-channels", "detail", id],
    queryFn: async () => fetchSalesChannel(await getToken(), id as string),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

export function useCreateSalesChannel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SalesChannelCreate) => createSalesChannel(await getToken(), data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useUpdateSalesChannel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SalesChannelUpdate }) =>
      updateSalesChannel(await getToken(), id, data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useArchiveSalesChannel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveSalesChannel(await getToken(), id),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

// ── Regions ───────────────────────────────────────────────────────────────

export function useRegions(params: RegionListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "regions", params],
    queryFn: async () => fetchRegions(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

/** Active nodes, nested - what every region picker renders (ONE query). */
export function useRegionTree(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "regions", "tree"],
    queryFn: async () => fetchRegionTree(await getToken()),
    enabled: options?.enabled !== false,
  });
}

export function useRegion(id: string | null | undefined, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [COMMERCIAL_CONTEXT_KEY, "regions", "detail", id],
    queryFn: async () => fetchRegion(await getToken(), id as string),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

export function useCreateRegion() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegionCreate) => createRegion(await getToken(), data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useUpdateRegion() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RegionUpdate }) =>
      updateRegion(await getToken(), id, data),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useArchiveRegion() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveRegion(await getToken(), id),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

export function useImportReferenceRegions() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => importReferenceRegions(await getToken()),
    onSuccess: () => invalidateCommercialContext(queryClient),
  });
}

/**
 * Used for BOTH the dry-run preview and the real run. A dry run wrote nothing,
 * so it must not invalidate anything - the same rule the bulk price dialog
 * follows.
 */
export function useImportRegionsFromCrm() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegionCrmImportRequest) => importRegionsFromCrm(await getToken(), data),
    onSuccess: (_result, variables) => {
      if (variables?.dry_run) return;
      invalidateCommercialContext(queryClient);
      // The importer stamps crm_companies.region_id, so the saved-company
      // lists and every open Company 360 are stale.
      queryClient.invalidateQueries({ queryKey: ["my-target-companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-profile-360"] });
    },
  });
}

// ── Saved CRM company commercial card ─────────────────────────────────────

export function useUpdateCrmCompanyCommercial() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      crmCompanyId,
      data,
    }: {
      crmCompanyId: string;
      data: CrmCompanyCommercialUpdate;
    }) => updateCrmCompanyCommercial(await getToken(), crmCompanyId, data),
    onSuccess: () => {
      // The two reference columns are a resolution level for every quotation
      // whose contact belongs to this company.
      invalidateCommercialContext(queryClient);
      queryClient.invalidateQueries({ queryKey: ["my-target-companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-profile-360"] });
    },
  });
}
