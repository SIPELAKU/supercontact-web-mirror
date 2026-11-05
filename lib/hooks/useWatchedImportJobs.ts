// lib/hooks/useWatchedImportJobs.ts
"use client";

// The jobs the import dock follows (FE-1): each loaded once, then polled ONLY
// while at least one of them can still move. Once every followed job has
// finished, or been closed with ×, no request is made (rule of 2026-11-04: no
// polling in the background without a reason). A module whose Import History
// is open is not polled here: the modal already polls the same jobs.

import { useEffect, useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchImportJob, type ImportModule } from "@/lib/api/import-jobs";
import type { BulkJob } from "@/lib/types/email-marketing";
import { useImportWatch } from "@/lib/store/importWatch";
import { usePolling } from "./usePolling";
import { dockIntervalMs, isActiveImportJob } from "@/components/import-history/importJobState";
import { freshlyFinishedJobs } from "@/components/import-history/finishedJobs";
import { IMPORT_HISTORY_CONFIG } from "@/components/import-history/importModules";

export const importJobKey = (module: ImportModule, jobId: string) => ["importJob", module, jobId] as const;

function savedInterval(module: ImportModule): number {
  const key = IMPORT_HISTORY_CONFIG[module]?.storageKey;
  try {
    return dockIntervalMs(key ? localStorage.getItem(key) : null);
  } catch {
    return dockIntervalMs(null);
  }
}

/** Jobs by id, as loaded so far. */
export function useWatchedImportJobs(): Record<string, BulkJob> {
  const { getToken } = useAuth();
  const watched = useImportWatch((state) => state.watched);
  const historyOpen = useImportWatch((state) => state.historyOpen);
  const dropJob = useImportWatch((state) => state.dropJob);
  const markDataChanged = useImportWatch((state) => state.markDataChanged);

  const followed = useMemo(
    () => watched.flatMap((item) => item.jobIds.map((jobId) => ({ module: item.module, jobId }))),
    [watched],
  );

  const queries = useQueries({
    queries: followed.map(({ module, jobId }) => ({
      queryKey: importJobKey(module, jobId),
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        return fetchImportJob(token, module, jobId);
      },
      enabled: !historyOpen[module],
      // Refreshed by the polling below, not by focus or remounts.
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: (failures: number, error: any) => error?.status !== 404 && error?.status !== 403 && failures < 2,
    })),
  });

  const jobs = useMemo(() => {
    const byId: Record<string, BulkJob> = {};
    queries.forEach((query) => {
      if (query.data) byId[query.data.id] = query.data;
    });
    return byId;
    // `queries` is a new array each render; its data is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((query) => query.dataUpdatedAt).join()]);

  // A job the API no longer has (an unfinished upload the cleanup removed,
  // or another account's job after a re-login) is not followed any more.
  useEffect(() => {
    queries.forEach((query, i) => {
      const status = (query.error as any)?.status;
      if (status === 404 || status === 403) dropJob(followed[i].jobId);
    });
  });

  // Poll the jobs that can still move, at the module's Auto-refresh pace.
  // Not loaded yet counts as moving: its first load may have failed.
  const moving = followed.flatMap(({ module, jobId }, index) => {
    const job = jobs[jobId];
    return !historyOpen[module] && (!job || isActiveImportJob(job)) ? [index] : [];
  });
  const intervalMs =
    moving.length > 0 ? Math.min(...moving.map((index) => savedInterval(followed[index].module))) : false;
  usePolling(() => Promise.all(moving.map((index) => queries[index].refetch())), intervalMs);

  // A followed job completed or was rolled back: its module's page refreshes
  // its list. Seeded once everything is loaded, so jobs that had already
  // finished before a reload do not count.
  const seenRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const loaded = followed.filter(({ jobId }) => jobs[jobId]);
    if (loaded.length < followed.length) return;
    const { finished, seen } = freshlyFinishedJobs(
      seenRef.current,
      loaded.map(({ jobId }) => jobs[jobId]),
    );
    seenRef.current = seen;
    const modules = new Set(finished.map((id) => followed.find((item) => item.jobId === id)!.module));
    modules.forEach((module) => markDataChanged(module));
  }, [jobs, followed, markDataChanged]);

  return jobs;
}
