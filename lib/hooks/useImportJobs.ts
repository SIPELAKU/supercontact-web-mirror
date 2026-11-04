// lib/hooks/useImportJobs.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  actionImportJob,
  fetchImportJobs,
  type ImportJobAction,
  type ImportJobsQuery,
  type ImportModule,
} from "@/lib/api/import-jobs";
import type { BulkJobsResponse } from "@/lib/types/email-marketing";
import { markListsStale } from "./useListRefresh";

export const importJobsKey = (module: ImportModule, query: ImportJobsQuery) =>
  ["importJobs", module, query.page, query.limit, query.search, query.target, query.mailingListIds] as const;

// No refetchInterval: the Import History modal polls with useListRefresh's
// reload, which refetches batch 1 and restarts its lazy table.
export function useImportJobs(
  module: ImportModule,
  query: ImportJobsQuery,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { getToken } = useAuth();
  return useQuery<BulkJobsResponse>({
    queryKey: importJobsKey(module, query),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return fetchImportJobs(token, module, query);
    },
    enabled,
  });
}

export function useImportJobAction(module: ImportModule) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: ImportJobAction }) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return actionImportJob(token, module, jobId, action);
    },
    // The Import History modal reloads its own list (useListRefresh).
    onSuccess: () => markListsStale(queryClient, ["importJobs", module]),
  });
}
