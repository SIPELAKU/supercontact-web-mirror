"use client";

import { Table, TableBody, TableCell, TableRow } from "@mui/material";

export default function UsersTableDataNotFound() {
  return (
    <Table className="overflow-hidden rounded-lg border border-gray-200">
      <TableBody>
        <TableRow>
          <TableCell colSpan={7}>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-gray-700">
                No users found
              </p>
              <p className="text-xs text-gray-500">
                Try adjusting filters or add new users.
              </p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
