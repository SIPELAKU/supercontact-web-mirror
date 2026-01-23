"use client";

import AddLeadForm from "@/components/lead-management/add-lead-form";
import LeadManagement from "@/components/lead-management/lead-management";
import PageHeader from "@/components/ui/page-header";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { Tab, Tabs } from "@mui/material";

export default function LeadManagementClient() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="w-full max-w-full mx-auto px-4 pt-6 space-y-6 ">
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
          onChange={(_, val) =>
            setViewMode(val as "table-view" | "kanban-view")
          }
          sx={{ minHeight: '32px' }}
        >
          <Tab label="Table View" value="table-view" />
          <Tab label="Kanban View" value="kanban-view" />
        </Tabs>
        <AddLeadForm />
      </div>

      <LeadManagement />
    </div>
  );
}
