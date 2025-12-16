"use client";

import LeadManagement from "@/components/lead-management/lead-management";
import { useLeads } from "@/lib/hooks/useLeads";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui-mui/tabs";
import AddLeadForm from "@/components/lead-management/add-lead-form";
import PageHeader from "@/components/ui-mui/page-header";
import { TableSkeleton } from "@/components/ui-mui/table-skeleton";
import { useViewMode } from "@/lib/hooks/useLeadStore";

export default function LeadManagementPage() {
  const { data, isLoading, error } = useLeads();
  const { viewMode, setViewMode } = useViewMode();

  console.log('data', data)
  return (
    
    <div className="w-full max-w-full mx-auto px-4 space-y-6 ">
        <PageHeader
                title="Lead Management"
                breadcrumbs={[
                  { label: "Sales" },
                  { label: "Lead Management" },
                ]}
              />
          {/* Tabs */}
          <div className="flex justify-between">
            <Tabs
              value={viewMode}
              onValueChange={(val) =>
                setViewMode(val as "table-view" | "kanban-view")
              }
              className="h-8"
            >
              <TabsList>
                <TabsTrigger value="table-view">Table View</TabsTrigger>
                <TabsTrigger value="kanban-view" className="whitespace-nowrap">Kanban View</TabsTrigger>
              </TabsList>
            </Tabs>
            <AddLeadForm />
          </div>

        
        {isLoading ? (
          <div className="space-y-4">
            {viewMode === "table-view" ? (
              <TableSkeleton
                columns={[
                  { width: 12 }, // Lead Name
                  { width: 8 },  // Status
                  { width: 10 }, // Source
                  { width: 10 }, // Assigned To
                  { width: 12 }, // Last Contacted
                ]}
                rows={8}
                selectable={true}
                actionColumn={true}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error: {error.message}</p>
            <p className="text-gray-500 mt-2">Please try refreshing the page</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No leads found.</p>
            <p className="text-gray-400 mt-2">Start by adding your first lead</p>
          </div>
        ) : (
          <LeadManagement data={data} />
        )}


        </div>
        
  )
}
