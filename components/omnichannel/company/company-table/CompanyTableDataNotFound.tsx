import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export default function CompanyTableDataNotFound() {
  return (
    <TableRow>
      <TableCell colSpan={7}>
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-semibold text-gray-700">No companies found</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
