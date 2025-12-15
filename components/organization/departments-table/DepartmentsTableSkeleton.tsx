"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  Checkbox,
} from "@mui/material";

export default function UsersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table className="overflow-hidden rounded-lg border border-gray-200">
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell padding="checkbox">
            <Checkbox disabled />
          </TableCell>
          <TableCell>Department</TableCell>
          <TableCell>Branch</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>Manager ID</TableCell>
          <TableCell>Member Count</TableCell>
          <TableCell align="center">Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={18} height={18} />
            </TableCell>

            <TableCell>
              <Skeleton width={120} height={14} />
            </TableCell>

            <TableCell>
              <Skeleton width={100} height={14} />
            </TableCell>

            <TableCell>
              <Skeleton width={140} height={14} />
            </TableCell>

            <TableCell>
              <Skeleton width={90} height={14} />
            </TableCell>

            <TableCell>
              <Skeleton width={60} height={24} className="rounded-full" />
            </TableCell>

            <TableCell align="center">
              <div className="flex justify-center gap-2">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
