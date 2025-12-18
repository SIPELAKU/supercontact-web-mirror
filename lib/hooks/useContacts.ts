// lib/hooks/useContacts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchContacts, ContactResponse } from "../api";
import { useAuth } from "@/lib/context/AuthContext";

export function useContacts() {
  const { getToken } = useAuth();
  
  return useQuery<ContactResponse, Error>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const token = await getToken();
      return fetchContacts(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}