"use client";

import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useKbPermissions } from "@/lib/hooks/useKnowledge";

// Page-level read gate for the Knowledge Base authoring app. Nav visibility
// already hides the section from users without `knowledge:read`, but this stops
// a deep-link from rendering the tools for someone who lacks any KB grant. Waits
// for the auth profile to finish loading so a real user isn't flashed a denial.
// `requireManage` raises the bar to `knowledge:manage` (e.g. the Template
// Gallery, whose backend endpoints are manage-gated).
export function KbAccessGuard({
  children,
  requireManage = false,
}: {
  children: React.ReactNode;
  requireManage?: boolean;
}) {
  const { loading } = useAuth();
  const { canRead, canManage } = useKbPermissions();
  const allowed = requireManage ? canManage : canRead;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold text-gray-800">No access</h1>
        <p className="mt-1 text-sm text-gray-500">
          {requireManage
            ? "You don't have permission to manage the Knowledge Base."
            : "You don't have permission to view the Knowledge Base."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
