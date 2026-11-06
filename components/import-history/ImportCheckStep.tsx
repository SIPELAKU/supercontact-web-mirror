"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Info } from "lucide-react";
import {
  fileCheckSummary,
  groupStatus,
  type FileCheck,
  type GroupResolution,
  type GroupStatus,
} from "@/lib/utils/importFileDuplicates";

interface ImportCheckStepProps {
  check: FileCheck;
  resolutions: Record<number, GroupResolution>;
  onOpenGroup: (position: number) => void;
}

// Long files can have thousands of invalid rows; the first ones are enough
// to see what to fix in the file.
const INVALID_ROWS_SHOWN = 200;

const STATUS_CHIP: Record<GroupStatus, { label: string; className: string }> = {
  needs_choice: { label: "Needs a choice", className: "bg-amber-50 text-amber-700" },
  merged: { label: "Merged", className: "bg-green-50 text-green-700" },
  // No value contradicts another: identical rows, or rows that fill in each
  // other's blanks. Either way they become one row without asking.
  identical: { label: "Same contact, merged automatically", className: "bg-gray-100 text-gray-600" },
  removed: { label: "Removed", className: "bg-red-50 text-red-600" },
};

const rowList = (indices: number[]) => indices.map((i) => i + 1).join(", ");
const plural = (count: number, word: string) => `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

// FE-6: what the file check found, before anything is sent. Display only:
// the modal owns the check, the choices and the dialog.
export const ImportCheckStep = ({ check, resolutions, onOpenGroup }: ImportCheckStepProps) => {
  const [showInvalid, setShowInvalid] = useState(false);
  const summary = fileCheckSummary(check, resolutions);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-auto text-sm">
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          <span className="font-semibold">{plural(summary.toSend, "row")}</span> will be imported.
        </span>
      </div>

      {summary.groups > 0 && (
        <section className="rounded-lg border border-gray-200">
          <header className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <Copy className="h-4 w-4 shrink-0 text-[#5479EE]" />
            <span className="font-medium text-gray-900">
              {plural(summary.groups, "duplicate group")}
              {summary.needChoice > 0 && <span className="text-amber-700"> ({summary.needChoice} need a choice)</span>}
            </span>
          </header>
          <ul className="max-h-56 divide-y divide-gray-100 overflow-auto">
            {check.groups.map((group, position) => {
              const status = groupStatus(group, resolutions[position]);
              const chip = STATUS_CHIP[status];
              return (
                <li key={group.rows[0]} className="flex items-center justify-between gap-3 px-4 py-2">
                  <span className="text-gray-700">Rows {rowList(group.rows)}</span>
                  <span className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${chip.className}`}>{chip.label}</span>
                    <button
                      type="button"
                      onClick={() => onOpenGroup(position)}
                      className="text-xs font-medium text-[#5479EE] hover:underline"
                    >
                      {status === "needs_choice" ? "Resolve" : "Change"}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {summary.invalid > 0 && (
        <section className="rounded-lg border border-red-200">
          <header className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="flex items-center gap-2 font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {plural(summary.invalid, "invalid row")} (will be skipped)
            </span>
            <button
              type="button"
              onClick={() => setShowInvalid((open) => !open)}
              className="text-xs font-medium text-[#5479EE] hover:underline"
            >
              {showInvalid ? "Hide" : "Show"}
            </button>
          </header>
          {showInvalid && (
            <ul className="max-h-56 divide-y divide-red-50 overflow-auto border-t border-red-100">
              {check.invalid.slice(0, INVALID_ROWS_SHOWN).map(({ index, issues }) => (
                <li key={index} className="px-4 py-2">
                  <span className="font-medium text-gray-900">Row {index + 1}:</span>{" "}
                  <span className="text-gray-700">{issues.map((issue) => issue.message).join(", ")}</span>
                </li>
              ))}
              {check.invalid.length > INVALID_ROWS_SHOWN && (
                <li className="px-4 py-2 text-xs text-gray-500">
                  and {(check.invalid.length - INVALID_ROWS_SHOWN).toLocaleString()} more
                </li>
              )}
            </ul>
          )}
        </section>
      )}

      {summary.skipped > 0 && (
        <p className="flex items-center gap-2 px-1 text-gray-500">
          <Info className="h-4 w-4 shrink-0" />
          {plural(summary.skipped, "row")} without email or phone, skipped.
        </p>
      )}
    </div>
  );
};
