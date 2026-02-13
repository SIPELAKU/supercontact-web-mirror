"use client";

import { DepartmentsType } from "../../../lib/types/Departments";
import { Avatar, Box, Checkbox, CircularProgress, IconButton } from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  DeparmentsTableError,
  DepartementTableSkeleton,
  DepartmentsTableDataNotFound,
} from "@/components/organization";

import Link from "next/link";
import { randomInt } from "crypto";
import { useRouter } from "next/navigation";
import { DeleteButton, EditButton, ViewButton } from "@/components/ui/app-action-buttons-table";

interface TableListDepartmetsProps {
  data: DepartmentsType[];
  selected: string[];
  isLoading?: boolean;
  error?: string | null;

  actions: {
    onSelectOne: (id: string) => void;
    onSelectAll: (checked: boolean, data: DepartmentsType[]) => void;
    onOpenEdit: (department: DepartmentsType) => void;
    onOpenDelete: (department: DepartmentsType) => void;
  };
}

export default function TableListDepartment({
  data,
  selected,
  isLoading,
  error,
  actions,
}: TableListDepartmetsProps) {
  const { onSelectOne, onSelectAll, onOpenEdit, onOpenDelete } = actions;
  const router = useRouter();

  if (error) {
    return <DeparmentsTableError message="Failed to load Department data." />;
  }

  if (data.length === 0) {
    return <DepartmentsTableDataNotFound />;
  }

  const isAllChecked = data.length > 0 && selected.length === data.length;
  const isSomeChecked = selected.length > 0 && !isAllChecked;

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

          <TableCell>Department</TableCell>
          <TableCell>Branch</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>Manager ID</TableCell>
          <TableCell align="center">Member Count</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6}>
              <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 120,
              }} >
                <CircularProgress />
              </Box>
            </TableCell>
          </TableRow>
        ) : data.map((department, index) => (
          <TableRow
            key={department.id}
            className="transition-all hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push(`/organization/${department.id}`)}
          >
            <TableCell padding="checkbox">
              <Checkbox
                checked={selected.includes(department.id)}
                onChange={() => onSelectOne(department.id)}
              />
            </TableCell>

            <TableCell>
              <Link href={`/organization/${department.id}`}>
                <span className="font-medium hover:underline">
                  {department.department}
                </span>
              </Link>
            </TableCell>

            <TableCell>
              <span className="text-gray-500">{department.branch}</span>
            </TableCell>
            <TableCell align="center">
              {department.manager === null ? "-" : (
                <div className="flex items-center gap-3">
                  <Avatar sx={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                    {department.manager.avatar_initial}
                  </Avatar>
                  <span className="font-medium">
                    {department.manager.fullname}
                  </span>
                </div>
              )}
            </TableCell>
            <TableCell>{department.manager_code}</TableCell>

            <TableCell align="center">
              {department.member_count}
            </TableCell>

            <TableCell onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <EditButton onClick={() => onOpenEdit(department)} />
                <DeleteButton onClick={() => onOpenDelete(department)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
