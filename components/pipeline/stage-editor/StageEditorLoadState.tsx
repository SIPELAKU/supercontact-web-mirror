"use client";

// The stage list while it loads, or when it failed to load (with a retry).

import { AppButton } from "@/components/ui/app-button";

export function StageEditorLoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading stages">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-gray-600">
      <p>{error}</p>
      <AppButton variantStyle="outline" onClick={onRetry}>
        Try again
      </AppButton>
    </div>
  );
}
