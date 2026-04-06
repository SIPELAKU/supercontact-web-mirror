// lib/hooks/useBroadcasts.ts
"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBroadcasts,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast
} from '../api';
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
