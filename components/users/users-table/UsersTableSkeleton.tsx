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
          <TableCell>User</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Employee ID</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={18} height={18} />
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex flex-col gap-1">
                  <Skeleton width={120} height={14} />
                  <Skeleton width={160} height={12} />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Skeleton width={180} height={14} />
            </TableCell>
            <TableCell>
              <Skeleton width={80} height={14} />
            </TableCell>
            <TableCell>
              <Skeleton width={100} height={14} />
            </TableCell>
            <TableCell>
              <Skeleton width={70} height={24} className="rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton variant="circular" width={28} height={28} />
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
