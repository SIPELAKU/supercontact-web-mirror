"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";

/**
 * The board could not be loaded. With no board on screen it takes the board's
 * place (an empty board would read as "no deals"); over an older board it
 * says that board may be out of date.
 */
export default function BoardLoadError({ hasBoard, onRetry }: { hasBoard: boolean; onRetry: () => void }) {
  if (hasBoard) {
    return (
      <div
        role="alert"
        className="mx-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Couldn&apos;t update the board. What you see may be out of date.
        </span>
        <button type="button" onClick={onRetry} className="cursor-pointer font-semibold underline underline-offset-2">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div role="alert" className="mx-6 mb-6 flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden />
      <div>
        <p className="font-semibold text-gray-900">Couldn&apos;t load the pipeline</p>
        <p className="mt-1 text-sm text-gray-600">Check your connection, then try again.</p>
      </div>
      <AppButton variantStyle="primary" startIcon={<RotateCw className="h-4 w-4" />} onClick={onRetry}>
        Try again
      </AppButton>
    </div>
  );
}
