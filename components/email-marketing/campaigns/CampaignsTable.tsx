"use client";

import React, { useMemo } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { Campaign } from "@/lib/types/email-marketing";
import { AppButton } from "@/components/ui/app-button";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { CircleStop, Copy, Mail, Pencil, Plus, RotateCw, Trash2 } from "lucide-react";
import {
  CAMPAIGN_STATUS_OPTIONS,
  campaignDeleteBlockedReason,
  campaignEditBlockedReason,
  campaignStatusChipColor,
  canResendCampaign,
  canStopCampaign,
} from "@/lib/constants/campaign-status";

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onAdd?: () => void;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<Campaign[]>;
  /** Bumped by the page when the status filter changes. */
  resetPageKey?: string | number;
  /** Filter controls rendered inside the table toolbar, left of any actions. */
  renderFilters?: () => React.ReactNode;
  /** Active filter in words, e.g. "Draft" — used by the empty state. */
  activeFilterSummary?: string;
  /** Active search term — the empty state has to account for it too. */
  activeSearch?: string;
  /** Offered from the empty state when a filter matched nothing. */
  onClearFilters?: () => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onView?: (campaign: Campaign) => void;
  onBulkDelete?: (campaigns: Campaign[], clearSelection: () => void) => void;
  onBulkDuplicate?: (campaigns: Campaign[], clearSelection: () => void) => void;
  isBulkDeleting?: boolean;
  isBulkDuplicating?: boolean;
  onDuplicate?: (campaign: Campaign) => void;
  onResend?: (campaign: Campaign) => void;
  onStop?: (campaign: Campaign) => void;
  resendingCampaignId?: string | null;
  stoppingCampaignId?: string | null;
}

const getStatusChip = (status: string, failureReason?: string | null) => {
  // Colour and label both come from the shared enum map. The old switch
  // matched 'in_queue' / 'queued' / 'sending' / 'canceled' / 'done' — none of
  // which the API ever returns — so In Queue, Processing and Stopped all fell
  // through to a plain grey chip.
  const chip = (
    <Chip label={status} color={campaignStatusChipColor(status)} size="small" />
  );
  return failureReason ? (
    <Tooltip title={failureReason} arrow>
      <span>{chip}</span>
    </Tooltip>
  ) : (
    chip
  );
};

const percent = (part: number, whole: number) =>
  whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "—";

