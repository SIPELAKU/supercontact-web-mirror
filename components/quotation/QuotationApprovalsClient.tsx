"use client";

// components/quotation/QuotationApprovalsClient.tsx
//
// The tenant approval queue (Phase 4, spec I6): every quotation waiting on
// someone who holds `quotations:approve`, with the two numbers that decide the
// answer - the worst effective discount and the worst line margin at the
// moment it was submitted.
//
// Gated on `quotations:approve` with <AccessDenied/> for everyone else, and
// the sidebar entry carries the same grant, so a Staff seller never sees the
// screen exists. That is belt-and-braces: `GET /quotations/approvals` requires
// the same permission server-side.
//
// A17 is visible here rather than hidden: a row the CALLER submitted arrives
// with `can_decide: false` from the server, and its buttons are disabled with
// the reason spelled out.
//
// With ONE exception, which is the owner's 5 Sep 2026 amendment: a tenant with
// no second `quotations:approve` holder routes the request to its own
// requester, the row carries `self_approved`, and the server ACCEPTS that
// decision - so `can_decide` comes back true and the buttons are live. Without
// that, every staging tenant and production's Superjob would sit on a queue
// they can look at and never clear.

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Check, ShieldQuestion, X } from "lucide-react";
import { format } from "date-fns";
import { AppTextarea } from "@/components/ui/app-textarea";
import { EmptyState } from "@/components/ui/empty-state";
import AccessDenied from "@/components/settings/AccessDenied";
import PageHeader from "@/components/ui/page-header";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { decideQuotationApproval, fetchApprovalQueue } from "@/lib/api/quotations";
import { formatPercent, formatRupiah } from "@/lib/helper/currency";
import { notify } from "@/lib/notifications";
import { mapQuotationException } from "@/lib/utils/quotation-errors";
import type {
  QuotationApprovalQueueItem,
  QuotationApprovalStatus,
} from "@/lib/types/Quotation";

// MUST equal the SuperTable batch size, or the lazy footer asks for page 2 of
// 25 while showing 10 and rows 11-25 vanish without a trace.
const PAGE_LIMIT = 25;

const STATUS_OPTIONS: { value: QuotationApprovalStatus; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_COLOR: Record<
  QuotationApprovalStatus,
  "warning" | "success" | "error" | "default"
> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
};

const REASON_LABEL: Record<string, string> = {
  discount_percent: "Diskon",
  margin: "Margin",
  both: "Diskon + margin",
};

function safeDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, "dd MMM yyyy HH:mm");
}

