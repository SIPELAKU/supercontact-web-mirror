"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  FileEdit,
  LayoutTemplate,
  Loader2,
  Plus,
  Search,
  Send,
  Settings2,
  ThumbsDown,
  ThumbsUp,
  Eye,
  X,
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { AppAlert } from "@/components/ui/app-alert";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { usePermission } from "@/lib/hooks/usePermission";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import {
  useBulkSetKbArticleStatus,
  useKbArticles,
  useKbPermissions,
  useKbSections,
} from "@/lib/hooks/useKnowledge";
import type {
  KbArticleStatus,
  KbBulkStatusReport,
  KbBulkStatusRequest,
} from "@/lib/types/knowledge";
import { KbStatusBadge } from "./KbStatusBadge";

/** The API caps a list request at 200. Asking for the cap keeps "select all on
 *  this page" honest for all but the largest knowledge bases - and when it IS
 *  hit, the banner below says so and points at the publish-every-draft action,
 *  which runs server-side and is not bounded by what the page fetched. */
const PAGE_LIMIT = 200;

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

/** How the result banner reads back what just happened. */
const STATUS_VERB: Record<string, string> = {
  published: "diterbitkan",
  draft: "dijadikan draft",
  archived: "diarsipkan",
};

/** One bulk button. The count lives in the label because the whole risk of a
 *  bulk action is not knowing how much it touches - and a button that cannot
 *  move anything is disabled rather than hidden, so the option stays
 *  discoverable while the selection is wrong for it. */
function BulkAction({
  label,
  count,
  icon,
  onClick,
  busy,
  primary,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
  busy: boolean;
  primary?: boolean;
}) {
  const disabled = busy || count === 0;
  return (
    <AppButton
      variantStyle={primary ? undefined : "outline"}
      startIcon={busy ? <Loader2 size={16} className="animate-spin" /> : icon}
      disabled={disabled}
      onClick={onClick}
      title={count === 0 ? `Tidak ada artikel terpilih yang bisa ${label.toLowerCase()}` : undefined}
    >
      {label} ({count})
    </AppButton>
  );
}

