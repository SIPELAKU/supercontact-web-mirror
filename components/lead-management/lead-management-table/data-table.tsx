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
import TableSortLabel from "@mui/material/TableSortLabel";

import LeadDetailModal from "../lead-detail-modal";
import LeadFilters from "./LeadFilters";
import { leadColumns, LeadColumn } from "./columns";

type SortOrder = 'asc' | 'desc';

export function DataTable({ initialData }: { initialData?: Lead[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Use initialData as the source of truth if provided
  const data = initialData || [];
  const totalCount = data.length;

  // Handle local sorting
  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;
    const isAsc = sortOrder === 'asc';

    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'lead_name':
        aValue = a.contact.name;
        bValue = b.contact.name;
        break;
      case 'lead_status':
        aValue = a.lead_status;
        bValue = b.lead_status;
        break;
      case 'lead_source':
        aValue = a.lead_source;
        bValue = b.lead_source;
        break;
      case 'user':
        aValue = a.user.fullname;
        bValue = b.user.fullname;
        break;
      case 'last_contacted':
        aValue = a.contact.last_contacted?.created_at || '';
        bValue = b.contact.last_contacted?.created_at || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return isAsc ? -1 : 1;
    if (aValue > bValue) return isAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (columnKey: string) => {
    const isAsc = sortBy === columnKey && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(columnKey);
  };

  // Local pagination for the filtered data
  const paginatedData = sortedData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="w-full">
      <div className="p-0">
        <div className="mx-6 mb-6 overflow-hidden border border-gray-200 rounded-xl">
          <Table>
            <TableHead>
              <TableRow className="bg-[#EEF2FD]!">
                {leadColumns.map((column, index) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      pl: index === 0 ? 3 : undefined,
                      pr: index === leadColumns.length - 1 ? 3 : undefined
                    }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortBy === column.key}
                        direction={sortBy === column.key ? sortOrder : 'asc'}
                        onClick={() => handleSort(column.key)}
                      >
                        <span className="text-[#6B7280]">{column.label}</span>
                      </TableSortLabel>
                    ) : (
                      <span className="text-[#6B7280]">{column.label}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => {
                    setSelectedLead(lead);
                    setIsDetailModalOpen(true);
                  }}
                  className="cursor-pointer hover:bg-gray-50"
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                    },
                    cursor: 'pointer',
                  }}
                >
                  {leadColumns.map((column, index) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        pl: index === 0 ? 3 : undefined,
                        pr: index === leadColumns.length - 1 ? 3 : undefined
                      }}
                    >
                      {column.render(lead)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={leadColumns.length} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TablePagination
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={pageIndex}
        onPageChange={(_, page) => setPageIndex(page)}
        onRowsPerPageChange={(e) => {
          setPageSize(Number(e.target.value));
          setPageIndex(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
        sx={{ borderTop: '1px solid #e5e7eb' }}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        lead={selectedLead}
      />
    </div>
  );
}
