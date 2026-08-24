"use client";

// Category page: lists the category's sections and, under each, its articles.
// Route: /help/[slug]/[categorySlug].

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, FileText, Home } from "lucide-react";
import {
  useHelpCategories,
  useHelpSections,
  useHelpArticles,
} from "@/lib/hooks/useHelpCenter";
import HelpShell from "./HelpShell";
import { HelpEmpty, HelpLoading, HelpNotFound } from "./HelpStates";

export default function HelpCategoryClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const categorySlug = (params?.categorySlug as string) ?? "";

  return (
    <HelpShell slug={slug}>
      <HelpCategoryContent slug={slug} categorySlug={categorySlug} />
    </HelpShell>
  );
}

function HelpCategoryContent({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug: string;
}) {
  const { data: categories } = useHelpCategories(slug);
  const { data: sections, isLoading: sectionsLoading, error: sectionsError } =
    useHelpSections(slug, categorySlug);
  const { data: articles, isLoading: articlesLoading } = useHelpArticles(slug);

  const category = useMemo(
    () => categories?.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );

  // Group this category's articles by their section slug.
  const articlesBySection = useMemo(() => {
    const map = new Map<string, typeof articles>();
    (articles ?? [])
      .filter((a) => a.category_slug === categorySlug && a.section_slug)
      .forEach((a) => {
        const key = a.section_slug as string;
        const list = map.get(key) ?? [];
        list.push(a);
        map.set(key, list);
      });
    return map;
  }, [articles, categorySlug]);

  if (sectionsError && (sectionsError as any)?.status === 404) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <HelpNotFound
          title="Category not found"
          message="This category doesn't exist or is no longer available."
        />
      </div>
    );
  }

  const loading = sectionsLoading || articlesLoading;
  const hasContent = (sections ?? []).some(
    (s) => (articlesBySection.get(s.slug) ?? []).length > 0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link
          href={`/help/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1 hover:text-gray-700"
        >
          <Home size={14} /> Home
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium truncate">
          {category?.name || categorySlug}
        </span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {category?.name || categorySlug}
        </h1>
        {category?.description && (
          <p className="mt-2 text-gray-500">{category.description}</p>
        )}
      </header>

      {loading ? (
        <HelpLoading label="Loading articles..." />
      ) : !hasContent ? (
        <HelpEmpty
          title="No articles yet"
          message="There are no published articles in this category."
        />
      ) : (
        <div className="space-y-8">
          {(sections ?? []).map((section) => {
            const list = articlesBySection.get(section.slug) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={section.slug}>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {section.name}
                </h2>
                {section.description && (
                  <p className="text-sm text-gray-500 mb-3">{section.description}</p>
                )}
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white overflow-hidden">
                  {list.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/help/${encodeURIComponent(slug)}/article/${encodeURIComponent(article.slug)}`}
                        className="group flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <FileText size={18} className="text-gray-300 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-gray-900 truncate">
                            {article.title}
                          </span>
                          {article.excerpt && (
                            <span className="block text-sm text-gray-500 truncate">
                              {article.excerpt}
                            </span>
                          )}
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
