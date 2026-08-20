"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Loader2,
  Plus,
  Search,
  Settings2,
  ThumbsDown,
  ThumbsUp,
  Eye,
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useKbArticles, useKbSections, useKbPermissions } from "@/lib/hooks/useKnowledge";
import type { KbArticleStatus } from "@/lib/types/knowledge";
import { KbStatusBadge } from "./KbStatusBadge";

const STATUS_TABS: { value: KbArticleStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function KnowledgeArticleListClient() {
  const router = useRouter();
  const { canWrite, canManage } = useKbPermissions();

  const [status, setStatus] = useState<KbArticleStatus | "">("");
  const [sectionId, setSectionId] = useState<string>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: sections = [] } = useKbSections();
  const sectionName = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [sections]);

  const { data: articles = [], isLoading, isError, refetch } = useKbArticles({
    status: status || undefined,
    section_id: sectionId || undefined,
    q: debouncedSearch.trim() || undefined,
  });

  const sectionOptions = useMemo(
    () => [
      { value: "", label: "All sections" },
      ...sections.map((s) => ({ value: s.id, label: s.name })),
    ],
    [sections]
  );

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Author and manage help center articles."
        breadcrumbs={[{ label: "Support" }, { label: "Knowledge Base" }]}
        actions={
          <div className="flex items-center gap-2">
            {canManage && (
              <AppButton
                variantStyle="outline"
                startIcon={<Settings2 size={16} />}
                onClick={() => router.push("/knowledge-base/categories")}
              >
                Categories
              </AppButton>
            )}
            {canWrite && (
              <AppButton
                startIcon={<Plus size={16} />}
                onClick={() => router.push("/knowledge-base/articles/new")}
              >
                New article
              </AppButton>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                status === tab.value
                  ? "bg-[#EEF2FD] text-[#3E63D8]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <AppSelect
              value={sectionId}
              placeholder="All sections"
              onChange={(e) => setSectionId(String(e.target.value))}
              options={sectionOptions}
              isBgWhite
            />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="h-10 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#5479EE]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading articles…
          </div>
        ) : isError ? (
          <div className="py-12">
            <EmptyState
              icon={BookOpen}
              title="Couldn't load articles"
              description="Something went wrong while fetching the knowledge base."
              action={{ label: "Retry", onClick: () => refetch() }}
            />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={BookOpen}
              title="No articles yet"
              description={
                debouncedSearch || status || sectionId
                  ? "No articles match the current filters."
                  : "Create your first help center article."
              }
              action={
                canWrite
                  ? {
                      label: "New article",
                      onClick: () => router.push("/knowledge-base/articles/new"),
                      icon: <Plus size={16} />,
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[12px] uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Section</th>
                  <th className="px-4 py-3 font-semibold">Locale</th>
                  <th className="px-4 py-3 text-right font-semibold">Views</th>
                  <th className="px-4 py-3 text-right font-semibold">Helpful</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => router.push(`/knowledge-base/articles/${a.id}`)}
                    className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{a.title}</div>
                      {a.excerpt && (
                        <div className="mt-0.5 line-clamp-1 text-[12px] text-gray-400">{a.excerpt}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <KbStatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.section_id ? sectionName.get(a.section_id) || "—" : "—"}
                    </td>
                    <td className="px-4 py-3 uppercase text-gray-500">{a.locale}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                        {a.view_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 text-emerald-600">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {a.helpful_count}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-gray-400">
                          <ThumbsDown className="h-3.5 w-3.5" />
                          {a.not_helpful_count}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(a.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
