// lib/hooks/useContacts.ts
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContactResponse, fetchContacts } from "../api";
import {
  deleteContact,
  deleteMultipleContacts,
  deleteAllContacts,
  duplicateContacts,
  fetchContactConversations,
} from "../api/contacts";
import type { ContactConversationListResponse, ContactConversationQuery } from "../types/omnichannel";

// Key prefix of one contact's conversation table, also used to refresh it
// after a reply from the drawer.
export const contactConversationsKey = (contactId: string) => ["contact-conversations", contactId];

// Every conversation of one contact (BE-1.2), one page at a time.
export function useContactConversations(contactId: string, query: ContactConversationQuery) {
  const { getToken } = useAuth();
  return useQuery<ContactConversationListResponse, Error>({
    queryKey: [...contactConversationsKey(contactId), query],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchContactConversations(token, contactId, query);
    },
    // Keep the rows on screen while the next page or filter loads - but only
    // this contact's rows, never the previous contact's.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === contactId ? previous : undefined,
    staleTime: 1000 * 30,
    enabled: !!contactId,
  });
}

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
