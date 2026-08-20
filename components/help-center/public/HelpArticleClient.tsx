"use client";

// Article page: breadcrumb, title, body, and the feedback widget.
// Route: /help/[slug]/article/[articleSlug].
//
// SECURITY: the article body is rendered ONLY through renderMarkdown, which
// HTML-escapes the input first and re-introduces a small fixed set of safe tags
// (safeHref blocks javascript: URLs). This is the same vetted path the KB
// authoring preview uses; the raw `body` is NEVER handed to the DOM directly,
// so an injected <script> / javascript: link is rendered inert as literal text.

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useHelpArticle } from "@/lib/hooks/useHelpCenter";
import { renderMarkdown } from "@/lib/utils/markdown";
import HelpShell from "./HelpShell";
import HelpFeedbackWidget from "./HelpFeedbackWidget";
import { HelpLoading, HelpNotFound } from "./HelpStates";

export default function HelpArticleClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const articleSlug = (params?.articleSlug as string) ?? "";

  return (
    <HelpShell slug={slug}>
      <HelpArticleContent slug={slug} articleSlug={articleSlug} />
    </HelpShell>
  );
}

function HelpArticleContent({
  slug,
  articleSlug,
}: {
  slug: string;
  articleSlug: string;
}) {
  const { data: article, isLoading, error } = useHelpArticle(slug, articleSlug);

  if (isLoading) {
    return <HelpLoading label="Loading article..." />;
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <HelpNotFound
          title="Article not found"
          message="This article doesn't exist or is no longer available."
        />
      </div>
    );
  }

  const updated = (() => {
    try {
      return new Date(article.updated_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  })();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link
          href={`/help/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1 hover:text-gray-700"
        >
          <Home size={14} /> Home
        </Link>
        {article.category_slug && (
          <>
            <ChevronRight size={14} className="text-gray-300" />
            <Link
              href={`/help/${encodeURIComponent(slug)}/${encodeURIComponent(article.category_slug)}`}
              className="hover:text-gray-700 truncate"
            >
              {article.category_name || article.category_slug}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium truncate">{article.title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {article.title}
        </h1>
        {updated && (
          <p className="mt-2 text-sm text-gray-400">Last updated {updated}</p>
        )}
      </header>

      {/* Body: renderMarkdown escapes-then-transforms; safe to inject. */}
      <div
        className="kb-prose text-gray-800"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
      />

      <HelpFeedbackWidget key={article.slug} slug={slug} articleSlug={article.slug} />
    </article>
  );
}
