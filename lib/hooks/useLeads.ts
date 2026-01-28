// lib/hooks/useLeads.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api";
import { leadResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';

export function useLeads(page: number = 1, limit: number = 10) {
  console.log('[useLeads] Hook called:', { page, limit });
  return useQuery<leadResponse, Error>({
    queryKey: ["leads", page, limit],
    queryFn: async () => {
      console.log('[useLeads] queryFn triggered', { page, limit });
      const token = Cookies.get('access_token');
      if (!token) {
        console.error('[useLeads] No access_token cookie found!');
        throw new Error('No authentication token');
      }
      console.log('[useLeads] Calling fetchLeads with token...');
      return fetchLeads(token, page, limit);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
