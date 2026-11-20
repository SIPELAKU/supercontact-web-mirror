"use client";

// In place of the board while the company has no stages (`needs_setup`).

import { Columns3, Plus } from "lucide-react";

interface PipelineSetupEmptyProps {
  canManage: boolean;
  onSetUp: () => void;
}

export default function PipelineSetupEmpty({ canManage, onSetUp }: PipelineSetupEmptyProps) {
  return (
    <div className="mx-6 mb-6 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Columns3 className="h-7 w-7" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Set up your pipeline</h3>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          {canManage
            ? "Choose the stages your deals move through. You can start with the defaults and change them any time."
            : "Your pipeline isn't set up yet. Ask an Admin to set it up."}
        </p>
      </div>
      {canManage && (
        <button
          type="button"
          onClick={onSetUp}
          className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white shadow-md transition group-hover:bg-brand-hover group-hover:shadow-lg">
            <Plus className="h-8 w-8" />
          </span>
          <span className="text-sm font-semibold text-brand">Set Up Stages</span>
        </button>
      )}
    </div>
  );
}
