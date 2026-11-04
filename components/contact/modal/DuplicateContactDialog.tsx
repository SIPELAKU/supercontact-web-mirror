"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { contactSourceLabel } from "@/lib/constants/contact-source";
import {
  duplicateFieldLabel,
  duplicateReasonText,
  duplicateValueText,
  missingDuplicateChoices,
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
  // No choice is preselected (user decision): Merge stays disabled until every
  // conflicting field has one, so nothing is overwritten unseen.
  const [keep, setKeep] = useState<Record<string, DuplicateChoice>>({});
  useEffect(() => setKeep({}), [duplicate]);

  if (!duplicate) return null;
  const { existing_contact: existing, conflicts, reason } = duplicate;
  const missing = missingDuplicateChoices(conflicts, keep);
  const existingSummary = [existing.email, existing.phone_number].filter(Boolean).join(" · ");

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
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Existing contact</p>
          <p className="mt-1 font-semibold text-gray-900">{existing.name || "-"}</p>
          {existingSummary && <p className="text-gray-700">{existingSummary}</p>}
          <p className="mt-1 text-xs text-gray-500">
            {contactSourceLabel(existing.source)}
            {existing.created_at ? ` · created ${format(new Date(existing.created_at), "dd MMM yyyy")}` : ""}
          </p>
        </div>

        {conflicts.length > 0 ? (
          <div>
            <p className="mb-2 text-gray-700">
              Choose which value to keep for each field. Empty fields of the existing contact are filled in
              automatically.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-[#EEF2FD] text-xs text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Field</th>
                    <th className="px-3 py-2 font-semibold">Existing</th>
                    <th className="px-3 py-2 font-semibold">New</th>
                  </tr>
                </thead>
                <tbody>
                  {conflicts.map((conflict) => (
                    <tr key={conflict.field} className="border-t border-gray-100 align-top">
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {duplicateFieldLabel(conflict.field)}
                      </td>
                      {(["existing", "incoming"] as const).map((side) => (
                        <td key={side} className="px-3 py-2">
                          <label className="flex cursor-pointer items-start gap-2">
                            <input
                              type="radio"
                              name={`keep-${conflict.field}`}
                              className="mt-0.5 accent-[#5479EE]"
                              checked={keep[conflict.field] === side}
                              disabled={isResolving}
                              onChange={() => setKeep((prev) => ({ ...prev, [conflict.field]: side }))}
                            />
                            <span className="break-all text-gray-900">{duplicateValueText(conflict, side)}</span>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
