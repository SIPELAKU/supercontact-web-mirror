// lib/hooks/useSmartCaptures.ts
"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SmartCaptureResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';
import { 
  fetchSmartCaptures, 
  updateSmartCapture, 
  updateSmartCaptureStatus, 
  deleteMultipleSmartCaptures, 
  duplicateSmartCaptures 
} from "../api/smart-captures";

export function useSmartCaptures(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  target?: string;
} = {}) {
  const { page = 1, limit = 10, search, status, target } = params;

  return useQuery<SmartCaptureResponse, Error>({
    queryKey: ["smart-captures", page, limit, search, status, target],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return fetchSmartCaptures(token, params);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateSmartCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return updateSmartCapture(token, id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["smart-captures"] });
      queryClient.invalidateQueries({ queryKey: ["smart-capture-detail", variables.id] });
    },
  });
}

export function useUpdateSmartCaptureStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return updateSmartCaptureStatus(token, id, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["smart-captures"] });
      queryClient.invalidateQueries({ queryKey: ["smart-capture-detail", variables.id] });
    },
  });
}

export function useDeleteMultipleSmartCaptures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return deleteMultipleSmartCaptures(token, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-captures"] });
    },
  });
}

export function useDuplicateSmartCaptures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return duplicateSmartCaptures(token, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-captures"] });
    },
  });
}
