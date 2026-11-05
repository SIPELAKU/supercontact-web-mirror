// lib/utils/importJobUpload.ts
//
// Sends one Contact/Recipient import file as ONE background job in parts
// (API v1.162.0, IMP-3): the first POST creates the job with the first part,
// every next part goes to `/{job_id}/rows`, and only the last one carries
// `finished: true`. A job stays `Uploading` - nothing processed - until then;
// one the upload never finished is deleted by the API's recovery cron after
// 30 minutes without progress (it runs every 15).

// Rows per request, for Contacts, Recipients and Subscribers (FE-9). 10,000
// rows was answered 502 on DEV, likely the API running out of memory
// (TUGAS_BE_2026-11-05 BUG-7); 2,000 until the API has more room.
export const IMPORT_CHUNK_SIZE = 2_000;

export function chunkRows<T>(rows: T[], size: number = IMPORT_CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) chunks.push(rows.slice(i, i + size));
  return chunks;
}

/**
 * A part failed. `part` is 1-based; nothing has been imported either way.
 * `details` keeps the API's validation errors (`[{field, message}]`).
 */
export class ImportUploadError extends Error {
  constructor(
    message: string,
    readonly part: number,
    readonly totalParts: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ImportUploadError";
  }
}

export interface UploadImportJobOptions<T> {
  rows: T[];
  // Body key of the rows: `contacts` (Contacts) or `new_contacts` (Recipients).
  rowsKey: string;
  // Sent with the first part only, e.g. file_name, target, broadcast_group_ids.
  startBody: Record<string, unknown>;
  // POSTs `body` to the module's `/bulk` + `path` and answers the job id.
  send: (path: string, body: Record<string, unknown>) => Promise<{ job_id: string }>;
  chunkSize?: number;
}

export async function uploadImportJob<T>({
  rows,
  rowsKey,
  startBody,
  send,
  chunkSize = IMPORT_CHUNK_SIZE,
}: UploadImportJobOptions<T>): Promise<{ jobId: string; parts: number }> {
  const chunks = chunkRows(rows, chunkSize);
  const total = chunks.length;
  let jobId = "";

  for (let i = 0; i < total; i++) {
    const body = { [rowsKey]: chunks[i], finished: i === total - 1 };
    try {
      const res = i === 0 ? await send("", { ...startBody, ...body }) : await send(`/${jobId}/rows`, body);
      if (i === 0) jobId = res.job_id;
    } catch (error: any) {
      throw new ImportUploadError(error?.message || "Upload failed", i + 1, total, error?.details);
    }
  }
  return { jobId, parts: total };
}

/**
 * What the user reads when a part fails: a later part says where it stopped;
 * otherwise the API's validation errors, one per field + message, or its
 * message.
 */
export function describeUploadError(error: unknown): string {
  if (error instanceof ImportUploadError && error.part > 1) {
    return `Upload stopped at part ${error.part} of ${error.totalParts}. Nothing was imported. Please import the file again.`;
  }
  const details = error instanceof ImportUploadError ? error.details : undefined;
  if (Array.isArray(details) && details.length > 0) {
    const lines = new Set(details.map((d: any) => (d?.field ? `${d.field}: ${d.message}` : String(d?.message ?? d))));
    return Array.from(lines).join(", ");
  }
  return error instanceof Error ? error.message : "Upload failed";
}
