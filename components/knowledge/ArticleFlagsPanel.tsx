"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import {
  useKbFlags,
  useFlagKbArticle,
  useResolveKbFlag,
} from "@/lib/hooks/useKnowledge";

interface ArticleFlagsPanelProps {
  articleId: string;
  canManage: boolean;
}

function formatDateTime(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Lists the OPEN flags raised against this article and lets a manager resolve
// them; any user can raise a new flag (POST .../flag).
export function ArticleFlagsPanel({ articleId, canManage }: ArticleFlagsPanelProps) {
  const { data: allFlags = [], isLoading } = useKbFlags("open");
  const resolveFlag = useResolveKbFlag();
  const flagArticle = useFlagKbArticle();

  const [reason, setReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const flags = useMemo(
    () => allFlags.filter((f) => f.article_id === articleId),
    [allFlags, articleId]
  );

  const handleResolve = async (id: string) => {
    try {
      await resolveFlag.mutateAsync(id);
      notify.success("Flag resolved");
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Failed to resolve flag") });
    }
  };

  const handleReport = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    try {
      await flagArticle.mutateAsync({ id: articleId, reason: trimmed });
      notify.success("Reported", { description: "Thanks - this article has been flagged for review." });
      setReason("");
      setReporting(false);
    } catch (err) {
      notify.error("Error", { description: getErrorMessage(err, "Failed to flag article") });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-800">Flags</h3>
          {flags.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {flags.length} open
            </span>
          )}
        </div>
        {!reporting && (
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="text-[12px] font-semibold text-[#3E63D8] hover:underline"
          >
            Report issue
          </button>
        )}
      </div>

      {reporting && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="What's wrong with this article?"
            className="w-full resize-none rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#5479EE]"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReporting(false);
                setReason("");
              }}
              className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <AppButton
              onClick={handleReport}
              disabled={!reason.trim() || flagArticle.isPending}
              className="!h-8 !text-[12px]"
            >
              {flagArticle.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit"}
            </AppButton>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="flex items-center gap-2 py-2 text-[13px] text-gray-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading flags…
        </p>
      ) : flags.length === 0 ? (
        <p className="py-1 text-[13px] text-gray-400">No open flags on this article.</p>
      ) : (
        <ul className="space-y-2">
          {flags.map((f) => (
            <li
              key={f.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-[13px] text-gray-700">{f.reason}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {formatDateTime(f.created_at)}
                  {f.created_by_name ? ` · ${f.created_by_name}` : ""}
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleResolve(f.id)}
                  disabled={resolveFlag.isPending}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolve
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
