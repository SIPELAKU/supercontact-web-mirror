// lib/hooks/useImportJobs.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  actionImportJob,
  answerImportDuplicate,
  fetchImportJobs,
  type ImportJobAction,
  type ImportJobsQuery,
  type ImportModule,
} from "@/lib/api/import-jobs";
import type { BulkJob, BulkJobsResponse } from "@/lib/types/email-marketing";
import type { ImportDuplicateAnswer } from "@/lib/utils/importDuplicate";
import { markListsStale } from "./useListRefresh";
import { importJobKey } from "./useWatchedImportJobs";

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

/**
 * Answers the row a job waits on (FE-3, T2.8). The import dock gets the
 * job's new state at once; Import History lists are marked stale.
 */
export function useAnswerImportDuplicate(module: ImportModule) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, answer }: { jobId: string; answer: ImportDuplicateAnswer }) => {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      return answerImportDuplicate(token, module, jobId, answer);
    },
    onSuccess: (job: BulkJob, { answer }) => {
      if (job?.id) queryClient.setQueryData(importJobKey(module, job.id), job);
      markListsStale(queryClient, ["importJobs", module]);
      // The API answered the file's other waiting parts too (T1): no red card
      // should offer one of them until the next poll.
      if (answer.apply_to_all) void queryClient.invalidateQueries({ queryKey: ["importJob", module] });
    },
  });
}
