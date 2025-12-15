"use client";

import { create } from "zustand";
import axiosInternal from "@/lib/utils/axiosInternal";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Product {
  id: string,
  product_name: string,
  sku: string,
  price: number,
  tax_rate: string,
}

interface GetState {
  listProduct: Product[];
  loading: boolean;
  error: string | null;

  pagination: Pagination;

  fetchProduct: (params?: { page?: number; limit?: number }) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useGetProductStore = create<GetState>((set, get) => ({
  listProduct: [],
  loading: false,
  error: null,

  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },

  fetchProduct: async (params) => {
    try {
      set({ loading: true, error: null });

      const { pagination } = get();

      const query = {
        page: params?.page ?? pagination.page,
        limit: params?.limit ?? pagination.limit,
      };

      const res = await axiosInternal.get("/sales/product", {
        params: query,
      });

      const data = res.data.data;

      let temp: Product[] = []
      data.products.map((p: Product)=>{
        const product = {
          id: p.id,
          product_name: p.product_name,
          sku: p.sku,
          price: p.price,
          tax_rate: `11%`,
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
