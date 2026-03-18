import { RoleType } from "@/lib/types/Role";
import { Chip, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import DeleteRolesPermissionsButton from "../roles-button-open-modal/DeleteRolesPermissionsButton";
import EditPermissionsButton from "../roles-button-open-modal/EditPermissionsButton";
import RolesTableDataNotFound from "./RolesTableDataNotFound";
import RolesTableError from "./RolesTableError";
import RolesTableSkeleton from "./RolesTableSkeleton";
import React from 'react';
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';
import { MRT_TableInstance } from 'material-react-table';

interface RolesTableProps {
  roles: RoleType[];
  isLoading: boolean;
  isError: boolean;
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
  rowCount,
  onStateChange,
  onExportRequest,
  renderTopLeftToolbar,
}: RolesTableProps) {
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
    {
      id: "actions",
      header: "Actions",
      Cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-1">
            <EditPermissionsButton
              roleId={role.id}
              roleName={role.role_name}
              assignedPermissions={role.permission_names}
            />
            <DeleteRolesPermissionsButton roleId={role.id} roleName={role.role_name} />
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="mb-6">
      <SuperTable
        tableId="roles-table"
        columns={columns}
        data={roles || []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load roles data."
        rowCount={rowCount}
        manualPagination={true}
        manualFiltering={true}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
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
        renderEmptyState={() => <Typography className="text-center p-4 text-gray-500">No roles data found.</Typography>}
      />
    </div>
  );
}

