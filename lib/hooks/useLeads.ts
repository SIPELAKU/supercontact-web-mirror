// lib/hooks/useLeads.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeads, loginAndGetToken } from "../api";
import { Lead } from "../types";
export function useLeads() {
  return useQuery<Lead[], Error>({
    queryKey: ["leads"],
    queryFn: async () => {
      const token = await loginAndGetToken();
      return fetchLeads(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
