"use client";

import { DepartmentsType } from "../../../lib/types/Departments";
import { Avatar, Checkbox, IconButton } from "@mui/material";
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

  function generateRandomString(length: number) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const randomName = generateRandomString(8);

  if (isLoading) {
    return <DepartementTableSkeleton />;
  }

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
          <TableCell>Member Count</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((department, index) => (
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
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar sx={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                  N
                </Avatar>
                <span className="font-medium">
                  {department.manager_name || randomName}
                </span>
              </div>
            </TableCell>
            <TableCell>{department.manager_code}</TableCell>

            <TableCell>
              {department.member_count || Math.floor(Math.random() * 50) + 1}
            </TableCell>

            <TableCell onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <IconButton size="small" onClick={() => onOpenEdit(department)}>
                  <Pencil size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onOpenDelete(department)}
                >
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
