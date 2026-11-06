"use client";

import { useMemo } from "react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppButton } from "@/components/ui/app-button";
import { ConflictChoiceTable } from "@/components/contact/duplicates/ConflictChoiceTable";
import { useDuplicateChoices } from "@/lib/hooks/useDuplicateChoices";
import { duplicateFieldLabel } from "@/lib/utils/contactDuplicate";
import {
  mergeGroup,
  type FileDuplicateGroup,
  type FileRow,
  type GroupResolution,
} from "@/lib/utils/importFileDuplicates";

interface FileDuplicateDialogProps {
  // The rows of the file and the group to settle; null closes the dialog.
  rows: FileRow[];
  group: FileDuplicateGroup | null;
  // How the group was settled before, so reopening shows those choices.
  resolution?: GroupResolution;
  onResolve: (resolution: GroupResolution) => void;
  onClose: () => void;
}

const rowLabel = (index: number) => `Row ${index + 1}`;

// Duplicate rows inside one import file (FE-6): keep one value per field that
// differs and merge the rows into one, or drop them all. Nothing is sent
// here; the choice can still be changed until Import.
export const FileDuplicateDialog = ({
  rows,
  group,
  resolution,
  onResolve,
  onClose,
}: FileDuplicateDialogProps) => {
  const fields = useMemo(() => group?.differing ?? [], [group]);
  const sources = useMemo(
    () => (group?.rows ?? []).map((index) => ({ key: String(index), label: rowLabel(index) })),
    [group],
  );
  const initial = useMemo(() => {
    if (resolution?.action !== "merge") return undefined;
    return Object.fromEntries(Object.entries(resolution.choices).map(([field, index]) => [field, String(index)]));
  }, [resolution]);
  const { chosen, choose, missing } = useDuplicateChoices(fields, group, initial);

  if (!group) return null;

  // Fields that need no choice: the same in every row, or filled in once.
  const merged = mergeGroup(rows, group, {});
  const asIs = Object.keys(merged)
    .filter((field) => !fields.includes(field) && merged[field]?.trim())
    .map((field) => `${duplicateFieldLabel(field)} ${merged[field]}`);

  const merge = () =>
    onResolve({
      action: "merge",
      choices: Object.fromEntries(Object.entries(chosen).map(([field, key]) => [field, Number(key)])),
    });

  return (
    <AppDialog
      open
      onClose={onClose}
      title={`Duplicate rows in file — ${group.rows.map((i) => i + 1).join(", ")}`}
      description="These rows have the same email or phone number, so they are one contact."
      maxWidth="md"
      actions={
        <div className="flex w-full flex-wrap justify-between gap-2">
          <AppButton variantStyle="outline" color="danger" onClick={() => onResolve({ action: "remove" })}>
            Remove all {group.rows.length} rows
          </AppButton>
          <div className="flex gap-2">
            <AppButton variantStyle="outline" color="gray" onClick={onClose}>
              Cancel
            </AppButton>
            <AppButton onClick={merge} disabled={missing.length > 0}>
              Merge into one row
            </AppButton>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3 text-sm">
        {fields.length > 0 ? (
          <>
            <p className="text-gray-700">Choose which value to keep for each field that differs.</p>
            <ConflictChoiceTable
              fields={fields}
              sources={sources}
              valueOf={(field, key) => rows[Number(key)][field]?.trim() || "-"}
              chosen={chosen}
              onChoose={choose}
            />
          </>
        ) : (
          <p className="text-gray-700">
            No value in these rows contradicts another, so they are merged into one row automatically.
          </p>
        )}
        {missing.length > 0 && (
          <p className="text-xs text-gray-500">Choose a value for every field to merge ({missing.length} left).</p>
        )}
        {asIs.length > 0 && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">Kept as is:</span> {asIs.join(" · ")}
          </p>
        )}
      </div>
    </AppDialog>
  );
};
