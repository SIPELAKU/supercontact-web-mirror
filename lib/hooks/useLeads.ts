// lib/hooks/useLeads.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api";
import { leadResponse } from "@/lib/models/types";
import { useAuth } from "@/lib/context/AuthContext";

export function useLeads() {
  const { getToken } = useAuth();
  
  return useQuery<leadResponse, Error>({
    queryKey: ["leads"],
    queryFn: async () => {
      const token = await getToken();
      return fetchLeads(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
