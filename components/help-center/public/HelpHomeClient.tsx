"use client";

// Portal home: branded hero (headline/subtext), a search box, and the grid of
// public categories. Route: /help/[slug].

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, FolderOpen } from "lucide-react";
import { useHelpConfig, useHelpCategories } from "@/lib/hooks/useHelpCenter";
import HelpShell from "./HelpShell";
import HelpSearchBox from "./HelpSearchBox";
import { HelpEmpty, HelpLoading } from "./HelpStates";

export default function HelpHomeClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  return (
    <HelpShell slug={slug}>
      <HelpHomeContent slug={slug} />
    </HelpShell>
  );
}

function HelpHomeContent({ slug }: { slug: string }) {
  const { data: config } = useHelpConfig(slug);
  const { data: categories, isLoading } = useHelpCategories(slug);

  return (
    <div>
      {/* Branded hero */}
      <section
        className="w-full text-white"
        style={{ backgroundColor: "var(--hc-brand, #4F46E5)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {config?.welcome_headline || "How can we help?"}
          </h1>
          {config?.welcome_subtext && (
            <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto mb-8">
              {config.welcome_subtext}
            </p>
          )}
          <div className={config?.welcome_subtext ? "" : "mt-8"}>
            <HelpSearchBox slug={slug} />
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {isLoading ? (
          <HelpLoading label="Loading categories..." />
        ) : !categories || categories.length === 0 ? (
          <HelpEmpty
            title="No categories yet"
            message="This help center hasn't published any content yet."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/help/${encodeURIComponent(slug)}/${encodeURIComponent(cat.slug)}`}
                className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
              >
                <span
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: "var(--hc-accent, #6366F1)" }}
                >
                  <FolderOpen size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {cat.name}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </span>
                  {cat.description && (
                    <span className="mt-1 block text-sm text-gray-500 line-clamp-2">
                      {cat.description}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
