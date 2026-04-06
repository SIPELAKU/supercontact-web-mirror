"use client";

import React, { useMemo } from "react";
import { Box, Chip, Typography, Stack } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { BroadcastCampaign } from "@/lib/types/whatsapp-marketing";
import { DeleteButton, EditButton, ViewButton } from "@/components/ui/app-action-buttons-table";
import { format } from "date-fns";

interface BroadcastingWATableProps {
  broadcasts: BroadcastCampaign[];
  isLoading: boolean;
  isError?: boolean;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<BroadcastCampaign[]>;
  onEdit: (broadcast: BroadcastCampaign) => void;
  onDelete: (broadcast: BroadcastCampaign) => void;
  onView?: (broadcast: BroadcastCampaign) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
}

const getStatusChip = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'draft': return <Chip label="Draft" color="default" size="small" />;
    case 'sending': return <Chip label="Sending" color="primary" size="small" />;
    case 'sent':
    case 'done':
    case 'completed': return <Chip label="Sent" color="success" size="small" />;
    case 'failed': return <Chip label="Failed" color="error" size="small" />;
    default: return <Chip label={status} size="small" />;
  }
};

export default function BroadcastingWATable({
  broadcasts,
  isLoading,
  isError,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onEdit,
  onDelete,
  onView,
  renderTopLeftToolbar,
}: BroadcastingWATableProps) {
  const columns = useMemo<MRT_ColumnDef<BroadcastCampaign>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      header: "Broadcast Name",
      Cell: ({ row }) => (
        <Typography variant="body2" className="font-medium text-gray-900 truncate" sx={{ maxWidth: 200 }}>
          {row.original.name}
        </Typography>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      filterVariant: "select",
      filterSelectOptions: ['Draft', 'Sending', 'Sent', 'Failed'],
      Cell: ({ row }) => getStatusChip(row.original.status),
    },
    {
      id: "stats",
      header: "Delivery Stats",
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ row }) => {
        const { sent, delivered, read, failed } = row.original.stats || { sent: 0, delivered: 0, read: 0, failed: 0 };
        return (
          <Stack direction="row" spacing={1} sx={{ fontSize: '0.75rem' }}>
            <Box><span className="text-gray-500">S:</span> {sent}</Box>
            <Box><span className="text-blue-500">D:</span> {delivered}</Box>
            <Box><span className="text-green-500">R:</span> {read}</Box>
            <Box><span className="text-red-500">F:</span> {failed}</Box>
          </Stack>
        );
      },
    },
    {
      id: "total_target",
      accessorKey: "total_target",
      header: "Target",
      enableColumnFilter: false,
      Cell: ({ cell }) => cell.getValue<number>(),
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: "Created At",
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Typography variant="caption">
          {row.original.created_at
            ? format(new Date(row.original.created_at), "dd MMM yyyy, HH:mm")
            : "-"}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableColumnFilter: false,
      enableSorting: false,
      size: 120,
      muiTableBodyCellProps: { align: "right" },
      muiTableHeadCellProps: { align: "right" },
      Cell: ({ row }) => {
        const isDraft = row.original.status.toLowerCase() === 'draft';
        return (
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            {onView && <ViewButton onClick={() => onView(row.original)} />}
            <EditButton onClick={() => onEdit(row.original)} disabled={!isDraft} />
            <DeleteButton onClick={() => onDelete(row.original)} disabled={!isDraft} />
          </Box>
        );
      },
    },
  ], [onDelete, onEdit, onView]);

  return (
    <Box sx={{ width: "100%" }} className="super-table-container">
      <SuperTable<BroadcastCampaign>
        tableId="wa-broadcasts-table"
        data={broadcasts}
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
        features={{
          pagination: true,
          globalFilter: true,
          columnFilters: true,
          sorting: true,
          urlSync: true,
          rowSelection: "multi",
          export: { excel: true, csv: true },
          densityToggle: true,
        }}
      />
    </Box>
  );
}
