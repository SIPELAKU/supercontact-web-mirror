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
