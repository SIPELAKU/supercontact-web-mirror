// Which import jobs just changed the module's data, so its list refreshes once.
//
// "Finished" = Completed (rows created) or Rolled Back (rows removed). The
// first snapshot only SEEDS what was already finished: opening a page must not
// reload its list for jobs done days ago (on Contacts that would restart the
// table right after it loaded).

import type { BulkJob } from "@/lib/types/email-marketing";

const FINISHED: BulkJob["status"][] = ["Completed", "Rolled Back"];

const finishKey = (job: Pick<BulkJob, "id" | "status">) => `${job.id}:${job.status}`;

/**
 * `seen` is null before the first snapshot. Returns the jobs that finished
 * since, and the set to keep for the next call.
 */
export function freshlyFinishedJobs(
  seen: Set<string> | null,
  jobs: Pick<BulkJob, "id" | "status">[],
): { finished: string[]; seen: Set<string> } {
  const next = new Set(seen ?? []);
  const finished: string[] = [];
  for (const job of jobs) {
    if (!FINISHED.includes(job.status)) continue;
    const key = finishKey(job);
    if (next.has(key)) continue;
    next.add(key);
    if (seen) finished.push(job.id);
  }
  return { finished, seen: next };
}
