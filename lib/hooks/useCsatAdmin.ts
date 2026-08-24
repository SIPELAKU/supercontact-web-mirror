// lib/hooks/useCsatAdmin.ts
//
// TanStack Query hooks for the authed CSAT admin surface (Settings > Support >
// CSAT). Mirrors the admin half of lib/hooks/useHelpCenter.ts: Bearer token
// from AuthContext, config read/write + a paginated responses read. Permission
// gating (support:csat:manage / support:csat:view) is applied in the UI via
// usePermission; the query `enabled` flags keep authed calls from firing before
// a token exists.

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  fetchCsatConfig,
  updateCsatConfig,
  fetchCsatResponses,
  type CsatConfig,
  type CsatConfigUpdate,
  type CsatResponsesPage,
} from "../api/csat-admin";

const CSAT = "csat-admin";

export function useCsatConfig(enabled = true) {
  const { token } = useAuth();
  return useQuery<CsatConfig, Error>({
    queryKey: [CSAT, "config"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchCsatConfig(token);
    },
    enabled: !!token && enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateCsatConfig() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation<CsatConfig, Error, CsatConfigUpdate>({
    mutationFn: (body) => {
      if (!token) throw new Error("No authentication token");
      return updateCsatConfig(token, body);
    },
    onSuccess: (data) => {
      qc.setQueryData([CSAT, "config"], data);
    },
  });
}

export function useCsatResponses(
  params: { limit?: number; offset?: number } = {},
  enabled = true
) {
  const { token } = useAuth();
  return useQuery<CsatResponsesPage, Error>({
    queryKey: [CSAT, "responses", params.limit ?? null, params.offset ?? null],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchCsatResponses(token, params);
    },
    enabled: !!token && enabled,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}
