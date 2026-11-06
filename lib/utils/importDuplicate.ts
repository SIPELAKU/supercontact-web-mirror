// lib/utils/importDuplicate.ts
//
// Answering the row an import paused on (FE-3, T1, T2.8, API 1.165.0):
// `POST /{module}/bulk/{job_id}/duplicate-resolution`
//   { row_number, action: "skip" }                  data unchanged
//   { row_number, action: "replace" }               every conflict takes the file's value
//   { row_number, action: "update", keep }          one choice per conflict
//   { ..., apply_to_all: true }                     skip or replace only: the same
//                                                   answer for every later conflict
//                                                   in the file, all its parts
// Replace and Update also fill the existing contact's blank fields. The job
// then goes on to the next row.

import type { BulkJob } from "@/lib/types/email-marketing";
import {
  duplicateValueText,
  type DuplicateChoice,
  type ImportPendingDuplicate,
} from "./contactDuplicate";

export type ImportDuplicateAction = "skip" | "replace" | "update";

export interface ImportDuplicateAnswer {
  row_number: number;
  action: ImportDuplicateAction;
  keep?: Record<string, DuplicateChoice>;
  apply_to_all?: boolean;
}

/** The row a job waits on, or null when it waits on nothing readable. */
export function readPendingDuplicate(job: Pick<BulkJob, "status" | "pending_duplicate"> | null | undefined) {
  if (!job || job.status !== "Waiting for Review") return null;
  const pending = job.pending_duplicate as Partial<ImportPendingDuplicate> | null | undefined;
  if (!pending || typeof pending.row_number !== "number" || !pending.existing_contact?.id) return null;
  return {
    ...pending,
    conflicts: Array.isArray(pending.conflicts) ? pending.conflicts : [],
    incoming: pending.incoming ?? {},
    fillable_fields: Array.isArray(pending.fillable_fields) ? pending.fillable_fields : [],
  } as ImportPendingDuplicate;
}

/**
 * The request body; `keep` is sent for Update only, and so is never
 * `apply_to_all`, which the API refuses there (a choice per field cannot hold
 * for rows not seen yet).
 */
export function importDuplicateAnswer(
  rowNumber: number,
  action: ImportDuplicateAction,
  keep: Record<string, DuplicateChoice> = {},
  applyToAll = false,
): ImportDuplicateAnswer {
  if (action === "update") return { row_number: rowNumber, action, keep };
  return applyToAll ? { row_number: rowNumber, action, apply_to_all: true } : { row_number: rowNumber, action };
}

/** "all" only when the answer really covers the rest of the file. */
export function importDuplicateActionLabel(action: ImportDuplicateAction, applyToAll: boolean): string {
  if (action === "update") return "Update selected";
  const label = action === "skip" ? "Skip" : "Replace";
  return applyToAll ? `${label} all` : label;
}

/** Skip and Replace need no choice; Update needs one for every conflict. */
export function canSubmitImportDuplicate(
  action: ImportDuplicateAction,
  pending: Pick<ImportPendingDuplicate, "conflicts">,
  keep: Record<string, DuplicateChoice>,
): boolean {
  if (action !== "update") return true;
  return pending.conflicts.length > 0 && pending.conflicts.every((conflict) => Boolean(keep[conflict.field]));
}

/** "Also filled in": each blank field of the existing contact with the file's value. */
export function fillableValues(pending: Pick<ImportPendingDuplicate, "fillable_fields" | "incoming">) {
  const custom = (pending.incoming.custom_fields ?? {}) as Record<string, unknown>;
  return pending.fillable_fields.map((field) => {
    const value = field.startsWith("custom_fields.")
      ? custom[field.slice("custom_fields.".length)]
      : pending.incoming[field];
    return { field, value: duplicateValueText({ field, existing: null, incoming: value }, "incoming") };
  });
}

export type ImportDuplicateError =
  // 409: answered elsewhere (another tab or user), or the job moved on.
  | { kind: "answered" }
  // 422: the contact changed while the job waited; these conflicts were not
  // in the dialog, so only Replace or Skip can answer the row now.
  | { kind: "changed"; fields: string[] }
  | { kind: "other"; message: string };

/** What a failed answer means for the dialog. */
export function readImportDuplicateError(error: unknown): ImportDuplicateError {
  const err = error as { status?: number; details?: { missing?: unknown }; message?: string } | null;
  if (err?.status === 409) return { kind: "answered" };
  const missing = err?.details?.missing;
  if (err?.status === 422 && Array.isArray(missing)) return { kind: "changed", fields: missing.map(String) };
  return { kind: "other", message: err?.message || "Failed to answer the duplicate" };
}
