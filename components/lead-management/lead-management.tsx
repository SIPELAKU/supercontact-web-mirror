"use client";

import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "./lead-management-table/kanban-view";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { useLeads } from "@/lib/hooks/useLeads";

export default function LeadManagement() {
  const { viewMode } = useViewMode();
  // For Kanban view, we fetch a larger number of leads. 
  // Table view manages its own pagination inside the DataTable component.
  const { data: leadsResponse, isLoading, error } = useLeads(1, viewMode === "kanban-view" ? 100 : 10);
  return (
    <div className=" min-h-screen max-w-screen p-4">
      <div className="">
        {viewMode === "table-view" && (
          <DataTable />
        )}

        {viewMode === "kanban-view" && (
          <div className="overflow-x-auto">
            <KanbanView data={leadsResponse} isLoading={isLoading} error={error} />
          </div>
        )}
      </div>
    </div>
  );
}
