// lib/hooks/useBroadcasts.ts
"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBroadcasts,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
  fetchBroadcastRecipients,
  fetchBroadcastDetail,
  duplicateBroadcast
} from '../api/whatsapp-marketing';
import Cookies from 'js-cookie';

/**
 * Fetch all WhatsApp broadcasts
 */
export function useBroadcasts(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) {
  return useQuery({
    queryKey: ['broadcasts', page, limit, search, status],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcasts(token, page, limit, search, status);
    },
  });
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
  });
}

/**
 * Fetch recipients for a specific broadcast
 */
export function useBroadcastRecipients(
  id: string,
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  return useQuery({
    queryKey: ['broadcast-recipients', id, page, limit, search],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcastRecipients(token, id, page, limit, search);
    },
    enabled: !!id,
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
