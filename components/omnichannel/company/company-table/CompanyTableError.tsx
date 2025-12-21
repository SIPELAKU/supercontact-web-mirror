import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface CompanyTableErrorProps {
  message?: string;
}

export default function CompanyTableError({ message }: CompanyTableErrorProps) {
  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell />
          <TableCell>Company Name</TableCell>
          <TableCell>Industry</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Employees</TableCell>
          <TableCell>Insight Score</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow>
          <TableCell colSpan={7}>
            <div className="flex h-8 flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-semibold text-gray-700">{message}</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
