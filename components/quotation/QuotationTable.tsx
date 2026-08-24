"use client";

import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { Quotation } from "@/lib/store/quotation";
import { DeleteButton, EditButton, ViewButton } from "@/components/ui/app-action-buttons-table";
import { formatRupiah } from "@/lib/helper/currency";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus } from "lucide-react";

interface QuotationTableProps {
  quotations: Quotation[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onAdd?: () => void;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<Quotation[]>;
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onDelete?: (quotation: Quotation) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
}

const getStatusChip = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'accepted': return <Chip label="Accepted" color="success" size="small" />;
    case 'pending': return <Chip label="Pending" color="warning" size="small" />;
    case 'rejected': return <Chip label="Rejected" color="error" size="small" />;
    default: return <Chip label={status} size="small" />;
  }
};

export default function QuotationTable({
  quotations,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onAdd,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onView,
  onEdit,
  onDelete,
  renderTopLeftToolbar,
}: QuotationTableProps) {
  const columns = useMemo<MRT_ColumnDef<Quotation>[]>(() => [
    {
      id: "client",
      accessorFn: (row) => row.lead?.contact?.name || '-',
      header: "Client",
      enableColumnFilter: false,
    },
    {
      id: "quotation_number",
      accessorKey: "quotation_number",
      header: "Quotation ID",
      enableColumnFilter: false,
    },
    {
      id: "expire_date",
      accessorKey: "expire_date",
      header: "Date",
      enableColumnFilter: true,
      filterVariant: "date-range",
      Cell: ({ row }) => (
        <span>
          {row.original.expire_date 
            ? format(new Date(row.original.expire_date), "dd MMM yyyy") 
            : "-"}
        </span>
      ),
    },
    {
      id: "quotation_status",
      accessorKey: "quotation_status",
      header: "Status",
      filterVariant: "select",
      filterSelectOptions: ['Accepted', 'Pending', 'Rejected'],
      columnFilterModeOptions: undefined, // Mencegah reduksi MRT options
      Cell: ({ row }) => getStatusChip(row.original.quotation_status),
    },
    {
      id: "grand_total",
      accessorFn: (row) => formatRupiah(row.grand_total),
      header: "Amount",
      enableColumnFilter: false,
      Cell: ({ cell }) => (
        <span className="font-medium text-right block">
          {cell.getValue<string>()}
        </span>
      ),
      muiTableBodyCellProps: {
        align: "right",
      },
      muiTableHeadCellProps: {
        align: "right",
      },
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
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <ViewButton onClick={() => onView(row.original)} />
          <EditButton onClick={() => onEdit(row.original)} />
          {onDelete && <DeleteButton onClick={() => onDelete(row.original)} />}
        </Box>
      ),
    },
  ], [onView, onEdit, onDelete]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<Quotation>
        tableId="quotations-table"
        data={quotations}
        columns={columns}
        rowCount={rowCount}
        manualFiltering={true}
        manualPagination={true}
        manualSorting={true}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={FileText}
            title="No quotations found"
            description="Create a quotation to send pricing to your clients."
            action={
              onAdd
                ? { label: "Create Quotation", onClick: onAdd, icon: <Plus size={16} /> }
                : undefined
            }
          />
        )}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        features={{
          pagination: true,
          globalFilter: true,
          columnFilters: true,
          sorting: true,
          urlSync: true,
          export: { excel: true, csv: true },
          densityToggle: true,
          fullScreenToggle: true,
        }}
      />
    </Box>
  );
}
