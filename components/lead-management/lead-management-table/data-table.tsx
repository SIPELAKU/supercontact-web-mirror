"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { Lead, leadResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import TablePagination from "@mui/material/TablePagination";
import { useLeads } from "@/lib/hooks/useLeads";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

// API fetch
// const fetchLeads = async (page: number, perPage: number) => {
//   const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
//     params: { page, per_page: perPage },
//   });
//   console.log("fetched data:", data);
//   return {
//     items: data.leads.map((lead: any) => ({
//       id: lead.id,
//       name: lead.lead_name,
//       status: lead.status,
//       source: lead.source,
//       assignedTo: lead.user.fullname,
//       lastContacted: lead.last_contacted,
//     })) as Lead[],
//     total: data.total,
//   };
// };

export function DataTable({
  columns
}: { columns: ColumnDef<Lead>[]; data?: leadResponse }) {
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data, isLoading, error } = useLeads();
  console.log('data in table', data);
  // const { data, isLoading, error } = useQuery(
  //   ["leads", page, rowsPerPage],
  //   () => fetchLeads(page + 1, rowsPerPage),
  //   // { keepPreviousData: true }
  // );
// const { data, isLoading, error } = useQuery({
//   queryKey: ['leads', page, rowsPerPage], // can include variables
//   queryFn: () => fetchLeads(page + 1, rowsPerPage),
//   // keepPreviousData: true,
// });
  const table = useReactTable({
    data: data?.data.leads ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error loading leads</p>;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-4">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left py-3 px-2 text-gray-500 font-medium"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-4 px-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* MUI Pagination */}
      <TablePagination
        component="div"
        count={data?.data.total ?? 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </div>
  );
}
