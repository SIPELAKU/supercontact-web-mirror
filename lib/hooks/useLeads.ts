// lib/hooks/useLeads.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api";
import { leadResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';

export function useLeads(page: number = 1, limit: number = 10) {
  return useQuery<leadResponse, Error>({
    queryKey: ["leads", page, limit],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchLeads(token, page, limit);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
