import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  archiveProductCategory,
  createProductCategory,
  fetchProductCategories,
  fetchProductCategoryTree,
  updateProductCategory,
} from "@/lib/api/product-categories";
import type {
  ProductCategoryCreate,
  ProductCategoryListParams,
  ProductCategoryUpdate,
} from "@/lib/types/ProductCategory";

export const PRODUCT_CATEGORIES_KEY = "product-categories";

/** One page of the flat list; the previous page stays on screen while the next loads. */
export function useProductCategories(params: ProductCategoryListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRODUCT_CATEGORIES_KEY, params],
    queryFn: async () => fetchProductCategories(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

/** Active nodes, nested - what every category picker renders. */
export function useProductCategoryTree(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [PRODUCT_CATEGORIES_KEY, "tree"],
    queryFn: async () => fetchProductCategoryTree(await getToken()),
    enabled: options?.enabled !== false,
  });
}

/** A category change is visible on products (their `category` brief), so both are stale. */
function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [PRODUCT_CATEGORIES_KEY] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useCreateProductCategory() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductCategoryCreate) => createProductCategory(await getToken(), data),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useUpdateProductCategory() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductCategoryUpdate }) =>
      updateProductCategory(await getToken(), id, data),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useArchiveProductCategory() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveProductCategory(await getToken(), id),
    onSuccess: () => invalidateCategories(queryClient),
  });
}
