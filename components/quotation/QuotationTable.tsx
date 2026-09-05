"use client";

import React, { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Box, Chip } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { Quotation } from "@/lib/store/quotation";
import { formatRupiah } from "@/lib/helper/currency";
import {
  QUOTATION_STATUS_OPTIONS,
  canDecideQuotation,
  displayQuotationStatus,
  quotationEditBlockedReason,
} from "@/lib/constants/quotation-status";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Download, Eye, FileText, Pencil, Plus, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import QuotationPdfDocument from "@/components/quotation/QuotationPdfDocument";
import { fetchQuotationById } from "@/lib/api/quotations";
import { useAuth } from "@/lib/context/AuthContext";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { notify } from "@/lib/notifications";
import {
  downloadPdfBlob,
  generateQuotationPdf,
  quotationPdfFilename,
} from "@/lib/utils/quotationPdf";
import type { Quotation as StoredQuotation } from "@/lib/types/Quotation";

/** Distinct from the form's node id so both templates can coexist. */
const PDF_NODE_ID = "quotation-content-list";

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
  /** `sent -> accepted` / `sent -> rejected`; hidden on every other status. */
  onAccept?: (quotation: Quotation) => void;
  onReject?: (quotation: Quotation) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
}

/**
 * One chip for the list, the detail header and the read-only banner. A sent
 * quotation past its expiry reads "Kedaluwarsa" (display-only hint).
 */
export function QuotationStatusChip({
  status,
  expireDate,
}: {
  status: string | null | undefined;
  expireDate?: string | null;
}) {
  const meta = displayQuotationStatus(status, expireDate);
  return <Chip label={meta.label} color={meta.color} size="small" />;
}

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
  onAccept,
  onReject,
  renderTopLeftToolbar,
}: QuotationTableProps) {
  // "Unduh PDF" (spec I7.1). Without it the extracted template would be
  // unreachable for the 12 dev / 1 prod quotations already published - the
  // form only renders it on the publish path, for a quotation it just saved.
  const { getToken } = useAuth();
  const { definitions: productDefinitions } = useCustomFieldDefinitionsFor("product");
  const [pdfRow, setPdfRow] = useState<StoredQuotation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPdf = async (row: Quotation) => {
    if (!row?.id) return;
    setDownloadingId(row.id);
    try {
      const token = await getToken();
      // The list row is a summary; the template needs the LINES, the
      // snapshots and the Phase 3 briefs, so the stored row is re-read.
      const detail = await fetchQuotationById(token, row.id);
      const stored = detail.data as StoredQuotation;
      flushSync(() => setPdfRow(stored));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const node = document.getElementById(PDF_NODE_ID);
      if (!node) throw new Error("Template quotation tidak ditemukan");
      const filename = quotationPdfFilename(stored.quotation_number);
      const blob = await generateQuotationPdf(node, filename);
      downloadPdfBlob(blob, filename);
    } catch (error: any) {
      notify.error("Gagal membuat PDF", { description: error?.message });
    } finally {
      setDownloadingId(null);
      setPdfRow(null);
    }
  };

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
      // The export gets the readable label, the cell gets the chip.
      accessorFn: (row) => displayQuotationStatus(row.quotation_status, row.expire_date).label,
      header: "Status",
      columnFilterModeOptions: undefined, // Mencegah reduksi MRT options
      Cell: ({ row }) => (
        <QuotationStatusChip
          status={row.original.quotation_status}
          expireDate={row.original.expire_date}
        />
      ),
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
  ], []);

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
        // No row click here: this table's only way into a quotation is this
        // action - the [id] route renders the create form, not the record.
        rowActions={[
          {
            id: "view",
            label: "View",
            icon: <Eye size={16} />,
            onClick: (row) => onView(row),
          },
          {
            id: "edit",
            label: "Edit",
            icon: <Pencil size={16} />,
            // A string here is the readable reason (only drafts are editable).
            disabled: (row) => quotationEditBlockedReason(row.quotation_status) ?? false,
            onClick: (row) => onEdit(row),
          },
          {
            id: "accept",
            label: "Tandai diterima",
            icon: <ThumbsUp size={16} />,
            hidden: (row) => !onAccept || !canDecideQuotation(row.quotation_status),
            onClick: (row) => onAccept?.(row),
          },
          {
            id: "reject",
            label: "Tandai ditolak",
            icon: <ThumbsDown size={16} />,
            hidden: (row) => !onReject || !canDecideQuotation(row.quotation_status),
            onClick: (row) => onReject?.(row),
          },
          {
            id: "download-pdf",
            label: "Unduh PDF",
            icon: <Download size={16} />,
            // A draft has no published PDF, but it still has lines and totals
            // to print, so the action is offered for every row and only
            // blocked while one is being rendered.
            disabled: (row) =>
              downloadingId !== null && downloadingId !== row.id
                ? "PDF lain sedang dibuat"
                : false,
            onClick: (row) => {
              void handleDownloadPdf(row);
            },
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            destructive: true,
            hidden: () => !onDelete,
            onClick: (row) => onDelete?.(row),
          },
        ]}
        entityLabel="quotation"
        searchPlaceholder="Cari nomor quotation atau klien"
        // QuotationClient reads both of these ids out of `columnFilters`; the
        // date range keeps its `[from, to]` shape.
        filters={[
          {
            id: "quotation_status",
            label: "Status",
            type: "select",
            // The six canonical API values. The old "Rejected" option was a
            // spelling the server never knew and 422'd on; a bookmarked
            // legacy `Pending`/`Accepted` is normalised in QuotationClient.
            options: QUOTATION_STATUS_OPTIONS.map((s) => ({
              value: s.value,
              label: s.label,
            })),
          },
          {
            id: "expire_date",
            label: "Kedaluwarsa",
            type: "date-range",
          },
        ]}
        features={{
          pagination: true,
          globalFilter: true,
          // (filters moved to the declarative `filters` prop)
          sorting: true,
          urlSync: true,
          export: { excel: true, csv: true },
          densityToggle: true,
          fullScreenToggle: true,
        }}
      />

      {/* The same template the quotation form mounts, under its own node id so
          the two can never collide if both are on screen. It renders nothing
          until a row is being downloaded. */}
      <QuotationPdfDocument
        quotation={pdfRow}
        productDefinitions={productDefinitions}
        nodeId={PDF_NODE_ID}
      />
    </Box>
  );
}
