// lib/hooks/useSmartCaptureSubmissions.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SmartCaptureSubmissionsResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';
import { fetchSmartCaptureSubmissions } from "../api/smart-captures";

export function useSmartCaptureSubmissions(id: string, params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const { page = 1, limit = 10, search } = params;

  return useQuery<SmartCaptureSubmissionsResponse, Error>({
    queryKey: ["smart-capture-submissions", id, page, limit, search],
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
