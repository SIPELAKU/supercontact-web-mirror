import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";

export default function CompanyTableSkeleton() {
  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell>
            <input type="checkbox" />
          </TableCell>
          <TableCell>Company Name</TableCell>
          <TableCell>Industry</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Employees</TableCell>
          <TableCell>Insight Score</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} className="h-[55px]">
            <TableCell>
              <Skeleton variant="rounded" width={16} height={16} />
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={32} height={32} />
                <div className="flex flex-col gap-1">
                  <Skeleton variant="text" width={140} height={18} />
                  <Skeleton variant="text" width={180} height={14} />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Skeleton variant="rounded" width={90} height={26} className="rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={140} height={18} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={90} height={18} />
            </TableCell>

            {/* Insight Score: bar + number */}
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-24">
                  <Skeleton variant="rounded" width="100%" height={8} className="rounded-full" />
                </div>
                <Skeleton variant="text" width={24} height={18} />
              </div>
            </TableCell>

            <TableCell>
              <Skeleton variant="rounded" width={100} height={26} className="rounded-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
