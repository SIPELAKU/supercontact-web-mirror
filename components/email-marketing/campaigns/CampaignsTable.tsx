"use client";

import React, { useMemo } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { Campaign } from "@/lib/types/email-marketing";
import {
  DeleteButton,
  EditButton,
  ViewButton,
  DuplicateButton,
  ResendButton,
  StopButton,
} from "@/components/ui/app-action-buttons-table";
import { AppButton } from "@/components/ui/app-button";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Copy, Mail, Plus, Trash2 } from "lucide-react";
import {
  campaignDeleteBlockedReason,
  campaignEditBlockedReason,
  campaignStatusChipColor,
  canDeleteCampaign,
  canEditCampaign,
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
      {
        id: "total_target",
        accessorKey: "total_target",
        header: "Recipients",
        enableSorting: false,
        size: 110,
        Cell: ({ row }) => (row.original.total_target ?? 0).toLocaleString(),
      },
      // The list response has carried delivered/opened/clicked/bounced on every
      // row all along; you previously had to open a modal per campaign to see
      // any of it, while the mailing-list detail tab showed the same numbers as
      // columns.
      {
        id: "delivered",
        header: "Delivered",
        enableSorting: false,
        size: 110,
        Cell: ({ row }) => (row.original.stats?.delivered ?? 0).toLocaleString(),
      },
      {
        id: "opened",
        header: "Opened",
        enableSorting: false,
        size: 100,
        Cell: ({ row }) => (row.original.stats?.opened ?? 0).toLocaleString(),
      },
      {
        id: "open_rate",
        header: "Open Rate",
        enableSorting: false,
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
        // Creator comes from the joined User (selectinload, not a join) -
        // the backend can't sort by it, so don't offer a lying sort arrow.
        enableSorting: false,
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
      renderEmptyState={() => (
        <EmptyState
          icon={Mail}
          title="No campaigns found"
          description="Create an email campaign to reach your subscribers."
          action={
            onAdd ? { label: "Add Campaign", onClick: onAdd, icon: <Plus size={16} /> } : undefined
          }
        />
      )}
      onStateChange={onStateChange}
      onExportRequest={onExportRequest}
      resetPageKey={resetPageKey}
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
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
      renderRowActions={({ row }) => {
        const campaign = row.original;
        const editable = canEditCampaign(campaign.status);
        const deletable = canDeleteCampaign(campaign.status);

        return (
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            {onView && <ViewButton onClick={() => onView(campaign)} />}
            {canStopCampaign(campaign.status) && onStop && (
              <StopButton
                onClick={() => onStop(campaign)}
                isLoading={stoppingCampaignId === campaign.id}
                customTitle="Stop sending"
              />
            )}
            {canResendCampaign(campaign.status) && onResend && (
              <ResendButton
                onClick={() => onResend(campaign)}
                isLoading={resendingCampaignId === campaign.id}
                customTitle="Resend"
              />
            )}
            <EditButton
              onClick={() => onEdit(campaign)}
              disabled={!editable}
              customTitle={editable ? "Edit" : campaignEditBlockedReason(campaign.status)}
            />
            {onDuplicate && (
              <DuplicateButton onClick={() => onDuplicate(campaign)} customTitle="Duplicate" />
            )}
            <DeleteButton
              onClick={() => onDelete(campaign)}
              disabled={!deletable}
              customTitle={deletable ? "Delete" : campaignDeleteBlockedReason(campaign.status)}
            />
          </Box>
        );
      }}
      features={{
        pagination: true,
        globalFilter: true,
        globalFilterAlwaysVisible: true,
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
