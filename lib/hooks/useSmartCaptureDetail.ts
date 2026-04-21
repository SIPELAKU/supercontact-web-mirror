// lib/hooks/useSmartCaptureDetail.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSmartCaptureById } from "../api";
import { SmartCaptureDetailResponse } from "@/lib/models/types";
import Cookies from 'js-cookie';

export function useSmartCaptureDetail(id: string) {
  return useQuery<SmartCaptureDetailResponse, Error>({
    queryKey: ["smart-capture-detail", id],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      return fetchSmartCaptureById(token, id);
    },
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
