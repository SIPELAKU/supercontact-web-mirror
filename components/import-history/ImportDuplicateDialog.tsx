"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { ConflictChoiceTable } from "@/components/contact/duplicates/ConflictChoiceTable";
import { ExistingContactSummary } from "@/components/contact/duplicates/ExistingContactSummary";
import { useDuplicateChoices } from "@/lib/hooks/useDuplicateChoices";
import { useAnswerImportDuplicate } from "@/lib/hooks/useImportJobs";
import { markListsStale } from "@/lib/hooks/useListRefresh";
import { importJobKey } from "@/lib/hooks/useWatchedImportJobs";
import type { ImportModule } from "@/lib/api/import-jobs";
import type { BulkJob } from "@/lib/types/email-marketing";
import { notify } from "@/lib/notifications";
import {
  DUPLICATE_SOURCES,
  duplicateFieldLabel,
  duplicateReasonText,
  duplicateValueText,
  type DuplicateChoice,
} from "@/lib/utils/contactDuplicate";
import {
  canSubmitImportDuplicate,
  fillableValues,
  importDuplicateActionLabel,
  importDuplicateAnswer,
  readImportDuplicateError,
  readPendingDuplicate,
  type ImportDuplicateAction,
} from "@/lib/utils/importDuplicate";
import { importModuleNoun } from "@/lib/utils/importModules";

interface ImportDuplicateDialogProps {
  module: ImportModule;
  // A `Waiting for Review` job; null (or a job not waiting) closes the dialog.
  job: BulkJob | null;
  onClose: () => void;
  // After a successful answer, e.g. to reload Import History.
  onAnswered?: () => void;
}

// FE-3, T1, T2.8: the row an import paused on, matching an existing contact
// with different data. Skip keeps the contact as it is, Replace takes the
// file's values, Update selected takes a choice per field. The checkbox gives
// Skip or Replace to every later conflict in the file. Opened from the
// import dock and from Import History (Review). Closing leaves the job waiting.
export const ImportDuplicateDialog = ({ module, job, onClose, onAnswered }: ImportDuplicateDialogProps) => {
  const queryClient = useQueryClient();
  const answer = useAnswerImportDuplicate(module);
  const pending = useMemo(() => readPendingDuplicate(job), [job]);
  const conflicts = useMemo(() => pending?.conflicts ?? [], [pending]);
  const fields = useMemo(() => conflicts.map((c) => c.field), [conflicts]);
  // Nothing preselected, as in Add Contact: Update waits for every choice.
  const resetKey = `${job?.id}:${pending?.row_number}`;
  const { chosen: keep, choose, missing } = useDuplicateChoices<DuplicateChoice>(fields, resetKey);
  const [sending, setSending] = useState<ImportDuplicateAction | null>(null);
  // Conflicts the API found that the dialog did not show (422).
  const [changedFields, setChangedFields] = useState<string[]>([]);
  // Starts unticked for every row: it answers more than the row on screen.
  const [applyToAll, setApplyToAll] = useState(false);
  useEffect(() => setApplyToAll(false), [resetKey]);

  if (!job || !pending) return null;
  const busy = sending !== null;
  const filled = fillableValues(pending);
  const incoming = pending.incoming;
  const rowText = [incoming.name, incoming.email, incoming.phone_number].filter(Boolean).map(String).join(" · ");
  const valueOf = (field: string, side: string) => {
    const conflict = conflicts.find((c) => c.field === field);
    return conflict ? duplicateValueText(conflict, side as DuplicateChoice) : "-";
  };

  const close = () => {
    setChangedFields([]);
    onClose();
  };

  const send = (action: ImportDuplicateAction) => {
    setSending(action);
    answer.mutate(
      { jobId: job.id, answer: importDuplicateAnswer(pending.row_number, action, keep, applyToAll) },
      {
        onSuccess: () => {
          notify.success("Answer saved", {
            description: applyToAll
              ? "The remaining duplicates in this file get the same answer."
              : "The import continues with the next row.",
          });
          onAnswered?.();
          close();
        },
        onError: (error) => {
          const failure = readImportDuplicateError(error);
          if (failure.kind === "answered") {
            notify.info("This row was already answered", { description: "The import has moved on." });
            void queryClient.invalidateQueries({ queryKey: importJobKey(module, job.id) });
            markListsStale(queryClient, ["importJobs", module]);
            onAnswered?.();
            close();
          } else if (failure.kind === "changed") {
            setChangedFields(failure.fields);
          } else {
            notify.error("Failed to answer the duplicate", { description: failure.message });
          }
        },
        onSettled: () => setSending(null),
      },
    );
  };

  const actionButton = (action: ImportDuplicateAction, variantStyle: "outline" | "primary", disabled = false) => (
    <AppButton
      variantStyle={variantStyle}
      color={action === "skip" ? "gray" : "primary"}
      onClick={() => send(action)}
      disabled={busy || disabled}
      isLoading={sending === action}
    >
      {importDuplicateActionLabel(action, applyToAll)}
    </AppButton>
  );

  return (
    <AppDialog
      open
      onClose={() => !busy && close()}
      title={`Duplicate ${importModuleNoun(module)} found — row ${pending.row_number.toLocaleString()}`}
      description={duplicateReasonText(pending.reason)}
      maxWidth="md"
      actions={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              disabled={busy}
            />
            Apply to all remaining duplicates in this file
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            {actionButton("skip", "outline")}
            {actionButton("replace", "outline")}
            {actionButton("update", "primary", applyToAll || !canSubmitImportDuplicate("update", pending, keep))}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        {/* The row number counts the rows sent to this job, so the row's own
            values are what identifies it in the file. */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">New row in the file</p>
          <p className="mt-1 font-semibold text-gray-900">{rowText || "-"}</p>
          <p className="mt-1 text-xs text-gray-500">
            {job.file_name} · row {pending.row_number.toLocaleString()} of {job.total_rows.toLocaleString()}
          </p>
        </div>

        <ExistingContactSummary contact={pending.existing_contact} />

        <div>
          <p className="mb-2 text-gray-700">
            For <b>Update selected</b>, choose which value to keep for each field. <b>Replace</b> takes every value
            from the file; <b>Skip</b> leaves the contact as it is.
          </p>
          <ConflictChoiceTable
            fields={fields}
            sources={DUPLICATE_SOURCES}
            valueOf={valueOf}
            chosen={keep}
            onChoose={(field, side) => choose(field, side as DuplicateChoice)}
            disabled={busy}
          />
          {missing.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Choose a value for every field to update ({missing.length} left).
            </p>
          )}
        </div>

        {filled.length > 0 && (
          <div>
            <p className="text-gray-700">Also filled in by Replace and Update selected (empty on the contact):</p>
            <ul className="mt-1 list-disc pl-5 text-gray-900">
              {filled.map(({ field, value }) => (
                <li key={field}>
                  {duplicateFieldLabel(field)} → {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {changedFields.length > 0 && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            The contact changed while the import waited:{" "}
            {changedFields.map(duplicateFieldLabel).join(", ")} now differ too. Use Replace or Skip.
          </p>
        )}
      </div>
    </AppDialog>
  );
};
