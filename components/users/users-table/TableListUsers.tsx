"use client";

import { Avatar, Checkbox, IconButton } from "@mui/material";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  UsersTableError,
  UsersTableNotFound,
  UsersTableSkeleton,
} from "@/components/users";
import { ManageUser } from "@/lib/types/manage-users";

interface TableListUsersProps {
  data: ManageUser[];
  selected: string[];
  isLoading?: boolean;
  error?: Error | null | undefined;

  actions: {
    onSelectOne: (id: string) => void;
    onSelectAll: (checked: boolean, data: ManageUser[]) => void;
    onOpenEdit: (user: ManageUser) => void;
    onOpenDetail: (user: ManageUser) => void;
    onOpenDelete: () => void;
  };
}

export default function TableListUsers({
  data,
  selected,
  isLoading,
  error,
  actions,
}: TableListUsersProps) {
  const { onSelectOne, onSelectAll, onOpenEdit, onOpenDetail, onOpenDelete } =
    actions;

  const isAllChecked = data.length > 0 && selected.length === data.length;
  const isSomeChecked = selected.length > 0 && !isAllChecked;

  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  if (error) {
    return <UsersTableError message="Failed to load users data." />;
  }

  if (data.length === 0) {
    return <UsersTableNotFound />;
  }

  return (
    <Table className="overflow-hidden rounded-lg border border-gray-200">
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell padding="checkbox">
            <Checkbox
              checked={isAllChecked}
              indeterminate={isSomeChecked}
              onChange={(e) => onSelectAll(e.target.checked, data)}
            />
          </TableCell>

          <TableCell>User</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Position</TableCell>
          <TableCell>Employee ID</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id} className="transition-all hover:bg-gray-100">
            <TableCell padding="checkbox">
              <Checkbox
                checked={selected.includes(user.id)}
                onChange={() => onSelectOne(user.id)}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar sx={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                  {user.fullname.charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.fullname}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
            </TableCell>

            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.position}</TableCell>
            <TableCell>{user.employee_code}</TableCell>

            <TableCell>
              <span
                className={`rounded-full px-3 py-1 text-xs capitalize ${
                  user.status === "active"
                    ? "bg-green-100 text-green-700"
                    : user.status === "inactive"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                } `}
              >
                {user.status}
              </span>
            </TableCell>

            <TableCell>
              <div className="flex gap-2">
                <IconButton size="small" onClick={() => onOpenDetail(user)}>
                  <Eye size={18} />
                </IconButton>
                <IconButton size="small" onClick={() => onOpenEdit(user)}>
                  <Pencil size={18} />
                </IconButton>
                <IconButton size="small" onClick={onOpenDelete}>
                  <Trash2 size={18} className="text-red-500" />
                </IconButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
