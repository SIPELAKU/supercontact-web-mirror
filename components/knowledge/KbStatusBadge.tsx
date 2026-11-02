import { cn } from "@/lib/utils";
import type { KbArticleStatus } from "@/lib/types/knowledge";

const STYLES: Record<KbArticleStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-amber-100 text-amber-700",
};

const LABELS: Record<KbArticleStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

/** Beside the status in the article list: a draft with nothing left to fill
 *  is ready to publish; an article with placeholders left says how many. */
export function KbReadinessTag({ readiness }: { readiness: "ready" | number | null }) {
  if (readiness === null) return null;
  const ready = readiness === "ready";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}
      title={
        ready
          ? "No placeholders left - this draft can be published"
          : "Fill these placeholders before publishing"
      }
    >
      {ready ? "Ready to publish" : `${readiness} placeholder${readiness === 1 ? "" : "s"} left`}
    </span>
  );
}

export function KbStatusBadge({ status, className }: { status: KbArticleStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLES[status] ?? STYLES.draft,
        className
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
