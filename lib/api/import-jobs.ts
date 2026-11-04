// lib/api/import-jobs.ts
//
// Background import jobs, one API shape for three modules:
//   /subscribers/bulk, /contacts/bulk, /recipients/bulk
// List, detail actions (stop / continue / rollback / replay) and, for Contacts
// and Recipients (API v1.162.0, IMP-2/3), the upload: the first POST creates
// the job with the first part, every next part goes to `/{job_id}/rows`, and
// `finished: true` on the last one queues it.

import { fetchWithTimeout } from "./api-client";
import type { BulkJobsResponse } from "@/lib/types/email-marketing";

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
    // A 10,000-row part can take a while to store.
    timeout: 120_000,
  });
  const json = await readResponse(res, "Failed to upload the file");
  return json.data;
}
