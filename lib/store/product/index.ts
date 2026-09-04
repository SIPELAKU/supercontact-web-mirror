"use client";
import type { AxiosError } from "axios";
import { create } from "zustand";
import api from "@/lib/utils/axiosClient";

export interface ValidationItem {
  type: string;
  loc: string[];
  msg: string;
  input?: unknown;
}

export interface ProductValidationResponse {
  error: string;
  details: ValidationItem[];
}

// Exact API vocabularies (app/models/product_model.py).
export type ProductType = "goods" | "service" | "subscription" | "bundle" | "digital";
export type ProductStatus = "active" | "archived";
export type BillingPeriod = "monthly" | "yearly";
/** GET /products `status` query: the server defaults to `active`. */
export type ProductStatusFilter = ProductStatus | "all";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  goods: "Barang",
  service: "Jasa",
  subscription: "Langganan",
  bundle: "Paket",
  digital: "Digital",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Aktif",
  archived: "Diarsipkan",
};

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: "Bulanan",
  yearly: "Tahunan",
};

type FetchProductParams = {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatusFilter;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** ProductResponse (spec D3.2). Money is a Decimal string, never a float. */
export interface Product {
  id: string;
  product_name: string;
  sku: string;
  price: string;
  description: string | null;
  product_type: ProductType;
  status: ProductStatus;
  cost: string | null;
  image_url: string | null;
  capabilities: string[];
  billing_period: BillingPeriod | null;
  created_at?: string;
  updated_at?: string;
}

/** ProductCreateRequest / ProductUpdateRequest. `status` is update-only. */
export interface ProductPayload {
  product_name: string;
  price: number;
  sku: string;
  description?: string | null;
  product_type?: ProductType;
  status?: ProductStatus;
  cost?: number | null;
  image_url?: string | null;
  capabilities?: string[];
  billing_period?: BillingPeriod | null;
}

type MutationResult = {
  success: boolean;
  error?: string;
  validation?: ValidationItem[];
};

interface GetState {
  listProduct: Product[];
  loading: boolean;
  error: string | null;
  id: string;
  pagination: Pagination;
  searchQuery: string;
  statusFilter: ProductStatusFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  setSearchQuery: (val?: string) => void;
  setStatusFilter: (val: ProductStatusFilter) => void;
  setSort: (sortBy?: string, sortOrder?: "asc" | "desc") => void;

  fetchProduct: (params?: Partial<FetchProductParams>) => Promise<void>;

  postFormProduct: (param?: ProductPayload) => Promise<MutationResult>;

  setEditId: (val: string) => void;

  updateFormProduct: (param?: ProductPayload, id?: string) => Promise<MutationResult>;

  /** DELETE /products/{id} archives (idempotent); nothing is ever physically deleted. */
  archiveProduct: (id: string) => Promise<MutationResult & { status?: ProductStatus }>;

  duplicateProducts: (ids: string[]) => Promise<MutationResult>;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

function readMutationError(error: unknown, fallback: string): MutationResult {
  const axiosErr = error as AxiosError<any>;
  if (axiosErr.response?.data?.error) {
    const errorData = axiosErr.response.data.error;
    return {
      success: false,
      error: typeof errorData === "object" ? errorData.message : errorData,
      validation: typeof errorData === "object" ? errorData.details : undefined,
    };
  }
  return {
    success: false,
    error: axiosErr.message ?? fallback,
  };
}

export const useGetProductStore = create<GetState>((set, get) => ({
  listProduct: [],
  loading: false,
  error: null,
  id: "",
  searchQuery: "",
  statusFilter: "active",
  pagination: {
    page: 1,
    // Matches SuperTable's lazy batch size, so the first fetch and the first
    // "load more" ask for consecutive rows rather than overlapping ones.
    limit: 25,
    total: 0,
    totalPages: 1,
  },
  setEditId: (v) => set({ id: v }),

  setSearchQuery: (v) => set({ searchQuery: v }),

  setStatusFilter: (v) => set({ statusFilter: v }),

  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  fetchProduct: async (params) => {
    try {
      set({ loading: true, error: null });

      const { pagination } = get();

      const query: FetchProductParams = {
        page: params?.page ?? pagination.page,
        limit: params?.limit ?? pagination.limit,
        // Passed explicitly even though the server defaults to `active`, so
        // the request says what it means and the filter is visible in logs.
        status: params?.status ?? get().statusFilter,
      };

      const search = params?.search ?? get().searchQuery;
      if (search && search.trim() !== "") {
        query.search = search;
      }

      const sortBy = params?.sort_by ?? get().sortBy;
      if (sortBy) {
        query.sort_by = sortBy;
        query.sort_order = params?.sort_order ?? get().sortOrder ?? "asc";
      }

      const res = await api.get("/products", {
        params: query,
      });

      const data = res.data.data;

      const products: Product[] = (data.products as Product[]).map((p) => ({
        id: p.id,
        product_name: p.product_name,
        sku: p.sku,
        price: p.price,
        description: p.description ?? null,
        product_type: p.product_type ?? "goods",
        status: p.status ?? "active",
        cost: p.cost ?? null,
        image_url: p.image_url ?? null,
        capabilities: Array.isArray(p.capabilities) ? p.capabilities : [],
        billing_period: p.billing_period ?? null,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      set({
        listProduct: products,
        pagination: {
          page: data.page,
          limit: query.limit,
          total: data.total,
          totalPages: data.total_pages,
        },
      });

    } catch (err) {
      console.error(err);
      set({ error: "Failed to fetch data" });
    } finally {
      set({ loading: false });
    }
  },

  postFormProduct: async (body?: ProductPayload): Promise<MutationResult> => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/products", body);

      if (res.status === 200 || res.status === 201) {
        await get().fetchProduct();
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };
    } catch (error) {
      return readMutationError(error, "Failed to post product");
    } finally {
      set({ loading: false });
    }
  },

  updateFormProduct: async (body?: ProductPayload, id?: string): Promise<MutationResult> => {
    try {
      set({ loading: true, error: null });

      const res = await api.put(`/products/${id}`, body);

      if (res.status === 200) {
        await get().fetchProduct({
          page: get().pagination.page,
          limit: get().pagination.limit
        });
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };

    } catch (error) {
      return readMutationError(error, "Failed to update product");
    } finally {
      set({ loading: false });
    }
  },

  archiveProduct: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const res = await api.delete(`/products/${id}`);

      if (res.status === 200) {
        await get().fetchProduct({
          page: get().pagination.page,
          limit: get().pagination.limit
        });
        return { success: true, status: res.data?.data?.status as ProductStatus | undefined };
      }

      return { success: false, error: "Unexpected response" };

    } catch (error) {
      return readMutationError(error, "Failed to archive product");
    } finally {
      set({ loading: false });
    }
  },

  duplicateProducts: async (ids: string[]) => {
    try {
      set({ loading: true, error: null });

      // Mirrors POST /contacts/duplicate: { product_ids } -> { total, created, products }
      const res = await api.post(`/products/duplicate`, { product_ids: ids });

      if (res.status === 200 || res.status === 201) {
        await get().fetchProduct({
          page: get().pagination.page,
          limit: get().pagination.limit
        });
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };

    } catch (error) {
      return readMutationError(error, "Failed to duplicate products");
    } finally {
      set({ loading: false });
    }
  },

  setPage: (page) => {
    const { fetchProduct, pagination } = get();
    set({ pagination: { ...pagination, page } });
    fetchProduct({ page });
  },

  setLimit: (limit) => {
    const { fetchProduct, pagination } = get();
    set({ pagination: { ...pagination, limit, page: 1 } });
    fetchProduct({ page: 1, limit });
  },
}));
