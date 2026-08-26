"use client";

import React, { useMemo } from "react";
import { Box, Chip, SxProps, Theme } from "@mui/material";
import { Building2 } from "lucide-react";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { CompanyIntelligenceItem } from "@/lib/types/company-intelligence";
import { INDUSTRY_OPTIONS, LOCATION_OPTIONS } from "@/lib/data/company-intelligence-options";
import { EmptyState } from "@/components/ui/empty-state";

// ── Chip Styling ──────────────────────────────────────────

const BASE_CHIP_STYLE: SxProps<Theme> = {
  fontSize: "12px",
  padding: "0px 8px",
  borderRadius: "9999px",
  fontWeight: 500,
  minWidth: "80px",
  justifyContent: "center",
};

type ChipColors = { backgroundColor: string; color: string };

const getDynamicChipStyle = (label: string): SxProps<Theme> => {
  if (!label) return BASE_CHIP_STYLE;

  const colors: ChipColors[] = [
    { backgroundColor: "#E8E4FF", color: "#6A5BF7" },
    { backgroundColor: "#FFE0E0", color: "#D94B4B" },
    { backgroundColor: "#FFF3D1", color: "#D0941F" },
    { backgroundColor: "#E2F8E8", color: "#1D8F4E" },
    { backgroundColor: "#DDF7FF", color: "#1C93B8" },
    { backgroundColor: "#FCE7F3", color: "#DB2777" },
    { backgroundColor: "#E0F2FE", color: "#0284C7" },
  ];

  // Special-case known statuses
  if (label.toLowerCase() === "success")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#E6F4EA", color: "#1E8E3E" };
  if (label.toLowerCase() === "failed")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#FCE8E6", color: "#C5221F" };
  if (label.toLowerCase() === "enriching")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#FFF7E0", color: "#D97706" };

  // Special-case confidence tiers, matching ConfidenceBadge's colors.
  if (label.toLowerCase() === "verified")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#E2F8E8", color: "#1D8F4E" };
  if (label.toLowerCase() === "high confidence")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#DDF7FF", color: "#1C93B8" };
  if (label.toLowerCase() === "medium confidence")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#FFF3D1", color: "#D0941F" };
  if (label.toLowerCase() === "low confidence")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#F3F4F6", color: "#6B7280" };
  if (label.toLowerCase() === "manually added")
    return { ...BASE_CHIP_STYLE, backgroundColor: "#E8E4FF", color: "#6A5BF7" };

  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;

  return { ...BASE_CHIP_STYLE, ...colors[index] };
};

const CONFIDENCE_TIER_LABELS: Record<string, string> = {
  verified: "Verified",
  high: "High Confidence",
  medium: "Medium Confidence",
  low: "Low Confidence",
  manual: "Manually Added",
};

// ── Props ─────────────────────────────────────────────────

