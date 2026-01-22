import { RoleType } from "@/lib/types/Role";
import { Chip, SxProps, Theme } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DeleteRolesPermissionsButton from "../roles-button-open-modal/DeleteRolesPermissionsButton";
import EditPermissionsButton from "../roles-button-open-modal/EditPermissionsButton";
import RolesTableDataNotFound from "./RolesTableDataNotFound";
import RolesTableError from "./RolesTableError";
import RolesTableSkeleton from "./RolesTableSkeleton";

interface RolesTableProps {
  roles: RoleType[];
  isLoading: boolean;
  error: string | null | undefined;
}

const BASE_CHIP_STYLE: SxProps<Theme> = {
  fontSize: "12px",
  padding: "0px 6px",
  borderRadius: "12px",
  fontWeight: 500,
};

const ROLE_COLOR_STYLE: Record<string, { backgroundColor: string; color: string }> = {
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

export default function RolesTable({ roles, isLoading, error }: RolesTableProps) {
  if (isLoading) {
    return <RolesTableSkeleton />;
  }

  if (error) {
    return <RolesTableError message="Failed to load roles data." />;
  }

  if (roles.length === 0) {
    return <RolesTableDataNotFound />;
  }
  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell>Permissions</TableCell>
          <TableCell>Role Access</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {roles?.map((role) => (
          <TableRow key={role.id} className="h-[55px]">
            <TableCell>{role?.permissionName}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {role?.assignedTo?.map((item: string, index: number) => (
                  <Chip key={index} label={item} sx={getChipStyle(item)} />
                ))}
              </div>
            </TableCell>

            {/* Actions */}
            <TableCell>
              <div className="flex items-center">
                <EditPermissionsButton permission={role?.permissionName} assignedTo={role?.assignedTo} />
                <DeleteRolesPermissionsButton />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