export default function KnowledgeArticleListClient() {
  const router = useRouter();
  const { canWrite, canManage } = useKbPermissions();
  const { can } = usePermission();
  // useKbPermissions.canPublish also admits knowledge:manage, but this endpoint
  // is gated on knowledge:publish alone - so a manage-only role would be shown
  // the whole selection UI and then get a 403 from every button. Gate on what
  // the API actually checks.
  const canPublish = can("knowledge:publish");

  const [status, setStatus] = useState<KbArticleStatus | "">("");
  const [sectionId, setSectionId] = useState<string>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Honor a ?status= deep link (e.g. the Template Gallery's "Review articles"
  // CTA lands on /knowledge-base?status=draft). Read from window.location on
  // mount instead of useSearchParams to avoid the App Router Suspense
  // requirement for a one-shot initializer.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s === "draft" || s === "published" || s === "archived") setStatus(s);
  }, []);

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
    limit: PAGE_LIMIT,
  });

  // --- bulk status change ----------------------------------------------------
  // Selection spans EVERY status, because the actions differ per status rather
  // than there being one action only drafts can take. Each button is labelled
  // with the number it will actually move, and sends only those ids - so the
  // promise on the button and the number in the result banner always agree.
  const bulkStatus = useBulkSetKbArticleStatus();
  const { confirm, confirmationPopup } = useConfirmationPopup();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [report, setReport] = useState<KbBulkStatusReport | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const draftCount = useMemo(
    () => articles.filter((a) => a.status === "draft").length,
    [articles]
  );
  const listIsCapped = articles.length >= PAGE_LIMIT;

  // Clear the selection whenever the visible set changes. Without this a row
  // selected under one filter stays selected after the filter moves on, and the
  // user changes something they can no longer see.
  useEffect(() => {
    setSelected(new Set());
  }, [status, sectionId, debouncedSearch]);

  /** Which selected articles may actually make each transition. Mirrors the
   *  server's eligibility rules: archived is a retraction, so it never goes
   *  straight back to published, though it may be restored to draft. */
  const eligible = useMemo(() => {
    const chosen = articles.filter((a) => selected.has(a.id));
    return {
      publish: chosen.filter((a) => a.status === "draft").map((a) => a.id),
      draft: chosen
        .filter((a) => a.status === "published" || a.status === "archived")
        .map((a) => a.id),
      archive: chosen
        .filter((a) => a.status === "draft" || a.status === "published")
        .map((a) => a.id),
    };
  }, [articles, selected]);

  const allVisibleSelected =
    articles.length > 0 && articles.every((a) => selected.has(a.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected(allVisibleSelected ? new Set() : new Set(articles.map((a) => a.id)));
  }

  async function runBulk(payload: KbBulkStatusRequest) {
    setReport(null);
    setBulkError(null);
    try {
      const res = await bulkStatus.mutateAsync(payload);
      setReport(res);
      setSelected(new Set());
    } catch (err) {
      // The API layer throws the PARSED BODY for 4xx/5xx (not an Error), and a
      // bare Error("UNAUTHORIZED") for 401. An `instanceof Error` check drops
      // the server's reason on every 403 and prints the raw sentinel on expiry,
      // so route it through the same helper every sibling screen uses.
      setBulkError(
        err instanceof Error && err.message === "UNAUTHORIZED"
          ? "Sesi Anda berakhir. Masuk kembali lalu coba lagi."
          : getErrorMessage(err, "Gagal mengubah status artikel.")
      );
    }
  }

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
                startIcon={<LayoutTemplate size={16} />}
                onClick={() => router.push("/knowledge-base/templates")}
              >
                Template Gallery
              </AppButton>
            )}
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

      {/* Bulk status change: result, errors, and the action bar */}
      {report && (
        <AppAlert
          variant={report.failed.length ? "warning" : "success"}
          title={
            report.changed > 0
              ? `${report.changed} artikel ${STATUS_VERB[report.status] ?? "diubah"}`
              : "Tidak ada artikel yang berubah"
          }
          description={
            <span className="text-sm">
              {report.skipped > 0 && (
                <>{report.skipped} sudah berstatus itu sebelumnya. </>
              )}
              {report.skipped_ineligible > 0 && (
                <>
                  {report.skipped_ineligible} dilewati karena tidak boleh
                  berpindah ke status itu — artikel yang diarsipkan tidak bisa
                  langsung diterbitkan, keluarkan dari arsip dulu.{" "}
                </>
              )}
              {report.failed.length > 0 && <>{report.failed.length} gagal.</>}
            </span>
          }
          onClose={() => setReport(null)}
        />
      )}
      {bulkError && (
        <AppAlert
          variant="failed"
          title="Gagal mengubah status"
          description={bulkError}
          onClose={() => setBulkError(null)}
        />
      )}

      {canPublish && (selected.size > 0 || draftCount > 0) && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#C7D5F8] bg-[#F5F8FF] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-gray-700">
            {selected.size > 0 ? (
              <>
                <span className="font-semibold">{selected.size}</span> artikel
                dipilih
              </>
            ) : (
              <>
                <span className="font-semibold">{draftCount}</span> draft di
                halaman ini belum terbit
                {listIsCapped && (
                  <span className="text-gray-500">
                    {" "}
                    (daftar dibatasi {PAGE_LIMIT} artikel)
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selected.size > 0 ? (
              <>
                <BulkAction
                  label="Terbitkan"
                  count={eligible.publish.length}
                  icon={<Send size={16} />}
                  primary
                  busy={bulkStatus.isPending}
                  onClick={() =>
                    runBulk({ status: "published", article_ids: eligible.publish })
                  }
                />
                <BulkAction
                  label="Jadikan draft"
                  count={eligible.draft.length}
                  icon={<FileEdit size={16} />}
                  busy={bulkStatus.isPending}
                  onClick={() =>
                    runBulk({ status: "draft", article_ids: eligible.draft })
                  }
                />
                <BulkAction
                  label="Arsipkan"
                  count={eligible.archive.length}
                  icon={<Archive size={16} />}
                  busy={bulkStatus.isPending}
                  onClick={() =>
                    confirm({
                      title: `Arsipkan ${eligible.archive.length} artikel?`,
                      description:
                        "Artikel yang diarsipkan berhenti tampil ke pelanggan " +
                        "dan tidak bisa langsung diterbitkan lagi — harus " +
                        "dijadikan draft dulu.",
                      confirmText: "Arsipkan",
                      variant: "warning",
                      onConfirm: () =>
                        runBulk({ status: "archived", article_ids: eligible.archive }),
                    })
                  }
                />
                <AppButton
                  variantStyle="outline"
                  startIcon={<X size={16} />}
                  onClick={() => setSelected(new Set())}
                  disabled={bulkStatus.isPending}
                >
                  Batal pilih
                </AppButton>
              </>
            ) : (
              <AppButton
                variantStyle="outline"
                startIcon={
                  bulkStatus.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )
                }
                disabled={bulkStatus.isPending}
                onClick={() =>
                  // Runs server-side over EVERY draft in the company, not just
                  // the rows fetched here - which is the point when the list is
                  // capped, and the reason this confirms even though the filters
                  // above may be showing a narrower set.
                  confirm({
                    title: "Terbitkan semua draft?",
                    description: (
                      <>
                        Semua artikel berstatus draft di knowledge base ini akan
                        diterbitkan dan langsung terlihat oleh pelanggan —{" "}
                        <strong>termasuk yang tidak tampil di filter saat ini</strong>.
                        Artikel yang diarsipkan tidak akan tersentuh.
                      </>
                    ),
                    confirmText: "Terbitkan semua",
                    variant: "warning",
                    onConfirm: () =>
                      runBulk({ status: "published", all_matching: true }),
                  })
                }
              >
                Terbitkan semua draft
              </AppButton>
            )}
          </div>
        </div>
      )}

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
                  {canPublish && (
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua artikel di halaman ini"
                        className="h-4 w-4 cursor-pointer accent-[#3E63D8] disabled:cursor-not-allowed"
                        disabled={articles.length === 0}
                        checked={allVisibleSelected}
                        ref={(el) => {
                          // Partial selection reads as "some", not "none".
                          if (el)
                            el.indeterminate =
                              selected.size > 0 && !allVisibleSelected;
                        }}
                        onChange={toggleAllVisible}
                      />
                    </th>
                  )}
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
                    className={`cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60 ${
                      selected.has(a.id) ? "bg-[#F5F8FF]" : ""
                    }`}
                  >
                    {canPublish && (
                      <td
                        className="px-4 py-3"
                        // The row navigates; the checkbox must not.
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${a.title}`}
                          className="h-4 w-4 cursor-pointer accent-[#3E63D8]"
                          checked={selected.has(a.id)}
                          onChange={() => toggleOne(a.id)}
                        />
                      </td>
                    )}
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
      {confirmationPopup}
    </div>
  );
}
