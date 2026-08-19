"use client";

import { useState } from "react";
import { Lead } from "@/lib/models/types";
import LeadDetailModal from "../lead-detail-modal";
import { leadColumns } from "./columns";
import { SuperTable } from "@/components/ui/super-table";
import type { SuperTableState } from "@/components/ui/super-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Target } from "lucide-react";

interface DataTableProps {
  initialData?: Lead[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onStateChange?: (state: SuperTableState) => void;
}

export function DataTable({
  initialData,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onStateChange,
}: DataTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const data = initialData || [];

  return (
    <div className="w-full">
      <SuperTable
        tableId="leads-table"
        data={data}
        columns={leadColumns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={Target}
            title="No leads found"
            description="Leads you add or capture will appear here."
          />
        )}
        features={{
          globalFilter: true,
          globalFilterAlwaysVisible: false,
          columnFilters: true,
          facetedValues: true,
          sorting: true,
          pagination: true,
          rowSelection: "none",
          densityToggle: true,
          fullScreenToggle: true,
          export: {
            excel: true,
            csv: true,
          },
        }}
        onStateChange={onStateChange}
        autoResetPageIndex={false}
        onRowClick={(row) => {
          setSelectedLead(row);
          setIsDetailModalOpen(true);
        }}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        lead={selectedLead}
      />
    </div>
  );
}
