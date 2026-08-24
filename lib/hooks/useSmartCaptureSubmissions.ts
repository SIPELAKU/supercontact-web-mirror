// lib/hooks/useSmartCaptureSubmissions.ts
"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SmartCaptureSubmissionsResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';
import {
  fetchSmartCaptureSubmissions,
  resendSmartCaptureSubmission,
  deleteSmartCaptureSubmissions,
} from "../api/smart-captures";

export function useSmartCaptureSubmissions(id: string, params: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
} = {}) {
  const { page = 1, limit = 10, search, sort_by, sort_order } = params;

  return useQuery<SmartCaptureSubmissionsResponse, Error>({
    queryKey: ["smart-capture-submissions", id, page, limit, search, sort_by, sort_order],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return fetchSmartCaptureSubmissions(token, id, params);
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useResendSmartCaptureSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ smartCaptureId, submissionId }: { smartCaptureId: string; submissionId: string }) => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return resendSmartCaptureSubmission(token, smartCaptureId, submissionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["smart-capture-submissions", variables.smartCaptureId] });
    },
  });
}

export function useDeleteSmartCaptureSubmissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ smartCaptureId, submissionIds }: { smartCaptureId: string; submissionIds: string[] }) => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return deleteSmartCaptureSubmissions(token, smartCaptureId, submissionIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["smart-capture-submissions", variables.smartCaptureId] });
    },
  });
}
