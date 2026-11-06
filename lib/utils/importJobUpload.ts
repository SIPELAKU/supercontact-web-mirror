// lib/utils/importJobUpload.ts
//
// Sends an import file in parts of up to IMPORT_CHUNK_SIZE rows: every part is
// a job of its own, created and queued by one POST (`finished: true`), and
// named "<file> (Part i/n)" in Import History. A failed part therefore leaves
// the parts before it imported, and each part is rolled back on its own. All
// parts share one `import_group_id`, so "apply to all" reaches the whole file.

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
 * What the user reads when a part fails: a later part says where it stopped;
 * otherwise the API's validation errors, one per field + message, or its
 * message.
 */
export function describeUploadError(error: unknown): string {
  if (error instanceof ImportPartsError && error.part > 1) {
    const done = error.part - 1;
    return (
      `Part ${error.part} of ${error.totalParts} failed: ${apiReason(error)}. ` +
      `${importedPartsText(done)} imported and ${done === 1 ? "is" : "are"} in Import History. ` +
      `Import the remaining rows again.`
    );
  }
  return apiReason(error);
}

/** The API's validation errors, one per field + message, or its message. */
function apiReason(error: unknown): string {
  const details = error instanceof ImportPartsError ? error.details : undefined;
  if (Array.isArray(details) && details.length > 0) {
    const lines = new Set(details.map((d: any) => (d?.field ? `${d.field}: ${d.message}` : String(d?.message ?? d))));
    return Array.from(lines).join(", ");
  }
  return error instanceof Error ? error.message : "Upload failed";
}

/** "<file>" for a single part, "<file> (Part i/n)" otherwise (`index` 0-based). */
export function partFileName(fileName: string, index: number, total: number): string {
  return total > 1 ? `${fileName} (Part ${index + 1}/${total})` : fileName;
}

/**
 * A part failed. `part` is 1-based; `jobIds` are the parts before it, already
 * imported. `details` keeps the API's validation errors (`[{field, message}]`).
 */
export class ImportPartsError extends Error {
  constructor(
    message: string,
    readonly part: number,
    readonly totalParts: number,
    readonly jobIds: string[],
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ImportPartsError";
  }
}

export interface UploadImportPartsOptions<T> {
  rows: T[];
  // Body key of the rows: `contacts` or `new_contacts`.
  rowsKey: string;
  // Shown in Import History; parts get " (Part i/n)".
  fileName?: string;
  // POSTs one complete job and answers its id.
  send: (body: Record<string, unknown>) => Promise<{ job_id: string }>;
  chunkSize?: number;
}

export async function uploadImportParts<T>({
  rows,
  rowsKey,
  fileName,
  send,
  chunkSize = IMPORT_CHUNK_SIZE,
}: UploadImportPartsOptions<T>): Promise<{ jobIds: string[] }> {
  const chunks = chunkRows(rows, chunkSize);
  const jobIds: string[] = [];
  const importGroupId = crypto.randomUUID();

  for (let i = 0; i < chunks.length; i++) {
    const body: Record<string, unknown> = { [rowsKey]: chunks[i], finished: true, import_group_id: importGroupId };
    if (fileName) body.file_name = partFileName(fileName, i, chunks.length);
    try {
      const res = await send(body);
      jobIds.push(res.job_id);
    } catch (error: any) {
      throw new ImportPartsError(error?.message || "Upload failed", i + 1, chunks.length, [...jobIds], error?.details);
    }
  }
  return { jobIds };
}

function importedPartsText(count: number): string {
  return count === 1 ? "Part 1 was" : `Parts 1–${count} were`;
}
