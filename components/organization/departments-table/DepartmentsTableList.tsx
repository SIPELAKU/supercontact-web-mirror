"use client";

import React, { useMemo } from "react";
import { Avatar, Box } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { DepartmentsType } from "@/lib/types/Departments";
import { AppButton } from "@/components/ui/app-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";

interface DepartmentsTableListProps {
  departments: DepartmentsType[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onAdd?: () => void;
  rowCount?: number;
  branchOptions?: string[];
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<DepartmentsType[]>;
  onEdit: (department: DepartmentsType) => void;
  onDelete: (department: DepartmentsType) => void;
  onBulkDelete?: (departments: DepartmentsType[], clearSelection: () => void) => Promise<void>;
  isBulkDeleting?: boolean;
  renderTopLeftToolbar?: () => React.ReactNode;
}

export default function DepartmentsTableList({
  departments,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onAdd,
  rowCount = 0,
  branchOptions = [],
  onStateChange,
  onExportRequest,
  onEdit,
  onDelete,
  onBulkDelete,
  isBulkDeleting = false,
  renderTopLeftToolbar,
}: DepartmentsTableListProps) {
  const router = useRouter();

  const columns = useMemo<MRT_ColumnDef<DepartmentsType>[]>(() => [
    {
      accessorKey: "department",
      header: "Department",
      columnFilterModeOptions: undefined,
      Cell: ({ row }) => (
        <Link href={`/settings/organization/${row.original.id}`}>
          <span className="font-medium hover:underline">
            {row.original.department}
          </span>
        </Link>
      ),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      columnFilterModeOptions: undefined,
      Cell: ({ row }) => (
        <span className="text-gray-500">{row.original.branch}</span>
      ),
    },
    {
      id: "manager",
      accessorFn: (row) => row.manager?.fullname || "-",
      header: "Manager",
      enableColumnFilter: false,
      // Manager/member metadata is resolved in a separate post-query on
      // the backend - not sortable server-side, so no sort arrow.
      enableSorting: false,
      Cell: ({ row }) =>
        row.original.manager === null ? (
          <span>-</span>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar
              src={row.original.manager.avatar_url || undefined}
              sx={{ backgroundColor: "#dbeafe", color: "#2563eb", width: 32, height: 32 }}
            >
              {row.original.manager.avatar_initial}
            </Avatar>
            <span className="font-medium">
              {row.original.manager.fullname}
            </span>
          </div>
        ),
    },
    {
      accessorKey: "manager_code",
      header: "Manager ID",
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      accessorKey: "member_count",
      header: "Member Count",
      enableColumnFilter: false,
      enableSorting: false,
      muiTableBodyCellProps: { align: "center" },
      muiTableHeadCellProps: { align: "center" },
    },
  ], [branchOptions]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<DepartmentsType>
        tableId="departments-table"
        data={departments}
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
            icon={Building2}
            title="No departments found"
            description="Create departments to organize your team structure."
            action={
              onAdd
                ? { label: "Add Department", onClick: onAdd, icon: <Plus size={16} /> }
                : undefined
            }
          />
        )}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        onRowClick={(row) => router.push(`/settings/organization/${row.id}`)}
        rowActions={[
          {
            id: "edit",
            label: "Edit",
            icon: <Pencil size={16} />,
            onClick: (row) => onEdit(row),
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            destructive: true,
            onClick: (row) => onDelete(row),
          },
        ]}
        renderBulkActions={onBulkDelete ? ({ selectedRows, clearSelection }) => (
          <AppButton
            variantStyle="danger"
            disabled={isBulkDeleting}
            onClick={() => {
              onBulkDelete(
                selectedRows as DepartmentsType[],
                clearSelection
              );
            }}
          >
            {isBulkDeleting
              ? "Deleting..."
              : `Delete (${selectedRows.length})`}
          </AppButton>
        ) : undefined}
        entityLabel="departemen"
        searchPlaceholder="Cari departemen, cabang, atau manajer"
        filters={[
          {
            id: "department",
            label: "Departemen",
            type: "select",
            options: [
              "Marketing",
              "Sales",
              "Customer Support",
              "Human Resources",
            ].map((v) => ({ value: v, label: v })),
          },
          {
            id: "branch",
            label: "Cabang",
            type: "select",
            options: branchOptions.map((v: string) => ({ value: v, label: v })),
            anyLabel: "Semua cabang",
          },
        ]}
        features={{
          pagination: true,
          globalFilter: true,
          // (filters moved to the declarative `filters` prop)
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
