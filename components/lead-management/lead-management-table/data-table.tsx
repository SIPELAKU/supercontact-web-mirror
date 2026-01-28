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

export function DataTable() {
  const [filteredData, setFilteredData] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { data: leadsResponse, isLoading, error } = useLeads(pageIndex + 1, pageSize);

  const data = leadsResponse?.data?.leads || [];
  const totalCount = leadsResponse?.data?.total || 0;

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

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const isAsc = sortBy === columnKey && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(columnKey);

    // Simple client-side sorting
    const sorted = [...filteredData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (columnKey) {
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

    setFilteredData(sorted);
  };

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
          columns={leadColumns.map(() => ({ width: undefined }))}
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
            <TableRow className="bg-[#EEF2FD]!">
              {leadColumns.map((column) => (
                <TableCell key={column.key}>
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
            {filteredData.map((lead) => (
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
                {leadColumns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render(lead)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {filteredData.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={leadColumns.length} align="center">
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
        onPageChange={(_, page) => setPageIndex(page)}
        onRowsPerPageChange={(e) => {
          setPageSize(Number(e.target.value));
          setPageIndex(0);
        }}
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
