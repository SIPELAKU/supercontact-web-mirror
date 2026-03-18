"use client";

import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "./lead-management-table/kanban-view";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { useLeads } from "@/lib/hooks/useLeads";
import { Tab, Tabs, Box, CircularProgress } from "@mui/material";
import AddLeadForm from "@/components/lead-management/add-lead-form";
import { Lead } from "@/lib/models/types";
import { useState, useMemo, useCallback, useRef } from "react";
import type { SuperTableState } from "@/components/ui/super-table";

export default function LeadManagement() {
  const { viewMode, setViewMode } = useViewMode();

  const { data: leadsResponse, isLoading, error } = useLeads(1, 100);
  const leadsRaw = leadsResponse?.data?.leads;
  const leads = useMemo(() => leadsRaw || [], [leadsRaw]);

  // --- Shared Filter State dari SuperTable ---
  const [tableColumnFilters, setTableColumnFilters] = useState<
    { id: string; value: unknown }[]
  >([]);

  const prevColumnFilters = useRef<string>('[]');

  const handleTableStateChange = useCallback(
    (state: SuperTableState) => {
      const newFilters = JSON.stringify(state.columnFilters || []);
      if (newFilters !== prevColumnFilters.current) {
        prevColumnFilters.current = newFilters;
        setTableColumnFilters(
          (state.columnFilters || []) as { id: string; value: unknown }[]
        );
      }
    },
    []
  );

  // --- Filtered Leads untuk Kanban (parsing columnFilters dari SuperTable) ---
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    for (const filter of tableColumnFilters) {
      const { id, value } = filter;

      if (!value) continue;

      switch (id) {
        case "lead_status":
          if (typeof value === "string" && value) {
            filtered = filtered.filter(
              (l) =>
                l.lead_status?.toLowerCase() === value.toLowerCase()
            );
          }
          break;

        case "lead_source":
          if (typeof value === "string" && value) {
            filtered = filtered.filter(
              (l) =>
                l.lead_source?.toLowerCase() === value.toLowerCase()
            );
          }
          break;

        case "user":
          if (typeof value === "string" && value) {
            filtered = filtered.filter(
              (l) =>
                l.user?.fullname?.trim().toLowerCase() ===
                value.trim().toLowerCase()
            );
          }
          break;

        case "last_contacted": {
          // MRT date-range filter sends [Date | null, Date | null] as value
          const dateFilter = value as [Date | null, Date | null] | undefined;
          if (Array.isArray(dateFilter) && (dateFilter[0] || dateFilter[1])) {
            const [start, end] = dateFilter;
            filtered = filtered.filter((l) => {
              const dateString = l.contact.last_contacted?.created_at;
              if (!dateString) return false;
              const leadDate = new Date(dateString);
              if (start && leadDate < new Date(start)) return false;
              if (end && leadDate > new Date(end)) return false;
              return true;
            });
          }
          break;
        }
      }
    }

    return filtered;
  }, [leads, tableColumnFilters]);

  return (
    <div className="w-full">
      {/* Toolbar: Tabs + Add Lead */}
      <Box
        sx={{
          p: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
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
          <Box sx={{ p: 6, textAlign: "center", color: "error.main" }}>
            Failed to load leads: {error.message}
          </Box>
        ) : (
          <>
            {viewMode === "table-view" && (
              <DataTable
                initialData={leads}
                onStateChange={handleTableStateChange}
              />
            )}

            {viewMode === "kanban-view" && (
              <div className="overflow-x-auto">
                <KanbanView
                  data={
                    {
                      ...leadsResponse,
                      data: {
                        ...leadsResponse?.data,
                        leads: filteredLeads,
                      },
                    } as any
                  }
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            )}
          </>
        )}
      </Box>
    </div>
  );
}
