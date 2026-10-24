// lib/hooks/useBroadcasts.ts
"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { markListsStale } from './useListRefresh';
import {
  fetchBroadcasts,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
  fetchBroadcastRecipients,
  fetchAllBroadcastRecipients,
  fetchBroadcastDetail,
  duplicateBroadcast
} from '../api/whatsapp-marketing';
import Cookies from 'js-cookie';

export const broadcastsKey = (
  page: number,
  limit: number,
  search?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) => ['broadcasts', page, limit, search, status, sortBy, sortOrder] as const;

/**
 * Fetch all WhatsApp broadcasts
 */
export function useBroadcasts(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  return useQuery({
    queryKey: broadcastsKey(page, limit, search, status, sortBy, sortOrder),
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcasts(token, page, limit, search, status, sortBy, sortOrder);
    },
  });
}

// Writes below mark the lists stale only; BroadcastingWAClient refreshes the
// list it shows (see useListRefresh).
/**
 * Create a new WhatsApp broadcast
 */
export function useCreateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createBroadcast(token, data);
    },
    onSuccess: () => markListsStale(queryClient, ['broadcasts']),
  });
}

/**
 * Update an existing WhatsApp broadcast
 */
export function useUpdateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateBroadcast(token, id, data);
    },
    onSuccess: () => markListsStale(queryClient, ['broadcasts']),
  });
}

/**
 * Delete a WhatsApp broadcast
 */
export function useDeleteBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteBroadcast(token, id);
    },
    onSuccess: () => markListsStale(queryClient, ['broadcasts']),
  });
}

/**
 * Duplicate existing WhatsApp broadcasts
 */
export function useDuplicateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastIds: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return duplicateBroadcast(token, broadcastIds);
    },
    onSuccess: () => markListsStale(queryClient, ['broadcasts']),
  });
}

/**
 * Fetch recipients for a specific broadcast
 */
export function useBroadcastRecipients(
  id: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) {
  return useQuery({
    queryKey: ['broadcast-recipients', id, page, limit, search, status],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcastRecipients(token, id, page, limit, search, status);
    },
    enabled: !!id,
  });
}

/**
 * Every recipient of a broadcast with one status, fetched on demand for a CSV
 * export. A mutation rather than a query: it runs on a click, and its
 * `variables` say which status is exporting.
 */
export function useExportBroadcastRecipients() {
  return useMutation({
    mutationFn: async ({ broadcastId, status }: { broadcastId: string; status: string }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchAllBroadcastRecipients(token, broadcastId, status);
    },
  });
}

/**
 * Fetch detail for a specific broadcast
 */
export function useBroadcastDetail(id: string) {
  return useQuery({
    queryKey: ['broadcast-detail', id],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcastDetail(token, id);
    },
    enabled: !!id,
  });
}
