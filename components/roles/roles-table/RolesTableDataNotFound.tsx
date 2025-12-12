import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function RolesTableDataNotFound() {
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
          <TableCell colSpan={3} className="text-center!">
            No data found
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
