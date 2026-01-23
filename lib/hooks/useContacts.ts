// lib/hooks/useContacts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { ContactResponse, fetchContacts } from "../api";
import Cookies from 'js-cookie';

export function useContacts() {
  return useQuery<ContactResponse, Error>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchContacts(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}