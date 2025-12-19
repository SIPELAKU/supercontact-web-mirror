"use client";

import { columns } from "./lead-management-table/columns";
import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "./lead-management-table/kanban-view";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { useLeads } from "@/lib/hooks/useLeads";

export default function LeadManagement() {
  const { viewMode } = useViewMode();
  const { data: leadsResponse, isLoading, error } = useLeads();
  console.log('tes12')
  return (
    <div className=" min-h-screen max-w-screen p-4">
      <div className="">
        {viewMode === "table-view" && (
          <DataTable columns={columns} />
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
