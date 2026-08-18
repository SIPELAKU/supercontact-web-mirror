"use client";

import React, { useMemo } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { Campaign } from "@/lib/types/email-marketing";
import { DeleteButton, EditButton, ViewButton, DuplicateButton, ResendButton } from "@/components/ui/app-action-buttons-table";
import { AppButton } from "@/components/ui/app-button";
import { format } from "date-fns";

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  isError?: boolean;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<Campaign[]>;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onView?: (campaign: Campaign) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
  onBulkDelete?: (campaigns: Campaign[], clearSelection: () => void) => Promise<void>;
  onBulkDuplicate?: (campaigns: Campaign[], clearSelection: () => void) => Promise<void>;
  isBulkDeleting?: boolean;
  isBulkDuplicating?: boolean;
  onDuplicate?: (campaign: Campaign) => void;
  onResend?: (campaign: Campaign) => void;
  resendingCampaignId?: string | null;
}

const getStatusChip = (status: string, failureReason?: string | null) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'draft': return <Chip label="Draft" color="default" size="small" />;
    case 'in_queue':
    case 'queued': return <Chip label="In Queue" color="info" size="small" />;
    case 'sending': return <Chip label="Sending" color="primary" size="small" />;
    case 'sent':
    case 'done': return <Chip label="Sent" color="success" size="small" />;
    case 'canceled':
    case 'cancelled': return <Chip label="Canceled" color="error" size="small" />;
    case 'failed': {
      const chip = <Chip label="Failed" color="error" size="small" />;
      return failureReason ? (
        <Tooltip title={failureReason} arrow>
          <span>{chip}</span>
        </Tooltip>
      ) : (
        chip
      );
    }
    default: return <Chip label={status} size="small" />;
  }
};

export default function CampaignsTable({
  campaigns,
  isLoading,
  isError,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onEdit,
  onDelete,
  onView,
  renderTopLeftToolbar,
  onBulkDelete,
  onBulkDuplicate,
  isBulkDeleting,
  isBulkDuplicating,
  onDuplicate,
  onResend,
  resendingCampaignId,
}: CampaignsTableProps) {
  const columns = useMemo<MRT_ColumnDef<Campaign>[]>(() => [
    {
      id: "subject",
      accessorKey: "subject",
      header: "Subject",
      enableColumnFilter: false,
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
      filterVariant: "select",
      filterSelectOptions: ['Draft', 'In Queue', 'Sending', 'Sent', 'Canceled'],
      enableSorting: false,
      Cell: ({ row }) => getStatusChip(row.original.status, row.original.failure_reason),
    },
    {
      id: "sent_at",
      accessorKey: "sent_at",
      header: "Sent Date",
      enableColumnFilter: false,
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
      enableColumnFilter: false,
      // Creator comes from the joined User (selectinload, not a join) -
      // the backend can't sort by it, so don't offer a lying sort arrow.
      enableSorting: false,
      Cell: ({ row }) => <span>{row.original.user_fullname || 'N/A'}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      enableColumnFilter: false,
      enableSorting: false,
      size: 150,
      muiTableBodyCellProps: {
        align: "right",
      },
      muiTableHeadCellProps: {
        align: "right",
      },
      Cell: ({ row }) => {
        const canEditOrDelete =
          row.original.status.toLowerCase() === 'draft' ||
          row.original.status.toLowerCase() === 'in_queue' ||
          row.original.status.toLowerCase() === 'queued';
        const isFailed = row.original.status.toLowerCase() === 'failed';

        return (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {onView && <ViewButton onClick={() => onView(row.original)} />}
            {isFailed && onResend && (
              <ResendButton
                onClick={() => onResend(row.original)}
                isLoading={resendingCampaignId === row.original.id}
                customTitle="Resend"
              />
            )}
            <EditButton
              onClick={() => onEdit(row.original)}
              disabled={!canEditOrDelete}
              customTitle={canEditOrDelete ? "Edit" : "Can only edit Draft/In Queue"}
            />
            {onDuplicate && (
              <DuplicateButton
                onClick={() => onDuplicate(row.original)}
                customTitle="Duplicate"
              />
            )}
            <DeleteButton
              onClick={() => onDelete(row.original)}
              disabled={!canEditOrDelete}
              customTitle={canEditOrDelete ? "Delete" : "Can only delete Draft/In Queue"}
            />
          </Box>
        );
      },
    },
  ], [onDelete, onEdit, onView, onDuplicate, onResend, resendingCampaignId]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<Campaign>
        tableId="campaigns-table"
        data={campaigns}
        columns={columns}
        rowCount={rowCount}
        manualFiltering={true}
        manualPagination={true}
        manualSorting={true}
        isLoading={isLoading}
        isError={isError}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <AppButton
              variantStyle="primary"
              disabled={isBulkDuplicating}
              onClick={() => {
                if (onBulkDuplicate) {
                  onBulkDuplicate(selectedRows as Campaign[], clearSelection);
                }
              }}
            >
              {isBulkDuplicating
                ? "Duplicating..."
                : `Duplicate ${selectedRows.length} Campaigns`}
            </AppButton>
            <AppButton
              variantStyle="danger"
              disabled={isBulkDeleting}
              onClick={() => {
                if (onBulkDelete) {
                  onBulkDelete(selectedRows as Campaign[], clearSelection);
                }
              }}
            >
              {isBulkDeleting
                ? "Deleting..."
                : `Delete ${selectedRows.length} Campaigns`}
            </AppButton>
          </Box>
        )}
        features={{
          pagination: true,
          globalFilter: true,
          columnFilters: true,
          sorting: true,
          urlSync: true,
          rowSelection: "multi",
          export: { excel: true, csv: true },
          densityToggle: true,
          fullScreenToggle: true,
        }}
      />
    </Box>
  );
}
