"use client";

import React, { useMemo } from "react";
import { Box, Chip, Typography, Stack } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { BroadcastCampaign } from "@/lib/types/whatsapp-marketing";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Copy, Eye, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";

interface BroadcastingWATableProps {
  broadcasts: BroadcastCampaign[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onAdd?: () => void;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<BroadcastCampaign[]>;
  onEdit: (broadcast: BroadcastCampaign) => void;
  onDelete: (broadcast: BroadcastCampaign) => void;
  onView?: (broadcast: BroadcastCampaign) => void;
  onDuplicate?: (broadcast: BroadcastCampaign) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
  renderBulkActions?: (params: { selectedRows: BroadcastCampaign[]; clearSelection: () => void }) => React.ReactNode;
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
  errorMessage,
  onRetry,
  onAdd,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  renderTopLeftToolbar,
  renderBulkActions,
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
      header: "Created",
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Typography variant="caption">
          {row.original.created_at
            ? format(new Date(row.original.created_at), "dd MMM yyyy, HH:mm")
            : "-"}
        </Typography>
      ),
    },
  ], []);

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
        initialState={{ sorting: [{ id: "created_at", desc: true }] }}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={Megaphone}
            title="No broadcasts found"
            description="Create a WhatsApp broadcast to message your recipients."
            action={
              onAdd
                ? { label: "Create Broadcast", onClick: onAdd, icon: <Plus size={16} /> }
                : undefined
            }
          />
        )}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        renderBulkActions={renderBulkActions}
        onRowClick={(row) => onView?.(row)}
        rowActions={[
          {
            id: "view",
            label: "View",
            icon: <Eye size={16} />,
            hidden: () => !onView,
            onClick: (row) => onView?.(row),
          },
          {
            id: "duplicate",
            label: "Duplicate",
            icon: <Copy size={16} />,
            hidden: () => !onDuplicate,
            onClick: (row) => onDuplicate?.(row),
          },
          {
            id: "edit",
            label: "Edit",
            icon: <Pencil size={16} />,
            disabled: (row) =>
              row.status.toLowerCase() === "draft"
                ? false
                : "Only Draft broadcasts can be edited",
            onClick: (row) => onEdit(row),
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            destructive: true,
            disabled: (row) =>
              row.status.toLowerCase() === "draft"
                ? false
                : "Only Draft broadcasts can be deleted",
            onClick: (row) => onDelete(row),
          },
        ]}
        entityLabel="broadcast"
        searchPlaceholder="Cari nama broadcast"
        filters={[
          {
            id: "status",
            label: "Status",
            type: "select",
            options: ["Draft", "Sending", "Sent", "Failed"].map((v) => ({
              value: v,
              label: v,
            })),
          },
        ]}
        features={{
          pagination: true,
          globalFilter: true,
          // (filters moved to the declarative `filters` prop)
          sorting: true,
          urlSync: true,
          rowSelection: 'multi',
          export: { excel: true, csv: true },
          densityToggle: true,
        }}
      />
    </Box>
  );
}
