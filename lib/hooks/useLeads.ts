// lib/hooks/useLeads.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeads, loginAndGetToken } from "../api";
import { Lead, leadResponse } from "../models/types";
export function useLeads() {
  return useQuery<leadResponse, Error>({
    queryKey: ["leads"],
    queryFn: async () => {
      const token = await loginAndGetToken();
      return fetchLeads(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