export default function CampaignsTable({
  campaigns,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onRetry,
  onAdd,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  resetPageKey,
  renderFilters,
  activeFilterSummary,
  activeSearch,
  onClearFilters,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  onBulkDuplicate,
  isBulkDeleting,
  isBulkDuplicating,
  onDuplicate,
  onResend,
  onStop,
  resendingCampaignId,
  stoppingCampaignId,
}: CampaignsTableProps) {
  const columns = useMemo<MRT_ColumnDef<Campaign>[]>(
    () => [
      {
        id: "subject",
        accessorKey: "subject",
        header: "Subject",
        Cell: ({ row }) => (
          <span
            className="font-medium text-gray-900 inline-block max-w-50 sm:max-w-75 truncate"
            title={row.original.subject}
          >
            {row.original.subject}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        // Filtering happens through the page's filter bar (which the API now
        // honours), not through a column filter.
        enableColumnFilter: false,
        Cell: ({ row }) => getStatusChip(row.original.status, row.original.failure_reason),
      },
      // Every column id below is a sort key the API honours (see
      // SORTABLE_COLUMNS / DERIVED_SORT_KEYS in campaign_repository.py).
      // Recipients is a stored column; Delivered / Opened / Open Rate are
      // aggregated from email_logs by the SAME timestamp-presence rule these
      // cells display, so the arrow can never sort by one number while the
      // column shows another. Campaigns with no delivery data sort to the
      // bottom in BOTH directions - they have no open rate, rather than one
      // of zero.
      {
        id: "total_target",
        accessorKey: "total_target",
        header: "Recipients",
        size: 110,
        Cell: ({ row }) => (row.original.total_target ?? 0).toLocaleString(),
      },
      // The list response has carried delivered/opened/clicked/bounced on every
      // row all along; you previously had to open a modal per campaign to see
      // any of it, while the mailing-list detail tab showed the same numbers as
      // columns.
      // These three need an `accessorFn`, not just an `id`. TanStack ends
      // `getCanSort()` with `&& !!column.accessorFn` (table-core
      // RowSorting.js:178), so a column defined with id + Cell alone renders
      // no sort arrow however `enableSorting` is set. The value it returns is
      // also what the spreadsheet export writes, which is otherwise blank for
      // any column without an accessor.
      {
        id: "delivered",
        header: "Delivered",
        accessorFn: (row) => row.stats?.delivered ?? 0,
        size: 110,
        Cell: ({ row }) => (row.original.stats?.delivered ?? 0).toLocaleString(),
      },
      {
        id: "opened",
        header: "Opened",
        accessorFn: (row) => row.stats?.opened ?? 0,
        size: 100,
        Cell: ({ row }) => (row.original.stats?.opened ?? 0).toLocaleString(),
      },
      {
        id: "open_rate",
        header: "Open Rate",
        // A number, not "25.0%", so the exported column stays computable in a
        // spreadsheet. `null` when nothing was delivered: no rate, not zero.
        accessorFn: (row) => {
          const delivered = row.stats?.delivered ?? 0;
          if (!delivered) return null;
          return Number((((row.stats?.opened ?? 0) / delivered) * 100).toFixed(1));
        },
        size: 110,
        Cell: ({ row }) =>
          percent(row.original.stats?.opened ?? 0, row.original.stats?.delivered ?? 0),
      },
      {
        id: "sent_at",
        accessorKey: "sent_at",
        header: "Sent",
        Cell: ({ row }) => (
          <span>
            {row.original.sent_at
              ? format(new Date(row.original.sent_at), "dd MMM yyyy, HH:mm")
              : "-"}
          </span>
        ),
      },
      {
        id: "user_fullname",
        accessorKey: "user_fullname",
        header: "Created By",
        // The author used to arrive via selectinload only, which is a separate
        // query and cannot be ordered on; the repository now joins users when
        // this key is requested, so the arrow is real.
        Cell: ({ row }) => <span>{row.original.user_fullname || "N/A"}</span>,
      },
    ],
    []
  );

  return (
    <SuperTable<Campaign>
      tableId="campaigns-table"
      urlKey=""
      exportFileName="Campaigns"
      data={campaigns}
      columns={columns}
      rowCount={rowCount}
      getRowId={(row) => row.id}
      manualFiltering={true}
      manualPagination={true}
      manualSorting={true}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      errorMessage={errorMessage}
      onRetry={onRetry}
      // A filtered-to-zero table used to read as "you have no campaigns",
      // which is a different and much more alarming statement.
      //
      // Two things this has to get right. First, while a refetch is in flight
      // the rows on screen belong to the PREVIOUS query (keepPreviousData), so
      // pairing them with the new filter's name would state something false
      // like "No Stopped campaigns" about a set that was never queried. Say
      // nothing until the answer is in. Second, the search box filters this
      // list too, so clearing the status filter while a search is still active
      // must not fall through to "you have no campaigns".
      renderEmptyState={({ clearFilters, hasActiveFilters, hasSearch }) =>
        isFetching ? (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            Loading campaigns…
          </Box>
        ) : hasActiveFilters || hasSearch ? (
          <EmptyState
            icon={Mail}
            title={
              activeFilterSummary && !hasSearch
                ? `No ${activeFilterSummary} campaigns`
                : "No matching campaigns"
            }
            description={
              activeSearch && activeFilterSummary
                ? `No campaign matches "${activeSearch}" with status ${activeFilterSummary}.`
                : activeSearch
                  ? `No campaign matches "${activeSearch}".`
                  : "No campaign matches the filter you have applied."
            }
            // Clears SuperTable's own filter state, which is where the value
            // now lives - so the chip in the toolbar disappears with it.
            action={
              hasActiveFilters
                ? {
                    label: "Clear filter",
                    onClick: () => {
                      clearFilters();
                      onClearFilters?.();
                    },
                  }
                : undefined
            }
          />
        ) : (
          <EmptyState
            icon={Mail}
            title="No campaigns found"
            description="Create an email campaign to reach your subscribers."
            action={
              onAdd ? { label: "Add Campaign", onClick: onAdd, icon: <Plus size={16} /> } : undefined
            }
          />
        )
      }
      onStateChange={onStateChange}
      onExportRequest={onExportRequest}
      resetPageKey={resetPageKey}
      entityLabel="kampanye"
      searchPlaceholder="Cari nama kampanye atau subjek"
      // Declared here rather than passed in from the page: the options come
      // straight from the API's CampaignStatus enum, so they belong to the
      // table, and the value now rides SuperTable's own filter state instead
      // of a hand-managed `?status=` param the page had to keep in sync with
      // `?p=` by itself.
      filters={[
        {
          id: "status",
          label: "Status",
          type: "select",
          anyLabel: "Semua status",
          options: CAMPAIGN_STATUS_OPTIONS.map((v) => ({ value: v, label: v })),
        },
      ]}
      renderBulkActions={({ selectedRows, clearSelection }) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <AppButton
            variantStyle="outline"
            startIcon={<Copy size={16} />}
            disabled={isBulkDuplicating}
            onClick={() => onBulkDuplicate?.(selectedRows as Campaign[], clearSelection)}
          >
            {isBulkDuplicating ? "Duplicating…" : `Duplicate (${selectedRows.length})`}
          </AppButton>
          <AppButton
            variantStyle="danger"
            startIcon={<Trash2 size={16} />}
            disabled={isBulkDeleting}
            onClick={() => onBulkDelete?.(selectedRows as Campaign[], clearSelection)}
          >
            {isBulkDeleting ? "Deleting…" : `Delete (${selectedRows.length})`}
          </AppButton>
        </Box>
      )}
      // The subject is the way into the record - a real link, so middle-click
      // and Cmd-click work and the accessible name is the campaign's own
      // subject. That link replaces the old View icon entirely.
      primaryColumn={{
        accessorKey: "subject",
        href: (row) => `/email-marketing/campaigns/${row.id}`,
      }}
      onRowClick={(row) => onView?.(row)}
      rowActions={(campaign) => [
        {
          id: "stop",
          label: "Stop sending",
          icon: <CircleStop size={16} />,
          hidden: () => !onStop || !canStopCampaign(campaign.status),
          isLoading: () => stoppingCampaignId === campaign.id,
          onClick: (row) => onStop?.(row),
        },
        {
          id: "resend",
          label: "Resend",
          icon: <RotateCw size={16} />,
          hidden: () => !onResend || !canResendCampaign(campaign.status),
          isLoading: () => resendingCampaignId === campaign.id,
          onClick: (row) => onResend?.(row),
        },
        {
          id: "edit",
          label: "Edit",
          icon: <Pencil size={16} />,
          // A string here becomes readable text under the label, instead of a
          // tooltip on a disabled button nobody can focus.
          disabled: (row) => campaignEditBlockedReason(row.status) ?? false,
          onClick: (row) => onEdit(row),
        },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Copy size={16} />,
          hidden: () => !onDuplicate,
          onClick: (row) => onDuplicate?.(row),
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Trash2 size={16} />,
          destructive: true,
          disabled: (row) => campaignDeleteBlockedReason(row.status) ?? false,
          onClick: (row) => onDelete(row),
        },
      ]}
      features={{
        pagination: true,
        globalFilter: true,
        columnFilters: false,
        sorting: true,
        urlSync: true,
        rowSelection: "multi",
        columnVisibility: true,
        export: { excel: true, csv: true },
        densityToggle: true,
        fullScreenToggle: true,
      }}
    />
  );
}
