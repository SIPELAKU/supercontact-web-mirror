import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  addPriceListPrice,
  archivePriceList,
  bulkUpdatePrices,
  closePriceListPrice,
  createAssignment,
  createPriceList,
  deleteAssignment,
  fetchAssignments,
  fetchPriceList,
  fetchPriceListPrices,
  fetchPriceLists,
  fetchPriceListsForCustomer,
  searchAssignmentTargets,
  updateAssignment,
  updatePriceList,
} from "@/lib/api/price-lists";
import type {
  AssignmentTargetSearchParams,
  BulkPriceUpdateRequest,
  PriceListAssignmentCreate,
  PriceListAssignmentListParams,
  PriceListAssignmentUpdate,
  PriceListCreate,
  PriceListListParams,
  PriceListResolutionParams,
  PriceListUpdate,
  ProductPriceCreate,
  ProductPriceListParams,
} from "@/lib/types/PriceList";

export const PRICE_LISTS_KEY = "price-lists";

export function usePriceLists(params: PriceListListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "list", params],
    queryFn: async () => fetchPriceLists(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

const ACTIVE_PRICE_LIST_PARAMS: PriceListListParams = {
  page: 1,
  limit: 100,
  status: "active",
  include_total: false,
  sort_by: "priority",
  sort_order: "desc",
};

/** Every active list in one request - the bulk dialog's "source list" picker. */
export function useActivePriceLists(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "list", ACTIVE_PRICE_LIST_PARAMS],
    queryFn: async () => fetchPriceLists(await getToken(), ACTIVE_PRICE_LIST_PARAMS),
    enabled: options?.enabled !== false,
  });
}

export function usePriceList(id: string | null | undefined, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "detail", id],
    queryFn: async () => fetchPriceList(await getToken(), id as string),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

/**
 * A price list changes what a quotation line costs, and the quotation form
 * reads products, so both caches go. `["products"]` also carries the catalogue
 * slice the picker reads.
 */
function invalidatePriceLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [PRICE_LISTS_KEY] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useCreatePriceList() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PriceListCreate) => createPriceList(await getToken(), data),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

export function useUpdatePriceList() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PriceListUpdate }) =>
      updatePriceList(await getToken(), id, data),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

export function useArchivePriceList() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archivePriceList(await getToken(), id),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

// ── Prices ────────────────────────────────────────────────────────────────

export function usePriceListPrices(
  priceListId: string | null | undefined,
  params: ProductPriceListParams,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "prices", priceListId, params],
    queryFn: async () => fetchPriceListPrices(await getToken(), priceListId as string, params),
    placeholderData: keepPreviousData,
    enabled: Boolean(priceListId) && options?.enabled !== false,
  });
}

export function useAddPriceListPrice() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ priceListId, data }: { priceListId: string; data: ProductPriceCreate }) =>
      addPriceListPrice(await getToken(), priceListId, data),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

export function useClosePriceListPrice() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ priceListId, priceId }: { priceListId: string; priceId: string }) =>
      closePriceListPrice(await getToken(), priceListId, priceId),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

/**
 * The dialog's PREVIEW: the same endpoint with `dry_run: true`, so the
 * `{closed, inserted, skipped, sample}` report a user confirms against is
 * computed by the server's own Decimal ROUND_HALF_UP. There is deliberately no
 * JS re-implementation of that arithmetic anywhere in this repo (spec S3-10).
 *
 * Nothing is written, so this is a query, not a mutation, and it invalidates
 * nothing.
 */
export function useBulkPricePreview(
  priceListId: string | null | undefined,
  data: BulkPriceUpdateRequest | null,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "bulk-preview", priceListId, data],
    queryFn: async () =>
      bulkUpdatePrices(await getToken(), priceListId as string, {
        ...(data as BulkPriceUpdateRequest),
        dry_run: true,
      }),
    placeholderData: keepPreviousData,
    retry: false,
    enabled: Boolean(priceListId) && Boolean(data) && options?.enabled !== false,
  });
}

/**
 * Used for BOTH the dry-run preview and the real write. A dry run must not
 * invalidate anything - it wrote nothing.
 */
export function useBulkUpdatePrices() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      priceListId,
      data,
    }: {
      priceListId: string;
      data: BulkPriceUpdateRequest;
    }) => bulkUpdatePrices(await getToken(), priceListId, data),
    onSuccess: (_result, variables) => {
      if (variables.data.dry_run) return;
      invalidatePriceLists(queryClient);
    },
  });
}

// ── Assignments ───────────────────────────────────────────────────────────

export function usePriceListAssignments(
  priceListId: string | null | undefined,
  params: PriceListAssignmentListParams,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "assignments", priceListId, params],
    queryFn: async () => fetchAssignments(await getToken(), priceListId as string, params),
    placeholderData: keepPreviousData,
    enabled: Boolean(priceListId) && options?.enabled !== false,
  });
}

export function useCreateAssignment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      priceListId,
      data,
    }: {
      priceListId: string;
      data: PriceListAssignmentCreate;
    }) => createAssignment(await getToken(), priceListId, data),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

export function useUpdateAssignment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      priceListId,
      assignmentId,
      data,
    }: {
      priceListId: string;
      assignmentId: string;
      data: PriceListAssignmentUpdate;
    }) => updateAssignment(await getToken(), priceListId, assignmentId, data),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

export function useDeleteAssignment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      priceListId,
      assignmentId,
    }: {
      priceListId: string;
      assignmentId: string;
    }) => deleteAssignment(await getToken(), priceListId, assignmentId),
    onSuccess: () => invalidatePriceLists(queryClient),
  });
}

// ── Pickers / explainer ───────────────────────────────────────────────────

/** Server-side target search; the picker debounces its `search` before it lands here. */
export function useAssignmentTargetSearch(
  params: AssignmentTargetSearchParams,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "targets", params],
    queryFn: async () => searchAssignmentTargets(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

export function usePriceListsForCustomer(
  params: PriceListResolutionParams,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRICE_LISTS_KEY, "for-customer", params],
    queryFn: async () => fetchPriceListsForCustomer(await getToken(), params),
    enabled:
      options?.enabled !== false && Boolean(params.contact_id || params.crm_company_id),
  });
}
