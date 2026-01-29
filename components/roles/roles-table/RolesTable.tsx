import { RoleType } from "@/lib/types/Role";
import { Chip, SxProps, Theme } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteRolesPermissionsButton from "../roles-button-open-modal/DeleteRolesPermissionsButton";
import EditPermissionsButton from "../roles-button-open-modal/EditPermissionsButton";
import RolesTableDataNotFound from "./RolesTableDataNotFound";
import RolesTableError from "./RolesTableError";
import RolesTableSkeleton from "./RolesTableSkeleton";

interface RolesTableProps {
  roles: RoleType[];
  isLoading: boolean;
  isError: boolean;
  // error: string | null | undefined;
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
}: RolesTableProps) {
  if (isLoading) {
    return <RolesTableSkeleton />;
  }
  if (isError) {
    return <RolesTableError message="Failed to load roles data." />;
  }

  if (roles.length === 0) {
    return <RolesTableDataNotFound />;
  }
  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell>Role Access</TableCell>
          <TableCell>Permissions</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {roles?.map((role) => (
          <TableRow key={role.id} className="h-[55px]">
            <TableCell>
              <Chip
                label={role?.role_name}
                sx={getChipStyle(role?.role_name)}
              />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1.5 items-center">
                {role?.permission_names
                  ?.slice(0, 3)
                  .map((item: string, index: number) => (
                    <Chip
                      key={index}
                      label={formatPermissionLabel(item)}
                      sx={PERMISSION_CHIP_STYLE}
                    />
                  ))}
                {role?.permission_names?.length > 3 && (
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
                          {role.permission_names.map((p, i) => (
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
                      label={`+${role.permission_names.length - 3}`}
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
            </TableCell>

            {/* Actions */}
            <TableCell>
              <div className="flex items-center">
                <EditPermissionsButton
                  roleId={role?.id}
                  roleName={role?.role_name}
                  assignedPermissions={role?.permission_names}
                />
                <DeleteRolesPermissionsButton roleId={role?.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
