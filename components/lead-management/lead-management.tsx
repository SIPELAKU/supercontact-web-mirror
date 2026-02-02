"use client";

import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "./lead-management-table/kanban-view";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { useLeads } from "@/lib/hooks/useLeads";
import { Card, CardHeader, Divider, Tab, Tabs, Box } from "@mui/material";
import AddLeadForm from "@/components/lead-management/add-lead-form";
import LeadFilters from "./lead-management-table/LeadFilters";
import { Lead } from "@/lib/models/types";
import { useState, useCallback, useEffect } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { leadColumns } from "./lead-management-table/columns";

export default function LeadManagement() {
  const { viewMode, setViewMode } = useViewMode();
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  // Fetch a larger set for Kanban or a standard set for Table
  // Note: DataTable has its own pagination, so fetching here might be redundant for Table view
  // however, for simplicity and unified filtering, we can fetch here or let components handle it.
  // The user wants filters at the top.

  const { data: leadsResponse, isLoading, error } = useLeads(1, 100); // Fetch more for filtering/kanban
  const leads = leadsResponse?.data?.leads || [];

  const handleSetFilteredLeads = useCallback((data: Lead[]) => {
    setFilteredLeads(data);
  }, []);

  return (
    <div className="w-full">
      <Card
        className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CardHeader title="Filters" />
        <LeadFilters leads={leads} setFilteredLeads={handleSetFilteredLeads} />

        <Divider />

        {/* Toolbar */}
        <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={viewMode}
            onChange={(_, val) => setViewMode(val as "table-view" | "kanban-view")}
            sx={{
              minHeight: '40px',
              '& .MuiTab-root': {
                minHeight: '40px',
                textTransform: 'none',
                fontWeight: 600
              }
            }}
          >
            <Tab label="Table View" value="table-view" />
            <Tab label="Kanban View" value="kanban-view" />
          </Tabs>
          <AddLeadForm />
        </Box>

        <Box sx={{ p: viewMode === "table-view" ? 0 : 2 }}>
          {isLoading ? (
            <TableSkeleton
              columns={leadColumns.map(() => ({ width: undefined }))}
              rows={10}
            />
          ) : error ? (
            <Box sx={{ p: 6, textAlign: 'center', color: 'error.main' }}>
              Failed to load leads: {error.message}
            </Box>
          ) : (
            <>
              {viewMode === "table-view" && (
                <DataTable initialData={filteredLeads} />
              )}

              {viewMode === "kanban-view" && (
                <div className="overflow-x-auto">
                  <KanbanView data={{ ...leadsResponse, data: { ...leadsResponse?.data, leads: filteredLeads } } as any} isLoading={isLoading} error={error} />
                </div>
              )}
            </>
          )}
        </Box>
      </Card>
    </div>
  );
}
