"use client";

import { useState } from "react";
import { Lead } from "@/lib/models/types";
import LeadDetailModal from "../lead-detail-modal";
import { leadColumns } from "./columns";
import { SuperTable } from "@/components/ui/super-table";
import type { SuperTableState } from "@/components/ui/super-table";

interface DataTableProps {
  initialData?: Lead[];
  onStateChange?: (state: SuperTableState) => void;
}

export function DataTable({ initialData, onStateChange }: DataTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const data = initialData || [];

  return (
    <div className="w-full">
      <SuperTable
        data={data}
        columns={leadColumns}
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
