"use client";

import { RoleType } from "@/lib/types/Role";
import { Chip, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import React from 'react';
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';
import { MRT_TableInstance } from '@/components/ui/super-table';
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useAuth } from "@/lib/context/AuthContext";
import useRoles from "@/lib/hooks/useRoles";
import { notify } from "@/lib/notifications";
import { Pencil, ShieldCheck, Trash2 } from "lucide-react";

// Was mounted per row by EditPermissionsButton; one instance now serves the
// row action for whichever role is selected.
const EditPermissionsDialog = dynamic(
  () => import("../roles-modal/EditPermissionsModal"),
  { ssr: false },
);

// The three seeded roles the API refuses to change - same list the old
// Edit/Delete buttons gated on.
const DEFAULT_ROLE_NAMES = ["Staff", "Manager", "Admin"];
const isDefaultRole = (roleName: string) => DEFAULT_ROLE_NAMES.includes(roleName);

interface RolesTableProps {
  roles: RoleType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  rowCount?: number;
  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: {
    format: "csv" | "excel";
    currentState: SuperTableState;
  }) => Promise<RoleType[]> | RoleType[] | void;
  renderTopLeftToolbar?: (table: MRT_TableInstance<RoleType>) => React.ReactNode;
}

const formatPermissionLabel = (permission: string) => {
  return permission
    .split(/[:_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const BASE_CHIP_STYLE: SxProps<Theme> = {
  fontSize: "12px",
  padding: "0px 0px",
  borderRadius: "12px",
  fontWeight: 500,
};

const PERMISSION_CHIP_STYLE: SxProps<Theme> = {
  fontSize: "11px",
  height: "24px",
  backgroundColor: "#F4F7FE",
  color: "#4D5E80",
  border: "1px solid #E2E8F0",
  "& .MuiChip-label": {
    paddingLeft: "8px",
    paddingRight: "8px",
  },
};

const ROLE_COLOR_STYLE: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  Administrator: { backgroundColor: "#E8E4FF", color: "#6A5BF7" },
  Manager: { backgroundColor: "#FFE9C7", color: "#D0941F" },
  Support: { backgroundColor: "#DDF7FF", color: "#2BA8C8" },
  "Restricted User": { backgroundColor: "#FFE0E0", color: "#E45353" },
  Default: { backgroundColor: "#F1F1F1", color: "#666666" },
};

const getChipStyle = (role: string) => ({
  ...BASE_CHIP_STYLE,
  ...(ROLE_COLOR_STYLE[role] || ROLE_COLOR_STYLE.Default),
});

export default function RolesTable({
  roles,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  rowCount,
  onStateChange,
  onExportRequest,
  renderTopLeftToolbar,
}: RolesTableProps) {
  const { token } = useAuth();
  const router = useRouter();
  const { deleteRole, isDeleting } = useRoles();
  const [editTarget, setEditTarget] = React.useState<RoleType | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<RoleType | null>(null);

  // Ported as-is from DeleteRolesPermissionsButton, which owned this flow
  // while the action still lived in a column.
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    try {
      if (!token) {
        notify.error("You are not authenticated", {
          description: "Please login to continue",
        });
        router.push("/login");
        return;
      }

      deleteRole(deleteTarget.id);
      notify.success("Role deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Failed to delete role", {
        description: "Please try again later",
      });
    }
  };

  const columns = React.useMemo<MRT_ColumnDef<RoleType>[]>(() => [
    {
      accessorKey: "role_name",
      header: "Role Access",
      Cell: ({ cell }) => {
        const roleName = cell.getValue<string>();
        return <Chip label={roleName} sx={getChipStyle(roleName)} />;
      },
    },
    {
      accessorKey: "permission_names",
      header: "Permissions",
      filterVariant: "multi-select",
      Cell: ({ cell }) => {
        const permissions = cell.getValue<string[]>() || [];
        return (
          <div className="flex flex-wrap gap-1.5 items-center">
            {permissions.slice(0, 3).map((item: string, index: number) => (
              <Chip
                key={index}
                label={formatPermissionLabel(item)}
                sx={PERMISSION_CHIP_STYLE}
              />
            ))}
            {permissions.length > 3 && (
              <Tooltip
                arrow
                title={
                  <div className="p-1 px-2">
                    <Typography
                      variant="caption"
                      className="font-semibold block mb-1"
                    >
                      Full permissions:
                    </Typography>
                    <div className="flex flex-col gap-0.5">
                      {permissions.map((p, i) => (
                        <Typography
                          key={i}
                          variant="caption"
                          className="text-white/80"
                        >
                          • {formatPermissionLabel(p)}
                        </Typography>
                      ))}
                    </div>
                  </div>
                }
              >
                <Chip
                  label={`+${permissions.length - 3}`}
                  variant="outlined"
                  sx={{
                    ...PERMISSION_CHIP_STYLE,
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="mb-6">
      <SuperTable
        entityLabel="role"
        searchPlaceholder="Cari nama role"
        tableId="roles-table"
        columns={columns}
        data={roles || []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage ?? "Failed to load roles data."}
        onRetry={onRetry}
        rowCount={rowCount}
        manualPagination={true}
        manualFiltering={true}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        rowActions={[
          {
            id: "edit",
            label: "Edit Permissions",
            icon: <Pencil size={16} />,
            // The reason reads under the label instead of hiding in a tooltip
            // on a button that had left the tab order.
            disabled: (row) =>
              isDefaultRole(row.role_name) ? "Default role cannot be edited" : false,
            onClick: (row) => setEditTarget(row),
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            destructive: true,
            disabled: (row) =>
              isDefaultRole(row.role_name) ? "Default role cannot be deleted" : false,
            onClick: (row) => setDeleteTarget(row),
          },
        ]}
        features={{
          sorting: true,
          globalFilter: true,
          pagination: true,
          rowSelection: 'none',
          export: { excel: true, csv: true },
          urlSync: true,
          densityToggle: true,
          fullScreenToggle: true,
          facetedValues: true
        }}
        initialState={{
          pagination: { pageIndex: 0, pageSize: 10 }
        }}
        renderEmptyState={() => (
          <EmptyState
            icon={ShieldCheck}
            title="No roles found"
            description="Create roles to control what each team member can access."
          />
        )}
      />

      <EditPermissionsDialog
        open={Boolean(editTarget)}
        setOpen={(open: boolean) => {
          if (!open) setEditTarget(null);
        }}
        roleId={editTarget?.id ?? ""}
        initialRoleName={editTarget?.role_name ?? ""}
        initialPermissions={editTarget?.permission_names ?? []}
      />

      <ConfirmationPopup
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this role?"
        description="This action is permanent and cannot be undone"
        confirmText="Delete Role"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

