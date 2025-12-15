"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface DepartmentsTableNotFoundProps {
  message?: string;
}

export default function DepartmentsTableNotFound({
  message = "No data found",
}: DepartmentsTableNotFoundProps) {
  return (
    <Table className="rounded-lg border border-gray-200">
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell padding="checkbox" />
          <TableCell>Department</TableCell>
          <TableCell>Branch</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>Manager ID</TableCell>
          <TableCell>Member Count</TableCell>
          <TableCell align="center">Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow>
          <TableCell colSpan={7}>
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <p className="text-sm font-medium">{message}</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
