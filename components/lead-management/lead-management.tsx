"use client";

import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "./lead-management-table/kanban-view";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { useLeads } from "@/lib/hooks/useLeads";
import { Card, CardHeader, Divider, Tab, Tabs, Box, CircularProgress } from "@mui/material";
import AddLeadForm from "@/components/lead-management/add-lead-form";
import LeadFilters from "./lead-management-table/LeadFilters";
import { Lead } from "@/lib/models/types";
import { useState, useCallback, useEffect, useMemo } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { leadColumns } from "./lead-management-table/columns";

export default function LeadManagement() {
  const { viewMode, setViewMode } = useViewMode();

  // Fetch a larger set for Kanban or a standard set for Table
  // Note: DataTable has its own pagination, so fetching here might be redundant for Table view
  // however, for simplicity and unified filtering, we can fetch here or let components handle it.
  // The user wants filters at the top.

  const { data: leadsResponse, isLoading, error } = useLeads(1, 100);
  const leads = leadsResponse?.data?.leads || [];

  // --- Lifted Filter State ---
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [assignedto, setAssignedto] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });

  // --- Memoized Filtering Logic ---
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (status && status !== "All") {
      filtered = filtered.filter((l) => l.lead_status?.toLowerCase() === status.toLowerCase());
    }

    if (source && source !== "All") {
      filtered = filtered.filter((l) => l.lead_source?.toLowerCase() === source.toLowerCase());
    }

    if (assignedto && assignedto !== "All") {
      filtered = filtered.filter((l) => l.user?.fullname?.trim().toLowerCase() === assignedto.trim().toLowerCase());
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);

      filtered = filtered.filter((l) => {
        const dateString = l.contact.last_contacted?.created_at;
        if (!dateString) return false;

        const date = new Date(dateString);
        return date >= from && date <= to;
      });
    }

    return filtered;
  }, [leads, status, source, assignedto, dateRange]);

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
        <LeadFilters
          leads={leads}
          status={status}
          setStatus={setStatus}
          source={source}
          setSource={setSource}
          assignedto={assignedto}
          setAssignedto={setAssignedto}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <Divider />

        {/* Toolbar */}
        <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={viewMode}
            onChange={(_, val) =>
              setViewMode(val as "table-view" | "kanban-view")
            }
            sx={{
              minHeight: "unset",
              padding: "4px",
              backgroundColor: "#f0f2f5",
              borderRadius: "8px",
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            <Tab
              label="Table View"
              value="table-view"
              disableRipple
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minHeight: "32px",
                minWidth: "auto",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#64748B",
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06)",
                },
              }}
            />
            <Tab
              label="Kanban View"
              value="kanban-view"
              disableRipple
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minHeight: "32px",
                minWidth: "auto",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#64748B",
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06)",
                },
              }}
            />
          </Tabs>
          <AddLeadForm />
        </Box>

        <Box sx={{ p: viewMode === "table-view" ? 0 : 2 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 120,
              }}
            >
              <CircularProgress size={30} />
            </Box>
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