interface CompanyTableProps {
  companies: CompanyIntelligenceItem[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: { label: string; onClick: () => void; icon?: React.ReactNode };
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<CompanyIntelligenceItem[]>;
  onRowClick?: (row: CompanyIntelligenceItem) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
  /** Distinct per table instance so SuperTable's urlSync/savedFilters
   * (namespaced "{tableId}_*") don't collide when Discover/Saved/Lists
   * each render their own CompanyTable within the same workspace page. */
  tableId?: string;
  /** Custom action buttons in the row's right-most column - callers decide
   * what "acting on a row" means here (Save to CRM on Discover, Delete on
   * Saved, Remove on a list) rather than this component assuming Delete. */
  renderRowActions?: (row: CompanyIntelligenceItem) => React.ReactNode;
  /** Passed straight through to SuperTable - same reasoning as
   * renderRowActions, generalized for bulk/selected-rows actions. */
  renderBulkActions?: (params: {
    selectedRows: CompanyIntelligenceItem[];
    clearSelection: () => void;
  }) => React.ReactNode;
  /** The Companies workspace (D2) drives Industry/Location filtering from
   * its own left-side facet rail, not SuperTable's per-column filter
   * popovers - set false there so the two filter UIs don't coexist. */
  enableColumnFilters?: boolean;
  /** 'none' hides the selection checkboxes/bulk-actions bar entirely -
   * used on the Lists tab, which has no bulk action to select rows for. */
  rowSelection?: "none" | "single" | "multi";
}

// ── Component ─────────────────────────────────────────────

export default function CompanyTable({
  companies,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onRowClick,
  renderTopLeftToolbar,
  tableId = "companies-table",
  renderRowActions,
  renderBulkActions,
  enableColumnFilters = true,
  rowSelection = "multi",
}: CompanyTableProps) {
  const columns = useMemo<MRT_ColumnDef<CompanyIntelligenceItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Company Name",
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FD] text-sm font-semibold text-[#6A5BF7]">
              {row.original.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{row.original.name}</span>
              <span className="text-xs text-gray-500">
                {row.original.domain || row.original.ticker || "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "industry",
        header: "Industry",
        enableColumnFilter: enableColumnFilters,
        filterVariant: "multi-select",
        filterSelectOptions: INDUSTRY_OPTIONS,
        Cell: ({ row }) => (
          <Chip
            label={row.original.industry || "N/A"}
            sx={getDynamicChipStyle(row.original.industry || "N/A")}
          />
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        enableColumnFilter: enableColumnFilters,
        filterVariant: "multi-select",
        filterSelectOptions: LOCATION_OPTIONS,
        Cell: ({ row }) => <>{row.original.location || "N/A"}</>,
      },
      {
        accessorKey: "employee_count",
        header: "Employees",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const val = row.original.employee_count;
          return (
            <>
              {typeof val === "string"
                ? val
                : val?.toLocaleString() || "-"}
            </>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status || row.financial_status || "N/A",
        header: "Status",
        filterVariant: "select",
        filterSelectOptions: [
          { value: "success", label: "Success" },
          { value: "failed", label: "Failed" },
          { value: "enriching", label: "Enriching" },
        ],
        Cell: ({ row }) => {
          const label = row.original.status || row.original.financial_status || "N/A";
          return <Chip label={label} sx={getDynamicChipStyle(label)} />;
        },
      },
      {
        id: "confidence_tier",
        accessorFn: (row) => row.confidence_tier || "",
        header: "Confidence",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const tier = row.original.confidence_tier;
          if (!tier || !CONFIDENCE_TIER_LABELS[tier]) return <>-</>;
          const label = CONFIDENCE_TIER_LABELS[tier];
          return <Chip label={label} sx={getDynamicChipStyle(label)} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableColumnFilter: false,
        enableSorting: false,
        size: 80,
        Cell: ({ row }) =>
          renderRowActions ? (
            <Box data-st-no-row-click>{renderRowActions(row.original)}</Box>
          ) : null,
      },
    ],
    [renderRowActions, enableColumnFilters]
  );

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<CompanyIntelligenceItem>
        tableId={tableId}
        data={companies}
        columns={columns}
        rowCount={rowCount}
        manualFiltering={true}
        manualPagination={true}
        manualSorting={true}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage ?? "Failed to load companies. Please try again."}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={Building2}
            title={emptyStateTitle ?? "No companies found"}
            description={emptyStateDescription ?? "Try adjusting your filters or search query."}
            action={emptyStateAction}
          />
        )}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
        renderTopLeftToolbar={renderTopLeftToolbar}
        renderBulkActions={renderBulkActions}
        initialState={{
          columnFilters: [],
        }}
        features={{
          pagination: true,
          globalFilter: true,
          columnFilters: enableColumnFilters,
          sorting: true,
          urlSync: true,
          rowSelection,
          export: { excel: true, csv: true },
          densityToggle: true,
          fullScreenToggle: true,
          facetedValues: false,
        }}
      />
    </Box>
  );
}
