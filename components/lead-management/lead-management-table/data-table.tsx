"use client";

import { useCallback, useEffect, useState } from "react";

import { useLeads } from "@/lib/hooks/useLeads";
// MUI
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Lead } from "@/lib/models/types";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from '@mui/material/Divider';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

// TanStack Table
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import LeadDetailModal from "../lead-detail-modal";
import LeadFilters from "./LeadFilters";

interface DataTableProps {
  columns: ColumnDef<Lead>[];
}

export function DataTable({ columns }: DataTableProps) {
  const { data: leadsResponse, isLoading, error } = useLeads();
  const [filteredData, setFilteredData] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const data = leadsResponse?.data?.leads || [];
  const totalCount = leadsResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  console.log('DataTable render - data length:', data.length, 'isLoading:', isLoading, 'filteredData length:', filteredData.length);

  // Memoize the setFilteredData function to prevent unnecessary re-renders
  const handleSetFilteredData = useCallback((leads: Lead[]) => {
    console.log('handleSetFilteredData called with leads:', leads.length, 'items');
    setFilteredData(leads);
  }, []);

  // Initial effect to set filtered data when data is first loaded
  useEffect(() => {
    if (data.length > 0 && filteredData.length === 0) {
      setFilteredData(data);
    }
  }, [data, filteredData.length]);

  // Update filtered data when leads data changes
  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data);
    }
  }, [data]);



  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: totalPages,

    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),

    getCoreRowModel: getCoreRowModel(),
  });

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <Card
        className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CardHeader title="Filters" />
        {/* Don't render LeadFilters during loading to prevent empty array filtering */}
        <div className="p-4 bg-gray-50 text-gray-500 text-center">
          Loading filters...
        </div>
        <Divider />
        <TableSkeleton 
          columns={columns.map(() => ({ width: undefined }))} 
          rows={pageSize}
        />
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card
        className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CardHeader title="Error" />
        <div className="p-6 text-center text-red-600">
          Failed to load leads: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <CardHeader title="Filters" />
      <LeadFilters setFilteredLeads={handleSetFilteredData} leads={data} />
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
              <TableRow 
                key={row.id}
                onClick={() => {
                  setSelectedLead(row.original);
                  setIsDetailModalOpen(true);
                }}
                className="cursor-pointer hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {filteredData.length === 0 && !isLoading && (
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
        count={totalCount}
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
        slotProps={{
          select: {
            inputProps: { 'aria-label': 'rows per page' }
          }
        }}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        lead={selectedLead}
      />
    </Card>
  );
}
