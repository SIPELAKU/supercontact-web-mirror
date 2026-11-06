"use client";

import { useMemo } from "react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { ConflictChoiceTable } from "@/components/contact/duplicates/ConflictChoiceTable";
import { ExistingContactSummary } from "@/components/contact/duplicates/ExistingContactSummary";
import { useDuplicateChoices } from "@/lib/hooks/useDuplicateChoices";
import {
  DUPLICATE_SOURCES,
  duplicateReasonText,
  duplicateValueText,
  type DuplicateChoice,
  type DuplicateContactDetails,
  type DuplicateResolution,
} from "@/lib/utils/contactDuplicate";

interface DuplicateContactDialogProps {
  // The 409's details; null closes the dialog.
  duplicate: DuplicateContactDetails | null;
  isResolving: boolean;
  onCancel: () => void;
  onResolve: (resolution: DuplicateResolution) => void;
}

// The answer to POST /contacts 409 DUPLICATE_CONTACT (BE-1.3): merge into the
// existing contact, choosing old or new for every conflicting field, or
// cancel. No "create a separate contact" (user decision 2026-11-04: no
// duplicate contacts), although the API still accepts `create_new`.
export const DuplicateContactDialog = ({
  duplicate,
  isResolving,
  onCancel,
  onResolve,
}: DuplicateContactDialogProps) => {
  const conflicts = useMemo(() => duplicate?.conflicts ?? [], [duplicate]);
  const fields = useMemo(() => conflicts.map((c) => c.field), [conflicts]);
  // No choice is preselected (user decision): Merge stays disabled until every
  // conflicting field has one, so nothing is overwritten unseen.
  const { chosen: keep, choose, missing } = useDuplicateChoices<DuplicateChoice>(fields, duplicate);

  if (!duplicate) return null;
  const { existing_contact: existing, reason } = duplicate;
  const valueOf = (field: string, side: string) => {
    const conflict = conflicts.find((c) => c.field === field);
    return conflict ? duplicateValueText(conflict, side as DuplicateChoice) : "-";
  };

  return (
    <AppDialog
      open
      onClose={() => !isResolving && onCancel()}
      title="Contact already exists"
      description={duplicateReasonText(reason)}
      maxWidth="md"
      actions={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <AppButton variantStyle="outline" color="gray" onClick={onCancel} disabled={isResolving}>
            Cancel
          </AppButton>
          <AppButton
            onClick={() => onResolve({ contact_id: existing.id, keep })}
            disabled={isResolving || missing.length > 0}
            isLoading={isResolving}
          >
            Merge into existing
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        <ExistingContactSummary contact={existing} />

        {conflicts.length > 0 ? (
          <div>
            <p className="mb-2 text-gray-700">
              Choose which value to keep for each field. Empty fields of the existing contact are filled in
              automatically.
            </p>
            <ConflictChoiceTable
              fields={fields}
              sources={DUPLICATE_SOURCES}
              valueOf={valueOf}
              chosen={keep}
              onChoose={(field, side) => choose(field, side as DuplicateChoice)}
              disabled={isResolving}
            />
            {missing.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Choose a value for every field to merge ({missing.length} left).
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-700">
            No field conflicts. Merging fills the empty fields of the existing contact with what you entered.
          </p>
        )}
      </div>
    </AppDialog>
  );
};
