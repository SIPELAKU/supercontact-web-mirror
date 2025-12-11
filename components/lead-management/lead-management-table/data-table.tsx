"use client";

import { useEffect, useState } from "react";
import { useViewMode } from "@/lib/hooks/useLeadStore";
// MUI
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Divider from '@mui/material/Divider'
import { Lead } from "@/lib/models/types";

// TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
} from "@tanstack/react-table";
import LeadFilters from "./LeadFilters";

interface DataTableProps {
  columns: ColumnDef<Lead>[];
}

export function DataTable({ columns }: DataTableProps) {
  const [data, setData] = useState<Lead[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const {filteredData,setFilteredData} = useViewMode();
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  async function loginAndGetToken(): Promise<string> {
  const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "admin",
    }),
    cache: "no-store",
  });

  const json = await loginRes.json();
  if (!loginRes.ok || !json.success) {
    throw new Error("Login failed");
  }

  return json.data.access_token;
}
  // Load server data
  useEffect(() => {
    const load = async () => {
        const token = await loginAndGetToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads?page=${
          pageIndex + 1
        }&limit=${pageSize}`,
        {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
      );
      
      const json = await res.json();

      setData(json.data.leads);
      setFilteredData(json.data.leads);
      setTotalPages(json.data.total_pages);
    };

    load();
  }, [pageIndex, pageSize]);



  const table = useReactTable({
    data: filteredData ? filteredData : data,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: totalPages,

    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),

    getCoreRowModel: getCoreRowModel(),
  });
  

  // const [filteredData, setFilteredData] = useState<TData[]>(data);
  return (
    <Card
      className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <CardHeader title="Filters" />
      {/* <LeadFilters setData={setFilteredData} productData={data} /> */}
      <LeadFilters leads={data} setFilteredLeads={setFilteredData} />
      <Divider />
      <div className="overflow-hidden rounded-none!">
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {/* Sorting icons */}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        component="div"
        count={totalPages * pageSize}
        rowsPerPage={pageSize}
        page={pageIndex}
        onPageChange={(_, page) =>
          setPagination((prev) => ({ ...prev, pageIndex: page }))
        }
        onRowsPerPageChange={(e) =>
          setPagination({
            pageIndex: 0,
            pageSize: Number(e.target.value),
          })
        }
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Card>
  );
}
