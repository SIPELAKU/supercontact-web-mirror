// lib/hooks/useContacts.ts
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContactResponse, fetchContacts } from "../api";
import { deleteContact, deleteMultipleContacts } from "../api/contacts";

// Fetch all contacts
export function useContacts() {
  const { getToken } = useAuth();
  return useQuery<ContactResponse, Error>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      return fetchContacts(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}

// Delete multiple contacts
export function useDeleteMultipleContacts() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactIds: string[]) => {
      const token = await getToken();
      return deleteMultipleContacts(token, contactIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

// Delete a contact
export function useDeleteContact() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactId: string) => {
      const token = await getToken();
      return deleteContact(token, contactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
