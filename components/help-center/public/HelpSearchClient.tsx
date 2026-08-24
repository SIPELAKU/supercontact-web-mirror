"use client";

// Search results page. Reads ?q= from the URL, shows results with snippets
// linking to articles. Route: /help/[slug]/search.

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useHelpSearch } from "@/lib/hooks/useHelpCenter";
import { stripHtml } from "@/lib/utils/markdown";
import HelpShell from "./HelpShell";
import HelpSearchBox from "./HelpSearchBox";
import { HelpEmpty, HelpLoading } from "./HelpStates";

export default function HelpSearchClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  return (
    <HelpShell slug={slug}>
      <HelpSearchContent slug={slug} />
    </HelpShell>
  );
}

function HelpSearchContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const { data: results, isLoading, isFetching } = useHelpSearch(slug, q);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link
          href={`/help/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1 hover:text-gray-700"
        >
          <Home size={14} /> Home
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium">Search</span>
      </nav>

      <div className="mb-8">
        <HelpSearchBox slug={slug} initialQuery={q} autoFocus />
      </div>

      {!q.trim() ? (
        <HelpEmpty
          title="Search the help center"
          message="Type a question above to find answers."
        />
      ) : isLoading || isFetching ? (
        <HelpLoading label="Searching..." />
      ) : !results || results.length === 0 ? (
        <HelpEmpty
          title="No results found"
          message={`We couldn't find anything for "${q}". Try a different search.`}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length === 1 ? "" : "s"} for &quot;{q}&quot;
          </p>
          <ul className="space-y-3">
            {results.map((hit) => (
              <li key={hit.slug}>
                <Link
                  href={`/help/${encodeURIComponent(slug)}/article/${encodeURIComponent(hit.slug)}`}
                  className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                >
                  <h2 className="font-semibold text-gray-900">{hit.title}</h2>
                  {(hit.snippet || hit.excerpt) && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {stripHtml(hit.snippet) || hit.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
