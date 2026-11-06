// components/import-history/importJobState.ts
//
// What the floating import progress (FE-1) shows for one imported file. Since
// FE-5 a file of more than one part (IMPORT_CHUNK_SIZE rows) is several jobs
// ("Part i/n"), so a card sums its parts: one bar, one count, one state.

import type { ImportJobAction } from "@/lib/api/import-jobs";
import type { BulkJob } from "@/lib/types/email-marketing";
import { importProgressPercent } from "./importProgress";

// Still moving: worth polling. `Waiting for Review` counts (FE-3/BE-1): the
// answer can come from another tab or user. Rollbacks started from Import
// History also move.
export const ACTIVE_IMPORT_STATUSES: string[] = [
  "Uploading",
  "Queued for Processing",
  "Processing",
  "Waiting for Review",
  "Queued for Rollback",
  "Rollback Processing",
];

export function isActiveImportJob(job: Pick<BulkJob, "status">): boolean {
  return ACTIVE_IMPORT_STATUSES.includes(job.status);
}

// running = green bar; review = red bar + red dot; done = every part
// Completed; ended = finished some other way (Failed, Stopped, Rolled Back).
export type ImportDockTone = "running" | "review" | "done" | "ended";

export interface ImportDockCard {
  tone: ImportDockTone;
  processed: number;
  total: number;
  percent: number | null;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  // Parts waiting for a duplicate answer.
  reviews: number;
  // A finished file (done / ended) shows this instead of the bar, e.g.
  // "Import completed"; null while it still moves.
  headline: string | null;
  // The counts, or what the file waits for.
  summary: string;
}

// One ending for every part, said plainly; mixed endings are listed.
const ENDED_HEADLINE: Record<string, string> = {
  Failed: "Import failed",
  Stopped: "Import stopped",
  "Rolled Back": "Import rolled back",
};

function endedHeadline(statuses: string[]): string {
  return statuses.length === 1 && ENDED_HEADLINE[statuses[0]]
    ? ENDED_HEADLINE[statuses[0]]
    : `Import ended: ${statuses.join(", ")}`;
}

const sum = (jobs: BulkJob[], pick: (job: BulkJob) => number | null | undefined) =>
  jobs.reduce((total, job) => total + (pick(job) ?? 0), 0);

const count = (value: number) => value.toLocaleString();

/** The card for the parts of one file; `jobs` are the parts loaded so far. */
export function importDockCard(jobs: BulkJob[], totalParts: number): ImportDockCard {
  const reviews = jobs.filter((job) => job.status === "Waiting for Review").length;
  const allLoaded = jobs.length === totalParts;
  const tone: ImportDockTone =
    reviews > 0
      ? "review"
      : !allLoaded || jobs.some(isActiveImportJob)
        ? "running"
        : jobs.every((job) => job.status === "Completed")
          ? "done"
          : "ended";

  const processed = sum(jobs, (job) => job.processed_rows);
  const total = sum(jobs, (job) => job.total_rows);
  const created = sum(jobs, (job) => job.created_rows);
  const updated = sum(jobs, (job) => job.updated_rows);
  const skipped = sum(jobs, (job) => job.skipped_rows);
  const failed = sum(jobs, (job) => job.failed_rows);

  // Updated and Failed only when there are any, so a plain import stays short.
  const counts = [`Created ${count(created)}`];
  if (updated > 0) counts.push(`Updated ${count(updated)}`);
  counts.push(`Skipped ${count(skipped)}`);
  if (failed > 0) counts.push(`Failed ${count(failed)}`);

  let summary = counts.join(" · ");
  let headline: string | null = null;
  if (tone === "review") {
    summary = reviews === 1 ? "Duplicate found, waiting for your answer" : `Duplicates found in ${reviews} parts`;
  } else if (tone === "done") {
    headline = "Import completed";
  } else if (tone === "ended") {
    headline = endedHeadline(
      Array.from(new Set(jobs.filter((job) => job.status !== "Completed").map((job) => job.status))),
    );
  }

  return {
    tone,
    processed,
    total,
    percent: importProgressPercent(processed, total),
    created,
    updated,
    skipped,
    failed,
    reviews,
    headline,
    summary,
  };
}

// The API's job actions, plus `review`: answering the row a Contact job waits
// on (FE-3), which opens a dialog instead of a PATCH.
export type ImportHistoryAction = ImportJobAction | "review";

/**
 * The buttons Import History offers for a job, in display order, matching the
 * API's rules. `Waiting for Review` (API 1.165.0) can be answered,
 * stopped (Continue then asks the same row again) or rolled back.
 */
export function importJobActions(status: string): ImportHistoryAction[] {
  const actions: ImportHistoryAction[] = [];
  if (status === "Waiting for Review") actions.push("review");
  if (["Queued for Processing", "Processing", "Waiting for Review"].includes(status)) actions.push("stop");
  if (status === "Stopped") actions.push("continue");
  if (["Stopped", "Completed", "Waiting for Review"].includes(status)) actions.push("rollback");
  if (["Failed", "Rolled Back"].includes(status)) actions.push("replay");
  return actions;
}

/** The interval the module's Import History is set to, or 5 s when it is Off. */
export function dockIntervalMs(saved: string | null): number {
  const value = saved === null ? NaN : parseInt(saved, 10);
  return Number.isFinite(value) && value > 0 ? value : 5000;
}
