"use client";

import React, { useMemo } from "react";
import { Avatar, Box } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { ManageUser } from "@/lib/types/manage-users";
import { DeleteButton, EditButton, ViewButton } from "@/components/ui/app-action-buttons-table";
import { AppButton } from "@/components/ui/app-button";

interface TableListUsersProps {
  users: ManageUser[];
  positionOptions?: string[];
  isLoading: boolean;
  isError?: boolean;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<ManageUser[]>;
  onEdit: (user: ManageUser) => void;
  onDelete: (user: ManageUser) => void;
  onView: (user: ManageUser) => void;
  onBulkDelete?: (users: ManageUser[], clearSelection: () => void) => Promise<void>;
  isBulkDeleting?: boolean;
  renderTopLeftToolbar?: () => React.ReactNode;
}

export default function TableListUsers({
  users,
  positionOptions = [],
  isLoading,
  isError,
  rowCount = 0,
  onStateChange,
  onExportRequest,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  isBulkDeleting,
  renderTopLeftToolbar,
}: TableListUsersProps) {
  const columns = useMemo<MRT_ColumnDef<ManageUser>[]>(() => [
    {
      id: "fullname",
      accessorFn: (row) => row.fullname,
      header: "User",
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar sx={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
              {user.fullname.charAt(0).toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{user.fullname}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "position",
      header: "Position",
      filterVariant: "select",
      filterSelectOptions: positionOptions,
      Cell: ({ cell }) => (
        <span className="capitalize">{cell.getValue<string>()}</span>
      )
    },
    {
      accessorKey: "employee_code",
      header: "Employee ID",
      enableColumnFilter: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      filterVariant: "select",
      filterSelectOptions: ["Active", "Pending"],
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return (
          <span
            className={`rounded-full px-3 py-1 text-xs capitalize ${
              val === "Active"
                ? "bg-green-100 text-green-700"
                : val === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {val}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
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
          <DeleteButton onClick={() => onDelete(row.original)} />
        </Box>
      ),
    },
  ], [onDelete, onEdit, onView]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }} className="super-table-container">
      <SuperTable<ManageUser>
        tableId="users-table"
        data={users}
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
          <AppButton
            variantStyle="danger"
            disabled={isBulkDeleting}
            onClick={() => {
              if (onBulkDelete) {
                onBulkDelete(selectedRows as ManageUser[], clearSelection);
              }
            }}
          >
            {isBulkDeleting 
              ? "Menghapus..." 
              : `Hapus ${selectedRows.length} User`}
          </AppButton>
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
