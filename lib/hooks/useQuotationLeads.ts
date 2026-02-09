// lib/hooks/useQuotationLeads.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchQuotationLeads, QuotationLeadsResponse } from "../api/quotations";
import { useAuth } from "../context/AuthContext";

export function useQuotationLeads(page: number = 1, limit: number = 100, search?: string) {
    const { getToken } = useAuth();

    return useQuery<QuotationLeadsResponse, Error>({
        queryKey: ["quotation-leads", page, limit, search],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token');
            }
            return fetchQuotationLeads(token, page, limit, search);
        },
        staleTime: 1000 * 60, // 1 minute cache
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
}
