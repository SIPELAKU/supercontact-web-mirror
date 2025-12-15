"use client";

import { create } from "zustand";
import axiosInternal from "@/lib/utils/axiosInternal";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Contact {
    name: string;
    email: string;
    company: string;
    phone: string;
    job_title: string;
    address: string;
    id: string;
}

interface GetState {
  listContact: Contact[];
  loading: boolean;
  error: string | null;

  pagination: Pagination;

  fetchContact: (params?: { page?: number; limit?: number }) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useGetContactStore = create<GetState>((set, get) => ({
  listContact: [],
  loading: false,
  error: null,

  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },

  fetchContact: async (params) => {
    try {
      set({ loading: true, error: null });

      const { pagination } = get();

      const query = {
        page: params?.page ?? pagination.page,
        limit: params?.limit ?? pagination.limit,
      };

      const res = await axiosInternal.get("/contact", {
        params: query,
      });

      const data = res.data;

      set({
        listContact: data,
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
    const { fetchContact, pagination } = get();
    set({ pagination: { ...pagination, page } });
    fetchContact({ page });
  },

  setLimit: (limit) => {
    const { fetchContact, pagination } = get();
    set({ pagination: { ...pagination, limit, page: 1 } });
    fetchContact({ page: 1, limit });
  },
}));
