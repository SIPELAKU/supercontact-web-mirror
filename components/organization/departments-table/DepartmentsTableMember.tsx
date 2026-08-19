"use client";

import React, { useMemo } from "react";
import { Avatar, Box } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import { AppButton } from "@/components/ui/app-button";

interface FormattedMember {
  id: string;
  fullName: string;
  email: string;
  position: string;
  status: string;
  avatar_initial: string;
  id_employee: string;
  department_id: string;
}

interface DepartmentsTableMemberProps {
  members: FormattedMember[];
  isLoading: boolean;
  isError?: boolean;
  rowCount?: number;
  departmentId: string;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<FormattedMember[]>;
  onDelete: (departmentId: string, memberId: string) => void;
  onBulkDelete?: (members: FormattedMember[], clearSelection: () => void) => Promise<void>;
  isBulkDeleting?: boolean;
  renderTopLeftToolbar?: () => React.ReactNode;
}

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "active") return <span className="rounded-full px-3 py-1 text-xs capitalize bg-green-100 text-green-700">Active</span>;
  if (s === "pending") return <span className="rounded-full px-3 py-1 text-xs capitalize bg-yellow-100 text-yellow-700">Pending</span>;
  if (s === "inactive") return <span className="rounded-full px-3 py-1 text-xs capitalize bg-gray-100 text-gray-500">Inactive</span>;
  return <span className="rounded-full px-3 py-1 text-xs capitalize bg-gray-100 text-gray-500">{status}</span>;
};

export default function DepartmentsTableMember({
  members,
  isLoading,
  isError,
  rowCount = 0,
  departmentId,
  onStateChange,
  onExportRequest,
  onDelete,
  onBulkDelete,
  isBulkDeleting = false,
  renderTopLeftToolbar,
}: DepartmentsTableMemberProps) {
  const columns = useMemo<MRT_ColumnDef<FormattedMember>[]>(() => [
    {
      id: "user",
      accessorFn: (row) => row.fullName,
      header: "User",
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar sx={{ backgroundColor: "#dbeafe", color: "#2563eb", width: 32, height: 32 }}>
            {row.original.avatar_initial}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.fullName}</span>
            <span className="text-xs text-gray-500">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      filterVariant: "select",
      filterSelectOptions: [
        "Brand Manager", "Content Writer",
        "Customer Service", "Data Analyst",
        "Finance Manager", "HR Manager",
        "IT Support", "Marketing Manager",
        "Operations Manager", "Product Manager",
        "Sales Manager", "Software Engineer",
        "UI/UX Designer", "Business Development",
      ],
      columnFilterModeOptions: undefined,
      Cell: ({ row }) => (
        <span className="capitalize">{row.original.position}</span>
      ),
    },
    {
      accessorKey: "id_employee",
      header: "ID",
      enableColumnFilter: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      filterVariant: "select",
      filterSelectOptions: ["Active", "Pending", "Inactive"],
      columnFilterModeOptions: undefined,
      Cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Actions",
      enableColumnFilter: false,
      enableSorting: false,
      size: 80,
      Cell: ({ row }) => (
        <Box onClick={(e) => e.stopPropagation()}>
          <DeleteButton onClick={() => onDelete(departmentId, row.original.id)} />
        </Box>
      ),
    },
  ], [departmentId, onDelete]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<FormattedMember>
        tableId="department-members-table"
        data={members}
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
        renderBulkActions={onBulkDelete ? ({ selectedRows, clearSelection }) => (
          <AppButton
            variantStyle="danger"
            disabled={isBulkDeleting}
            onClick={() => {
              onBulkDelete(
                selectedRows as FormattedMember[],
                clearSelection
              );
            }}
          >
            {isBulkDeleting
              ? "Deleting..."
              : `Delete (${selectedRows.length})`}
          </AppButton>
        ) : undefined}
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
