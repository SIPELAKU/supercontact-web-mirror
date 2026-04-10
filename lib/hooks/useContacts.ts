// lib/hooks/useContacts.ts
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContactResponse, fetchContacts } from "../api";
import { deleteContact, deleteMultipleContacts, deleteAllContacts, duplicateContacts } from "../api/contacts";

// Fetch all contacts with optional search
export function useContacts(search?: string, include_all?: boolean) {
  const { getToken } = useAuth();
  return useQuery<ContactResponse, Error>({
    queryKey: ["contacts", search, include_all],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      return fetchContacts(token, { search, limit: 100, include_all });
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: search !== undefined && search.length >= 2, // Only search if at least 2 characters
  });
}

// Fetch all contacts without search (for backward compatibility)
export function useAllContacts() {
  const { getToken } = useAuth();
  return useQuery<ContactResponse, Error>({
    queryKey: ["all-contacts"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      return fetchContacts(token, { limit: 100 });
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
export function useDeleteAllContacts() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      return deleteAllContacts(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["all-contacts"] });
    },
  });
}

export function useDuplicateContacts() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactIds: string[]) => {
      const token = await getToken();
      return duplicateContacts(token, contactIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["all-contacts"] });
    },
  });
}
