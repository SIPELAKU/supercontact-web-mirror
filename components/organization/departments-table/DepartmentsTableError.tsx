import { TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Table } from "lucide-react";
import { Button } from "@mui/material";

interface DepartmentsTableErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function DepartmentsTableError({
  message = "Failed to load departments data",
  onRetry,
}: DepartmentsTableErrorProps) {
  return (
    <Table className="rounded-lg border border-gray-200">
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell>Department</TableCell>
          <TableCell>Branch</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>Members</TableCell>
          <TableCell align="center">Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow>
          <TableCell colSpan={5}>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-gray-600">{message}</p>

              {onRetry && (
                <Button
                  size="small"
                  className="mt-4"
                  onClick={onRetry}
                >
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
