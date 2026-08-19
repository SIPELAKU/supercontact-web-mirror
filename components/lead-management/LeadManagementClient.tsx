"use client";

import AddLeadForm from "@/components/lead-management/add-lead-form";
import LeadManagement from "@/components/lead-management/lead-management";
import PageHeader from "@/components/ui/page-header";
import { useViewMode } from "@/lib/hooks/useLeadStore";
import { Tab, Tabs } from "@mui/material";

export default function LeadManagementClient() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Leads"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Lead Management" },
        ]}
      />

      <LeadManagement />
    </div>
  );
}
