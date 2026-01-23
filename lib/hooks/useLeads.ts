// lib/hooks/useLeads.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api";
import { leadResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';

export function useLeads() {
  return useQuery<leadResponse, Error>({
    queryKey: ["leads"],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchLeads(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
