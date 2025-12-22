"use client";
import type { AxiosError } from "axios";
import { create } from "zustand";
import { ProductPayload } from "@/components/product/AddProductModal";
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

type FetchProductParams = {
  page: number;
  limit: number;
  search?: string;
};


interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Product {
  id: string;
  product_name: string;
  sku: string;
  price: number;
  description: string;
  tax_rate?: string;
}

interface GetState {
  listProduct: Product[];
  loading: boolean;
  error: string | null;
  id: string;
  pagination: Pagination;
  searchQuery: string;

  setSearchQuery: (val?: string) => void;

  fetchProduct: (params?: Partial<FetchProductParams>) => Promise<void>;

  postFormProduct: (param?: ProductPayload) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;

  setEditId: (val: string) => void;

  updateFormProduct: (param?: ProductPayload, id?: string) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;

  deleteProduct: (id: string) => Promise<{
    success: boolean;
    error?: string;
    validation?: ValidationItem[];
  }>;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useGetProductStore = create<GetState>((set, get) => ({
  listProduct: [],
  loading: false,
  error: null,
  id: "",
  searchQuery: "",
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },
  setEditId: (v) => set({ id: v }),

  setSearchQuery: (v) => set({ searchQuery: v }),

  fetchProduct: async (params) => {
    try {
      set({ loading: true, error: null });

      const { pagination } = get();

      const query: FetchProductParams = {
        page: params?.page ?? pagination.page,
        limit: params?.limit ?? pagination.limit,
      };

      if (params?.search && params.search.trim() !== "") {
        query.search = params.search;
      }

      const res = await api.get("/products", {
        params: query,
      });

      const data = res.data.data;

      let temp: Product[] = []
      data.products.map((p: Product) => {
        const product = {
          id: p.id,
          product_name: p.product_name,
          sku: p.sku,
          price: p.price,
          tax_rate: `11%`,
          description: p.description
        }
        temp.push(product)
      })

      set({
        listProduct: [...temp],
        pagination: {
          page: data.page,
          limit: pagination.limit,
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

  postFormProduct: async (body?: ProductPayload): Promise<{ success: boolean; error?: string; validation?: ValidationItem[]; }> => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/products", body);

      if (res.status === 200) {
        await get().fetchProduct();
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };
    } catch (error) {
      const axiosErr = error as AxiosError<ProductValidationResponse>;
      if (axiosErr.response?.status === 422 && axiosErr.response.data) {
        return {
          success: false,
          error: axiosErr.response.data.error,
          validation: axiosErr.response.data.details,
        };
      }
      return {
        success: false,
        error:
          axiosErr.response?.data?.error ??
          axiosErr.message ??
          "Failed to post pipeline",
      };
    } finally {
      set({ loading: false });
    }
  },

  updateFormProduct: async (body?: ProductPayload, id?: string): Promise<{ success: boolean; error?: string; validation?: ValidationItem[]; }> => {
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

      const axiosErr = error as AxiosError<ProductValidationResponse>;
      if (axiosErr.response?.status === 422 && axiosErr.response.data) {
        return {
          success: false,
          error: axiosErr.response.data.error,
          validation: axiosErr.response.data.details,
        };
      }
      return {
        success: false,
        error:
          axiosErr.response?.data?.error ??
          axiosErr.message ??
          "Failed to post pipeline",
      };
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const res = await api.delete(`/products/${id}`);

      if (res.status === 200) {
        await get().fetchProduct({
          page: get().pagination.page,
          limit: get().pagination.limit
        });
        return { success: true };
      }

      return { success: false, error: "Unexpected response" };

    } catch (error) {

      const axiosErr = error as AxiosError<ProductValidationResponse>;
      if (axiosErr.response?.status === 422 && axiosErr.response.data) {
        return {
          success: false,
          error: axiosErr.response.data.error,
          validation: axiosErr.response.data.details,
        };
      }
      return {
        success: false,
        error:
          axiosErr.response?.data?.error ??
          axiosErr.message ??
          "Failed to deletes pipeline",
      };
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
