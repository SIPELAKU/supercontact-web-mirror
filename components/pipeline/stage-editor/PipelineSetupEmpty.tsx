"use client";

// In place of the board while the company has no stages (`needs_setup`).

import Link from "next/link";
import { ArrowRight, Columns3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Setup Cepat: industry templates, whose stages can rename the defaults. */
export const SETUP_CEPAT_HREF = "/settings/onboarding";

interface PipelineSetupEmptyProps {
  canManage: boolean;
  onSetUp: () => void;
  /** Spacing around it (the board's by default). */
  className?: string;
  /** Also offer Setup Cepat's industry templates. */
  showTemplateLink?: boolean;
}

export default function PipelineSetupEmpty({ canManage, onSetUp, className = "mx-6 mb-6", showTemplateLink = true }: PipelineSetupEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-14 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Columns3 className="h-7 w-7" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Set up your pipeline</h3>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          {canManage
            ? "Choose the stages your deals move through: start with the defaults or your own, up to 8 stages. You can change them any time."
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
      {canManage && showTemplateLink && (
        <Link
          href={SETUP_CEPAT_HREF}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 underline-offset-4 hover:text-brand hover:underline"
        >
          Or start from an industry template in Setup Cepat
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
