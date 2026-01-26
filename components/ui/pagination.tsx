import TablePagination from "@mui/material/TablePagination";
import { ChangeEvent, MouseEvent } from "react";

interface PaginationProps {
  page: number;
  rowsPerPage: number;
  count: number;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
  onRowsPerPageChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  rowsPerPageOptions?: number[];
}

export default function Pagination({
  page,
  rowsPerPage,
  count,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
}: PaginationProps) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
}
