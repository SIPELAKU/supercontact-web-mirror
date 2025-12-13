"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from "@mui/material";

interface RolesTableErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function RolesTableError({ message, onRetry }: RolesTableErrorProps) {
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
        <TableRow>
          <TableCell colSpan={3}>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="mt-3 text-gray-600">{message}</p>

              {onRetry && (
                <Button className="mt-4" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
