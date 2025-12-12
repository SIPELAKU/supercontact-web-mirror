"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Skeleton } from "@mui/material";

export default function RolesTableSkeleton() {
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
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index} className="h-[55px]">
            <TableCell>
              <Skeleton variant="text" width={140} height={34} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="80%" height={34} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton variant="rounded" width={32} height={32} />
                <Skeleton variant="rounded" width={32} height={32} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
