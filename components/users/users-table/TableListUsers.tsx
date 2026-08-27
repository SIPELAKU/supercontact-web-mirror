"use client";

import React, { useMemo } from "react";
import { Avatar, Box } from "@mui/material";
import { SuperTable, MRT_ColumnDef, SuperTableState } from "@/components/ui/super-table";
import { ManageUser } from "@/lib/types/manage-users";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserRound, Pencil, Plus, Trash2 } from "lucide-react";

interface TableListUsersProps {
  users: ManageUser[];
  positionOptions?: string[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onAdd?: () => void;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: any) => Promise<ManageUser[]>;
  onEdit: (user: ManageUser) => void;
  onDelete: (user: ManageUser) => void;
  onBulkDelete?: (users: ManageUser[], clearSelection: () => void) => Promise<void>;
  isBulkDeleting?: boolean;
  renderTopLeftToolbar?: () => React.ReactNode;
}

export default function TableListUsers({
  users,
  positionOptions = [],
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
  ], [positionOptions]);

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
        errorMessage={errorMessage}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={UserRound}
            title="No users found"
            description="Invite teammates to collaborate in this workspace."
            action={
              onAdd
                ? { label: "Add User", onClick: onAdd, icon: <Plus size={16} /> }
                : undefined
            }
          />
        )}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        onRowClick={(row) => onEdit(row)}
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
              ? "Deleting..."
              : `Delete (${selectedRows.length})`}
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
