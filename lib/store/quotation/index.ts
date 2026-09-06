"use client";
import { getDateRange } from "@/lib/helper/getDateRange";
import { normalizeQuotationStatus } from "@/lib/constants/quotation-status";
import type { Lead, LeadContact, LeadUser, Quotation, QuotationItem } from "@/lib/types/Quotation";
import api from "@/lib/utils/axiosClient";
import { create } from "zustand";

// The response shapes live in lib/types/Quotation.ts (one Quotation shape for
// the list, the detail and the form). Re-exported so existing imports from
// the store keep working.
export type { Lead, LeadContact, LeadUser, Quotation, QuotationItem };

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

export type FetchQuotationParams = {
    page: number;
    limit: number;
    search?: string;
    dateRange?: string;
    /** Canonical or legacy spelling; normalised before it is sent. */
    quotation_status?: string;
    date_from?: string; // Client Side Injector prop
    date_to?: string;   // Client Side Injector prop
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

/**
 * Exactly the query parameters GET /quotations declares (spec D2.4). The
 * old aliases (`status`, `status_lower`, `filter`, `q`, `keyword`, ...) were
 * never read by the server and are gone.
 */
type RequestBody = {
    page: number;
    limit: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    quotation_status?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
};

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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
        // Matches SuperTable's lazy batch size, so the first fetch and the
        // first "load more" ask for consecutive rows rather than overlapping.
        limit: 25,
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

            const query: RequestBody = {
                page: params?.page ?? pagination.page,
                limit: params?.limit ?? pagination.limit,
            };
            // Explicit client values win, each on its own: the date-range
            // filter can hand over only `from` ("sejak") or only `to`
            // ("sampai"), and the Kedaluwarsa translation
            // (quotationListFilterQuery) sends `date_to` alone. Requiring
            // both used to drop such a filter silently.
            if (params?.date_from || params?.date_to) {
                if (params.date_from) query.date_from = params.date_from;
                if (params.date_to) query.date_to = params.date_to;
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

            const status = params?.quotation_status ?? get().statusFilter;
            if (status && status.trim() !== "" && status.trim() !== "all") {
                // Both vocabularies are accepted server-side; send the
                // canonical one so a bookmarked `Pending` still finds `sent`.
                query.quotation_status = normalizeQuotationStatus(status.trim());
            }

            if (params?.sort_by) {
                query.sort_by = params.sort_by;
                query.sort_order = params.sort_order ?? "asc";
            }

            const search = params?.search ?? get().searchQuery;
            if (search && search.trim() !== "") {
                query.search = search;
            }

            const res = await api.get("/quotations", {
                params: query,
            });

            const data = res.data.data;

            set({
                listQuotations: data.quotations,
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

    setPage: (page) => {
        const { pagination } = get();
        set({ pagination: { ...pagination, page } });
    },

    setLimit: (limit) => {
        const { pagination } = get();
        set({ pagination: { ...pagination, limit, page: 1 } });
    },
}));
