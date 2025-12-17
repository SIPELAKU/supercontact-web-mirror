"use client";

import LeadManagement from "@/components/lead-management/lead-management";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui-mui/tabs";
import AddLeadForm from "@/components/lead-management/add-lead-form";
import PageHeader from "@/components/ui-mui/page-header";
import { useViewMode } from "@/lib/hooks/useLeadStore";

export default function LeadManagementPage() {
  const { viewMode, setViewMode } = useViewMode();

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

      <LeadManagement />
    </div>
  );
}
