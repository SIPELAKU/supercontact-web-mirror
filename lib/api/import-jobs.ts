// lib/api/import-jobs.ts
//
// Background import jobs, one API shape for three modules:
//   /subscribers/bulk, /contacts/bulk, /recipients/bulk
// List, detail actions (stop / continue / rollback / replay) and, for Contacts
// and Recipients (API v1.162.0, IMP-2/3), the upload: the first POST creates
// the job with the first part, every next part goes to `/{job_id}/rows`, and
// `finished: true` on the last one queues it. Contacts (FE-5) instead send
// every part as a job of its own with `startImportJob`.

import { fetchWithTimeout } from "./api-client";
import type { BulkJob, BulkJobsResponse } from "@/lib/types/email-marketing";
import type { ImportDuplicateAnswer } from "@/lib/utils/importDuplicate";

export type ImportModule = "subscribers" | "contacts" | "recipients";
export type ImportJobAction = "stop" | "continue" | "rollback" | "replay";

export interface ImportJobsQuery {
  page: number;
  limit: number;
  search?: string;
  target?: string[];
  mailingListIds?: string[];
}

const jobsUrl = (module: ImportModule) => `${process.env.NEXT_PUBLIC_API_URL}/${module}/bulk`;

async function readResponse(res: Response, fallback: string) {
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok || !json || json.success === false) {
    const error: any = new Error(json?.error?.message || `${fallback} (${res.status})`);
    error.status = res.status;
    if (json?.error?.details) error.details = json.error.details;
    throw error;
  }
  return json;
}

export async function fetchImportJobs(
  token: string,
  module: ImportModule,
  query: ImportJobsQuery,
): Promise<BulkJobsResponse> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.search) params.append("search", query.search);
  for (const target of query.target ?? []) params.append("target", target);
  for (const id of query.mailingListIds ?? []) params.append("mailing_list_ids", id);

  const res = await fetchWithTimeout(`${jobsUrl(module)}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse(res, "Failed to load import history");
}

/** One job with its progress (`GET /{module}/bulk/{job_id}`), for the import dock (FE-1). */
export async function fetchImportJob(token: string, module: ImportModule, jobId: string): Promise<BulkJob> {
  const res = await fetchWithTimeout(`${jobsUrl(module)}/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await readResponse(res, "Failed to load the import job");
  return json.data;
}

export async function actionImportJob(
  token: string,
  module: ImportModule,
  jobId: string,
  action: ImportJobAction,
) {
  const res = await fetchWithTimeout(`${jobsUrl(module)}/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action }),
  });
  return readResponse(res, `Failed to ${action} the import job`);
}

/**
 * One upload request: `""` starts the job, `/{job_id}/rows` adds a part.
 * Answers `{ job_id, status, total_rows }`.
 */
export async function sendImportPart(
  token: string,
  module: Exclude<ImportModule, "subscribers">,
  path: string,
  body: Record<string, unknown>,
): Promise<{ job_id: string; status: string; total_rows: number }> {
  const res = await fetchWithTimeout(`${jobsUrl(module)}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    // A part of IMPORT_CHUNK_SIZE rows can take a while to store.
    timeout: 120_000,
  });
  const json = await readResponse(res, "Failed to upload the file");
  return json.data;
}

/**
 * Creates one complete job (`POST /{module}/bulk`), the way Subscribers are
 * imported: the body holds its rows and `finished: true` (FE-5, Contacts).
 */
export function startImportJob(
  token: string,
  module: Exclude<ImportModule, "subscribers">,
  body: Record<string, unknown>,
): Promise<{ job_id: string; status: string; total_rows: number }> {
  return sendImportPart(token, module, "", body);
}

/**
 * Answers the row a Contact job waits on (FE-3, API 1.164.0, BE-4); the job
 * then goes on. 409 = not waiting on that row any more, 422 with
 * `details.missing` = a conflict has no choice. Answers the job.
 */
export async function answerImportDuplicate(
  token: string,
  module: ImportModule,
  jobId: string,
  answer: ImportDuplicateAnswer,
): Promise<BulkJob> {
  const res = await fetchWithTimeout(`${jobsUrl(module)}/${jobId}/duplicate-resolution`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(answer),
  });
  const json = await readResponse(res, "Failed to answer the duplicate");
  return json.data;
}
