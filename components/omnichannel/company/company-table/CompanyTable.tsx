"use client";

import React, { useMemo } from "react";
import { Box, Chip, SxProps, Theme } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { CompanyIntelligenceItem } from "@/lib/types/company-intelligence";
import { INDUSTRY_OPTIONS, LOCATION_OPTIONS } from "@/lib/data/company-intelligence-options";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import { AppButton } from "@/components/ui/app-button";

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
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<CompanyIntelligenceItem[]>;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[], clearSelection: () => void) => void;
  onRowClick?: (row: CompanyIntelligenceItem) => void;
  renderTopLeftToolbar?: () => React.ReactNode;
}

// ── Component ─────────────────────────────────────────────

export default function CompanyTable({
  companies,
  isLoading,
  isError,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onDelete,
  onBulkDelete,
  onRowClick,
  renderTopLeftToolbar,
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
        Cell: ({ row }) => (
          <Box onClick={(e) => e.stopPropagation()}>
            <DeleteButton onClick={() => onDelete?.(row.original.id)} />
          </Box>
        ),
      },
    ],
    [onDelete]
  );

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<CompanyIntelligenceItem>
        tableId="companies-table"
        data={companies}
        columns={columns}
        rowCount={rowCount}
        manualFiltering={true}
        manualPagination={true}
        manualSorting={true}
        isLoading={isLoading}
        isError={isError}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
        renderTopLeftToolbar={renderTopLeftToolbar}
        renderBulkActions={
          onBulkDelete
            ? ({ selectedRows, clearSelection }) => (
                <AppButton
                  variantStyle="danger"
                  onClick={() =>
                    onBulkDelete(
                      selectedRows.map(
                        (r) => (r as CompanyIntelligenceItem).id
                      ),
                      clearSelection
                    )
                  }
                >
                  {`Delete (${selectedRows.length})`}
                </AppButton>
              )
            : undefined
        }
        initialState={{
          columnFilters: [],
        }}
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
          facetedValues: false,
        }}
      />
    </Box>
  );
}
