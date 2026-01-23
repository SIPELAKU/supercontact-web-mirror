// lib/hooks/useContacts.ts
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ContactResponse, fetchContacts } from "../api";

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