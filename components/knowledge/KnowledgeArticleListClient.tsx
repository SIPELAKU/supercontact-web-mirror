"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  FileEdit,
  LayoutTemplate,
  Loader2,
  Plus,
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
import { SuperTable } from "@/components/ui/super-table";
import type { MRT_ColumnDef } from "@/components/ui/super-table";
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
  KbArticleSummary,
  KbBulkStatusReport,
  KbBulkStatusRequest,
} from "@/lib/types/knowledge";
import { KbStatusBadge } from "./KbStatusBadge";

/** One lazy batch. The list used to fetch a flat 200 - the API's hard cap -
 *  and tell the user "daftar dibatasi 200 artikel" when a knowledge base
 *  outgrew it, which is the one thing a list should never have to say. Rows now
 *  accumulate by `offset` as you scroll, so there is no ceiling to announce.
 *  GET /knowledge/articles returns a bare array with no total, so "how many
 *  altogether" is unknowable here - SuperTable falls back to "a full batch
 *  implies another one". */
const BATCH_SIZE = 50;

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
  // Search is SuperTable's now (permanent field, "/" shortcut, its own
  // debounce), so the page only keeps the two filters it owns.
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

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

  const {
    data: batch = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useKbArticles({
    status: status || undefined,
    section_id: sectionId || undefined,
    q: search.trim() || undefined,
    limit: BATCH_SIZE,
    offset,
  });

  const articles = batch;

  // --- bulk status change ----------------------------------------------------
  // Selection spans EVERY status, because the actions differ per status rather
  // than there being one action only drafts can take. Each button is labelled
  // with the number it will actually move, and sends only those ids - so the
  // promise on the button and the number in the result banner always agree.
  const bulkStatus = useBulkSetKbArticleStatus();
  const { confirm, confirmationPopup } = useConfirmationPopup();
  // The rows themselves, not a Set of ids: SuperTable owns the checkboxes and
  // hands back what is ticked, so the page no longer maintains a parallel
  // selection model that could disagree with the one on screen.
  const [selectedRows, setSelectedRows] = useState<KbArticleSummary[]>([]);
  const handleSelectionChange = useCallback(
    (rows: KbArticleSummary[]) => setSelectedRows(rows),
    []
  );
  // Bumping this makes SuperTable drop its selection - and only that. It must
  // not reload the list: cancelling a selection is not a change of result.
  const [selectionEpoch, setSelectionEpoch] = useState(0);
  const clearTableSelection = useCallback(() => setSelectionEpoch((n) => n + 1), []);
  const [report, setReport] = useState<KbBulkStatusReport | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Changing a page-owned filter sends the table back to the first batch AND
  // clears its selection - SuperTable does both off this key, so the page no
  // longer needs an effect that could fall out of step with the rows.
  const filterKey = `${status}|${sectionId}`;
  useEffect(() => {
    setOffset(0);
  }, [filterKey, search]);

  /** Which selected articles may actually make each transition. Mirrors the
   *  server's eligibility rules: archived is a retraction, so it never goes
   *  straight back to published, though it may be restored to draft. */
  const eligible = useMemo(() => {
    const chosen = selectedRows;
    return {
      publish: chosen.filter((a) => a.status === "draft").map((a) => a.id),
      draft: chosen
        .filter((a) => a.status === "published" || a.status === "archived")
        .map((a) => a.id),
      archive: chosen
        .filter((a) => a.status === "draft" || a.status === "published")
        .map((a) => a.id),
    };
  }, [selectedRows]);

  async function runBulk(payload: KbBulkStatusRequest) {
    setReport(null);
    setBulkError(null);
    try {
      const res = await bulkStatus.mutateAsync(payload);
      setReport(res);
      clearTableSelection?.();
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

  const columns = useMemo<MRT_ColumnDef<KbArticleSummary>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        Cell: ({ row }) => (
          <div>
            <div className="font-semibold">{row.original.title}</div>
            {row.original.excerpt && (
              <div className="mt-0.5 line-clamp-1 text-[12px] font-normal text-gray-400">
                {row.original.excerpt}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => <KbStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "section_id",
        header: "Section",
        Cell: ({ row }) =>
          row.original.section_id
            ? sectionName.get(row.original.section_id) || "—"
            : "—",
      },
      {
        accessorKey: "locale",
        header: "Locale",
        Cell: ({ cell }) => (
          <span className="uppercase text-gray-500">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "view_count",
        header: "Views",
        Cell: ({ cell }) => (
          <span className="inline-flex items-center gap-1 text-gray-600">
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        id: "helpful",
        header: "Helpful",
        Cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-emerald-600">
              <ThumbsUp className="h-3.5 w-3.5" />
              {row.original.helpful_count}
            </span>
            <span className="inline-flex items-center gap-0.5 text-gray-400">
              <ThumbsDown className="h-3.5 w-3.5" />
              {row.original.not_helpful_count}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        Cell: ({ cell }) => (
          <span className="text-gray-500">{formatDate(cell.getValue<string>())}</span>
        ),
      },
    ],
    [sectionName]
  );

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

      {canPublish && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#C7D5F8] bg-[#F5F8FF] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-gray-700">
            {selectedRows.length > 0 ? (
              <>
                <span className="font-semibold">{selectedRows.length}</span>{" "}
                artikel dipilih
              </>
            ) : (
              // This used to read "N draft di halaman ini belum terbit
              // (daftar dibatasi 200 artikel)". Both halves were artefacts of
              // fetching one capped page: the count described only what
              // happened to be loaded, while the button beside it has always
              // published EVERY draft server-side. With no page and no cap
              // left, the honest line is what the button actually does.
              <>Terbitkan setiap draft di knowledge base sekaligus.</>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedRows.length > 0 ? (
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
                  onClick={clearTableSelection}
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

      <SuperTable<KbArticleSummary>
        tableId="kb-articles-table"
        urlKey=""
        data={articles}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Something went wrong while fetching the knowledge base."
        onRetry={() => refetch()}
        getRowId={(row) => row.id}
        entityLabel="artikel"
        searchPlaceholder="Cari judul atau isi artikel"
        // No `rowCount`: GET /knowledge/articles returns a bare array with no
        // total, so SuperTable falls back to "a full batch implies another".
        manualPagination
        manualSorting
        manualFiltering
        // Status and section are page-owned (the tab strip and the select
        // above), so this tells SuperTable to go back to the first batch and
        // drop its selection when either moves.
        resetPageKey={filterKey}
        clearSelectionKey={selectionEpoch}
        onStateChange={(state) => {
          setSearch(state.globalFilter);
          setOffset(state.pagination.pageIndex * state.pagination.pageSize);
        }}
        onSelectionChange={handleSelectionChange}
        // Class B in the row-interaction rules: a real `[id]` page exists, and
        // the title column is the accessible way into it.
        primaryColumn={{
          accessorKey: "title",
          href: (row) => `/knowledge-base/articles/${row.id}`,
        }}
        onRowClick={(row) => router.push(`/knowledge-base/articles/${row.id}`)}
        renderEmptyState={({ hasActiveFilters, hasSearch }) => (
          <EmptyState
            icon={BookOpen}
            title={hasSearch || hasActiveFilters || status || sectionId
              ? "No matching articles"
              : "No articles yet"}
            description={
              hasSearch || hasActiveFilters || status || sectionId
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
        )}
        features={{
          globalFilter: true,
          sorting: false, // the endpoint ranks by relevance when `q` is set
          rowSelection: canPublish ? "multi" : "none",
          urlSync: true,
          pageSizeOptions: [BATCH_SIZE, 100, 200],
        }}
      />

      {confirmationPopup}
    </div>
  );
}
