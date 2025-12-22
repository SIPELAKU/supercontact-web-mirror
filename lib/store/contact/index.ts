"use client";

import { create } from "zustand";
import api from "@/lib/utils/axiosClient";
import { DealStage } from "@/components/pipeline/SelectDealStage";

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
  listContact: DealStage[];
  loading: boolean;
  error: string | null;

  pagination: Pagination;

  fetchContact: (params?: { query?: string; page?: number; limit?: number }) => Promise<void>;
  clearContact: () => void;
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
        search: params?.query,
      };

      const res = await api.get("/contacts", {
        params: query,
      });

      const data = res.data.data;

      const temp: DealStage[]  = []
        data.contacts.map((arr: Contact) => {
            let contact = {
                value: arr.id,
                label: arr.name
            }
            temp.push(contact)
        })
      
      set({
        listContact: data.data ?? temp,
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
  clearContact: () => set({ listContact: [] }),
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