export default function QuotationApprovalsClient() {
  const router = useRouter();
  const { can } = usePermission();
  const { getToken } = useAuth();

  const allowed = can("quotations:approve");

  const [page, setPage] = useState(1);
  // A BOOLEAN, not a status select. SuperTable announces its state on mount
  // with no filter set, so a `select` defaulting to "pending" would be cleared
  // to "all" the instant the table mounted. A boolean announces `false`, which
  // IS the wanted default - the same reason every catalogue manager uses
  // `include_inactive` rather than a status dropdown.
  const [includeDecided, setIncludeDecided] = useState(false);
  // Wired all the way to the server. The table is declared `manualFiltering` /
  // `manualSorting`, which turns MRT's own filter and sort row models OFF - so
  // a search box or a sortable header that is not forwarded does NOTHING at
  // all, which the SuperTable README names as worse than offering neither.
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // Bumped after every decision so the lazy list restarts from batch 1: a
  // decided row leaves the `pending` queue, and leaving it on screen would
  // invite a second decision the server answers 409 APPROVAL_ALREADY_DECIDED.
  const [mutationSeq, setMutationSeq] = useState(0);
  // The decision in flight, and the comment it will be recorded with.
  //
  // Deliberately the plain <ConfirmationPopup> and NOT `useConfirmationPopup`:
  // that hook renders the popup itself and accepts no children, so the comment
  // field would have had to live on the page BEHIND the modal - out of reach
  // at exactly the moment the approver is deciding. The comment belongs in the
  // dialog that asks the question (spec I6).
  const [decisionTarget, setDecisionTarget] = useState<
    { row: QuotationApprovalQueueItem; approved: boolean } | null
  >(null);
  const [note, setNote] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "quotation-approvals",
      page,
      includeDecided,
      search,
      sortBy,
      sortOrder,
      mutationSeq,
    ],
    queryFn: async () =>
      fetchApprovalQueue(await getToken(), {
        page,
        limit: PAGE_LIMIT,
        // Omitted entirely when the box is ticked: the API treats a missing
        // `status` as "every status", so nothing has to enumerate the four.
        status: includeDecided ? undefined : "pending",
        // `undefined`, never "": `buildQuery`-style clients drop the key
        // entirely, and a blank search must mean "no search" rather than
        // "match the empty string".
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: allowed,
  });

  const rows: QuotationApprovalQueueItem[] = data?.approvals ?? [];

  const handleStateChange = useCallback((state: SuperTableState) => {
    setPage(state.pagination.pageIndex + 1);
    setIncludeDecided(Boolean(state.filters?.include_decided));
    setSearch(state.globalFilter || "");
    const sort = state.sorting?.[0];
    setSortBy(sort?.id);
    setSortOrder(sort?.desc === false ? "asc" : "desc");
  }, []);

  const decide = (row: QuotationApprovalQueueItem, approved: boolean) => {
    setNote("");
    setDecisionTarget({ row, approved });
  };

  const handleConfirmDecision = async () => {
    if (!decisionTarget) return;
    const { row, approved } = decisionTarget;
    setIsDeciding(true);
    try {
      const token = await getToken();
      await decideQuotationApproval(token, row.quotation_id, approved, note);
      notify.success(
        approved
          ? `Quotation ${row.quotation_number} disetujui`
          : `Quotation ${row.quotation_number} ditolak`
      );
      setDecisionTarget(null);
      setNote("");
    } catch (error: any) {
      // `APPROVAL_ALREADY_DECIDED` is the common one: two approvers open the
      // queue and one of them is a few seconds later. It is a fact about the
      // world, not a fault - so the message is shown and the list is
      // refreshed either way, which is what removes the stale row.
      notify.error("Gagal memproses persetujuan", {
        description: mapQuotationException(error).message,
      });
      setDecisionTarget(null);
    } finally {
      setIsDeciding(false);
      setMutationSeq((n) => n + 1);
    }
  };

  const columns = useMemo<MRT_ColumnDef<QuotationApprovalQueueItem>[]>(
    () => [
      {
        accessorKey: "quotation_number",
        header: "Quotation",
        size: 170,
        Cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium text-[#5479EE] hover:underline"
            onClick={() => router.push(`/sales/quotation/${row.original.quotation_id}`)}
          >
            {row.original.quotation_number}
          </button>
        ),
      },
      {
        id: "customer_name",
        accessorFn: (row) => row.customer_name || "-",
        header: "Pelanggan",
        size: 200,
        // NOT in the server's sort allow-list, and `apply_sort` falls back
        // to the default order on an unknown key rather than answering 400
        // - so the arrow would look like it worked. No arrow instead.
        enableSorting: false,
      },
      {
        id: "grand_total",
        accessorFn: (row) => formatRupiah(row.grand_total),
        header: "Nilai",
        size: 140,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "requester_name",
        accessorFn: (row) => row.requester_name || "-",
        header: "Diajukan oleh",
        size: 170,
        // NOT in the server's sort allow-list, and `apply_sort` falls back
        // to the default order on an unknown key rather than answering 400
        // - so the arrow would look like it worked. No arrow instead.
        enableSorting: false,
      },
      {
        id: "requested_at",
        accessorFn: (row) => safeDateTime(row.requested_at),
        header: "Waktu pengajuan",
        size: 170,
      },
      {
        id: "trigger_reason",
        accessorFn: (row) => REASON_LABEL[row.trigger_reason] ?? row.trigger_reason,
        header: "Pemicu",
        size: 140,
        // NOT in the server's sort allow-list, and `apply_sort` falls back
        // to the default order on an unknown key rather than answering 400
        // - so the arrow would look like it worked. No arrow instead.
        enableSorting: false,
      },
      {
        id: "requested_max_percent",
        // "-" and not "0%": a null measure means the band did not fire, which
        // is a different fact from a zero discount.
        accessorFn: (row) =>
          row.requested_max_percent ? `${formatPercent(row.requested_max_percent)}%` : "-",
        header: "Diskon terburuk",
        size: 150,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "requested_min_margin_percent",
        accessorFn: (row) =>
          row.requested_min_margin_percent
            ? `${formatPercent(row.requested_min_margin_percent)}%`
            : "-",
        header: "Margin terendah",
        size: 150,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "status",
        accessorFn: (row) =>
          STATUS_OPTIONS.find((option) => option.value === row.status)?.label ?? row.status,
        header: "Status",
        size: 130,
        enableSorting: false,
        Cell: ({ row }) => {
          // A17: an approval the requester gave themselves must never wear the
          // plain green "Disetujui" chip - that chip claims a second pair of
          // eyes, which is exactly what the flag exists to stop implying.
          const selfApproved =
            row.original.status === "approved" && !!row.original.self_approved;
          return (
            <Chip
              label={
                selfApproved
                  ? "Disetujui sendiri"
                  : (STATUS_OPTIONS.find((option) => option.value === row.original.status)
                      ?.label ?? row.original.status)
              }
              color={selfApproved ? "warning" : (STATUS_COLOR[row.original.status] ?? "default")}
              size="small"
            />
          );
        },
      },
    ],
    [router]
  );

  if (!allowed) return <AccessDenied />;

  return (
    <div className="p-6">
      <PageHeader
        title="Persetujuan Quotation"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Quotation Builder", href: "/sales/quotation" },
          { label: "Persetujuan" },
        ]}
      />

      <div className="mb-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-4 text-sm">
        <p className="font-medium">
          Quotation masuk antrean ini saat diskonnya melewati ambang persetujuan, atau
          marginnya di bawah batas minimum.
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>
            Pengaju tidak bisa menyetujui pengajuannya sendiri - butuh pengguna lain yang punya
            hak &ldquo;quotations:approve&rdquo;. Bila workspace ini memang belum punya pengguna
            lain dengan hak tersebut, pengaju boleh memutuskan sendiri dan keputusannya
            tercatat sebagai &ldquo;disetujui sendiri&rdquo;.
          </li>
          <li>
            Disetujui berarti quotation berstatus Terkirim dan siap dikirim - pengiriman ke
            pelanggan tetap langkah terpisah.
          </li>
          <li>Ditolak berarti quotation kembali ke Draft agar pengaju memperbaikinya.</li>
        </ul>
      </div>

      <SuperTable<QuotationApprovalQueueItem>
        tableId="quotation-approvals-table"
        entityLabel="pengajuan"
        searchPlaceholder="Cari nomor quotation atau pelanggan"
        columns={columns}
        data={rows}
        getRowId={(row) => row.approval_id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Antrean persetujuan gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={typeof data?.total === "number" ? data.total : undefined}
        manualPagination
        manualFiltering
        manualSorting
        onStateChange={handleStateChange}
        resetPageKey={mutationSeq}
        filters={[
          {
            id: "include_decided",
            label: "Tampilkan yang sudah diputuskan",
            type: "boolean",
          },
        ]}
        rowActions={[
          {
            id: "approve",
            label: "Setujui",
            icon: <Check size={16} />,
            hidden: (row) => row.status !== "pending",
            // A string here becomes the readable reason under the label, so
            // "you cannot approve your own request" reaches keyboard and
            // screen-reader users too - not only a hover tooltip.
            disabled: (row) =>
              row.can_decide
                ? false
                : "Pengaju tidak bisa menyetujui pengajuannya sendiri selama ada pemegang hak lain",
            onClick: (row) => decide(row, true),
          },
          {
            id: "reject",
            label: "Tolak",
            icon: <X size={16} />,
            destructive: true,
            hidden: (row) => row.status !== "pending",
            disabled: (row) =>
              row.can_decide
                ? false
                : "Pengaju tidak bisa menolak pengajuannya sendiri selama ada pemegang hak lain",
            onClick: (row) => decide(row, false),
          },
        ]}
        renderEmptyState={({ hasActiveFilters, hasSearch }) => (
          <EmptyState
            icon={ShieldQuestion}
            title={
              hasActiveFilters || hasSearch
                ? "Tidak ada pengajuan yang cocok"
                : "Tidak ada pengajuan menunggu"
            }
            description="Quotation muncul di sini saat diskonnya melewati ambang persetujuan kebijakan diskon workspace."
          />
        )}
        features={{
          pagination: true,
          globalFilter: true,
          sorting: true,
          columnFilters: false,
          urlSync: true,
          rowSelection: "none",
        }}
      />

      <ConfirmationPopup
        isOpen={!!decisionTarget}
        onClose={() => setDecisionTarget(null)}
        onConfirm={handleConfirmDecision}
        title={decisionTarget?.approved ? "Setujui quotation" : "Tolak quotation"}
        description={
          decisionTarget?.approved
            ? `Setujui diskon pada quotation ${decisionTarget?.row.quotation_number ?? ""}? Statusnya menjadi Terkirim dan siap dikirim ke pelanggan.`
            : `Tolak quotation ${decisionTarget?.row.quotation_number ?? ""}? Quotation kembali ke Draft agar pengaju bisa memperbaikinya.`
        }
        confirmText={decisionTarget?.approved ? "Setujui" : "Tolak"}
        cancelText="Batal"
        variant={decisionTarget?.approved ? "info" : "warning"}
        isLoading={isDeciding}
      >
        {/* The record of WHY. `activity_logs` is append-only under
            trg_activity_logs_immutable on all three tiers, so this note can
            never be edited afterwards - only compensated by a further row. */}
        <AppTextarea
          isBgWhite
          label="Catatan keputusan (opsional)"
          rows={3}
          placeholder="Terbaca oleh pengaju, tersimpan bersama keputusan"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 1000))}
          inputProps={{ maxLength: 1000 }}
        />
      </ConfirmationPopup>
    </div>
  );
}
