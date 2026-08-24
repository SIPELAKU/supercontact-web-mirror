"use client";
import { getDateRange } from "@/lib/helper/getDateRange";
import api from "@/lib/utils/axiosClient";
import { create } from "zustand";

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

export interface LeadContact {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
}

export interface LeadUser {
    id: string;
    fullname: string;
    email: string;
}


export interface Lead {
    id: string;
    office_location: string;
    contact: LeadContact;
    user: LeadUser;
}


type FetchQuotationParams = {
    page: number;
    limit: number;
    search?: string;
    dateRange?: string;
    status?: string;
    date_from?: string; // Client Side Injector prop
    date_to?: string;   // Client Side Injector prop
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

type requestBody = {
    page: number;
    limit: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    quotation_status?: string;
    status?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

export interface QuotationItem {
    id: string;
    quotation_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
    notes: string;
    product: QuotationProduct;
}

export interface QuotationProduct {
    product_name: string;
    sku: string;
    price: number;
}


interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Quotation {
    id: string;
    product_name: string;
    sku: string;
    price: number;
    description: string;
    tax_rate?: string;
}

export interface Quotation {
    id: string;
    lead_id: string;
    quotation_number: string;
    quotation_title: string;
    expire_date: string;
    grand_total: number;
    quotation_status: "Pending" | "Approved" | "Rejected" | "Expired" | "Accepted";
    lead: Lead;
    items: QuotationItem[];
    created_at: string;
    updated_at: string;
}

interface GetState {
    listQuotations: Quotation[];
    loading: boolean;
    error: string | null;
    id: string;
    pagination: Pagination;
    searchQuery: string;
    statusFilter: string;
    dateRangeFilter: string;
    setStatusFilter: (val: string) => void;
    setDateRangeFilter: (val: string) => void;

    setSearchQuery: (val?: string) => void;

    fetchQuotations: (params?: Partial<FetchQuotationParams>) => Promise<void>;

    setEditId: (val: string) => void;

    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

export const useGetQuotationstore = create<GetState>((set, get) => ({
    listQuotations: [],
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
    statusFilter: "all",
    dateRangeFilter: "all",

    setStatusFilter: (v) => set((state) => ({
        statusFilter: v,
        pagination: { ...state.pagination, page: 1 }
    })),

    setDateRangeFilter: (v) => set((state) => ({
        dateRangeFilter: v,
        pagination: { ...state.pagination, page: 1 }
    })),

    setEditId: (v) => set({ id: v }),

    setSearchQuery: (v) => set((state) => ({
        searchQuery: v ?? "",
        pagination: { ...state.pagination, page: 1 }
    })),

    fetchQuotations: async (params) => {
        try {
            set({ loading: true, error: null });

            const { pagination } = get();

            const query: requestBody = {
                page: params?.page ?? pagination.page,
                limit: params?.limit ?? pagination.limit,
            };
            // Inject Explicit Client Property First
            if (params?.date_from && params?.date_to) {
                query.date_from = params.date_from;
                query.date_to = params.date_to;
            } else {
                const dateRange = params?.dateRange ?? get().dateRangeFilter;
                if (dateRange && dateRange !== "all") {
                    const range = getDateRange(dateRange);
                    if (range) {
                        query.date_from = String(range.start);
                        query.date_to = String(range.end);
                    }
                }
            }

            const status = params?.status ?? get().statusFilter;
            if (status && status.trim() !== "all") {
                query.status = status;
                query.quotation_status = status;
                // Add lowercase versions as some APIs are case-sensitive
                (query as any).status_lower = status.toLowerCase();
                (query as any).filter = status;
                (query as any).quotation_status_lower = status.toLowerCase();
            }

            if (params?.sort_by) {
                query.sort_by = params.sort_by;
                query.sort_order = params.sort_order ?? "asc";
            }

            const search = params?.search ?? get().searchQuery;
            if (search && search.trim() !== "") {
                query.search = search;
                // Add common aliases for search
                (query as any).q = search;
                (query as any).search_query = search;
                (query as any).keyword = search;
                (query as any).name = search;
            }

            const res = await api.get("/quotations", {
                params: query,
            });

            const data = res.data.data;

            set({
                listQuotations: data.quotations,
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
        const { pagination } = get();
        set({ pagination: { ...pagination, page } });
    },

    setLimit: (limit) => {
        const { pagination } = get();
        set({ pagination: { ...pagination, limit, page: 1 } });
    },
}));
