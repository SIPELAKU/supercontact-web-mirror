"use client";

import { useId } from "react";
import { duplicateFieldLabel } from "@/lib/utils/contactDuplicate";

export interface ChoiceSource {
  key: string;
  label: string;
}

interface ConflictChoiceTableProps {
  // The fields that need a choice, one row each.
  fields: string[];
  // One column each: Existing / New for a database duplicate, Row 4 / Row 17 /
  // ... for duplicate rows in a file.
  sources: ChoiceSource[];
  // The value shown in a cell, already as text ("-" when empty).
  valueOf: (field: string, sourceKey: string) => string;
  chosen: Record<string, string>;
  onChoose: (field: string, sourceKey: string) => void;
  disabled?: boolean;
  fieldLabel?: (field: string) => string;
}

// Pick one source per field. Display only: the dialog that renders it owns
// the choices (useDuplicateChoices) and what they are sent as.
export const ConflictChoiceTable = ({
  fields,
  sources,
  valueOf,
  chosen,
  onChoose,
  disabled = false,
  fieldLabel = duplicateFieldLabel,
}: ConflictChoiceTableProps) => {
  // Radio group names must be unique on the page, also with two tables open.
  const groupId = useId();

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead className="bg-[#EEF2FD] text-xs text-gray-600">
          <tr>
            <th className="px-3 py-2 font-semibold">Field</th>
            {sources.map((source) => (
              <th key={source.key} className="px-3 py-2 font-semibold">
                {source.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field} className="border-t border-gray-100 align-top">
              <td className="px-3 py-2 font-medium text-gray-900">{fieldLabel(field)}</td>
              {sources.map((source) => (
                <td key={source.key} className="px-3 py-2">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name={`${groupId}-${field}`}
                      className="mt-0.5 accent-[#5479EE]"
                      checked={chosen[field] === source.key}
                      disabled={disabled}
                      onChange={() => onChoose(field, source.key)}
                    />
                    <span className="break-all text-gray-900">{valueOf(field, source.key)}</span>
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
