"use client";

// components/knowledge/KnowledgePlaceholdersClient.tsx
//
// Knowledge Base › Fill placeholders. The raw {{VAR}} that template-installed
// articles still carry, filled from the KB itself instead of only from the Bot
// Playground's Content Gaps tab or the end of Setup Cepat. Two views of the
// same Content Gaps data: per placeholder (fill once, applied everywhere) and
// per article (what is still missing where).

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { usePermission } from "@/lib/hooks/usePermission";
import { useContentGaps } from "@/lib/hooks/useBotPlayground";
import { articlesFromGaps } from "@/lib/utils/kbPlaceholders";
import type { KbArticleStatus } from "@/lib/types/knowledge";
import KbPlaceholderFillForm from "./KbPlaceholderFillForm";
import { KbStatusBadge } from "./KbStatusBadge";

const SHOWN_PER_ARTICLE = 8;

type View = "placeholder" | "article";

const VIEWS: { value: View; label: string }[] = [
  { value: "placeholder", label: "By placeholder" },
  { value: "article", label: "By article" },
];

export default function KnowledgePlaceholdersClient() {
  const router = useRouter();
  const { can } = usePermission();
  // Content Gaps is gated on omnichannel:setup, filling on knowledge:publish.
  const allowed = can("omnichannel:setup") && can("knowledge:publish");
  const [view, setView] = useState<View>("placeholder");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-16">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/knowledge-base")}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fill placeholders</h1>
          <p className="text-[12.5px] text-gray-400">
            Replace the {"{{…}}"} left in your articles with real values.
          </p>
        </div>
      </div>

      {!allowed ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Filling placeholders needs the Knowledge Base publish and Omnichannel setup permissions.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setView(v.value)}
                className={
                  view === v.value
                    ? "rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700"
                    : "rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
                }
              >
                {v.label}
              </button>
            ))}
          </div>

          {view === "placeholder" ? (
            <KbPlaceholderFillForm
              intro={
                <>
                  Each value is applied to every article that uses that placeholder. Leave a field empty
                  to keep its placeholder for now. Articles that still contain one cannot be published.
                </>
              }
            />
          ) : (
            <ArticleGaps />
          )}
        </div>
      )}
    </div>
  );
}

/** What is still missing, article by article, with a way into each one. */
function ArticleGaps() {
  const { data: gaps, isLoading } = useContentGaps();
  const articles = articlesFromGaps(gaps);

  if (isLoading || !gaps) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-gray-400" size={22} />
      </div>
    );
  }
  if (articles.length === 0) {
    return (
      <p className="inline-flex items-center justify-center gap-1.5 py-8 text-center text-sm text-emerald-700">
        <CheckCircle2 size={16} /> All articles are clean — no placeholders left.
      </p>
    );
  }
  return (
    <>
      <p className="text-sm text-gray-700">
        <strong>{articles.length}</strong> article{articles.length === 1 ? "" : "s"} still contain placeholders.
      </p>
      <ul className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {articles.map((a) => (
          <li key={a.id} className="flex flex-col gap-1.5 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{a.title}</span>
                {a.status && <KbStatusBadge status={a.status as KbArticleStatus} />}
              </div>
              <Link
                href={`/knowledge-base/articles/${a.id}`}
                className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
              >
                Edit
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              {a.placeholders
                .slice(0, SHOWN_PER_ARTICLE)
                .map((p) => `{{${p}}}`)
                .join(", ")}
              {a.placeholders.length > SHOWN_PER_ARTICLE &&
                ` +${a.placeholders.length - SHOWN_PER_ARTICLE} more`}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
