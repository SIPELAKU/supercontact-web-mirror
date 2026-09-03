"use client";

import { useState } from "react";
import { Lead } from "@/lib/models/types";
import LeadDetailModal from "../lead-detail-modal";
import { leadColumns, LEAD_SOURCES, LEAD_STATUSES } from "./columns";
import { SuperTable } from "@/components/ui/super-table";
import type { SuperTableState } from "@/components/ui/super-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Target, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { deleteLead } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";

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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Single delete state (mirrors kanban-view's ConfirmationPopup-guarded delete)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete state (mirrors ContactClient's sequential bulk delete)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    leads: Lead[];
    clearSelection: () => void;
  } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const data = initialData || [];

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      await deleteLead(token, leadToDelete.id);

      // Refresh the leads data
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      notify.success("Success", { description: "Lead deleted successfully!" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      notify.error("Error", { description: "Failed to delete lead. Please try again." });
    } finally {
      setIsDeleting(false);
      setLeadToDelete(null);
    }
  };

  // Sequential per-lead deletes with success/fail counting (no bulk endpoint)
  const performBulkDelete = async () => {
    if (!bulkDeleteTarget) return;
    const { leads: selectedLeads, clearSelection } = bulkDeleteTarget;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    const failMessages: string[] = [];

    for (const lead of selectedLeads) {
      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        await deleteLead(token, lead.id);
        successCount++;
      } catch (err: any) {
        const message = err?.message || "Failed to delete lead";
        failMessages.push(message);
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    setBulkDeleteTarget(null);
    clearSelection();

    if (successCount > 0) {
      notify.success(`${successCount} lead(s) deleted successfully`);
    }
    if (failCount > 0) {
      notify.error(
        `${failCount} lead(s) failed to delete` +
        (failMessages[0] ? `: ${failMessages[0]}` : "")
      );
    }

    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <div className="w-full">
      <SuperTable
        tableId="leads-table"
        urlKey=""
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
        entityLabel="lead"
        searchPlaceholder="Cari nama lead, sumber, atau penanggung jawab"
        filters={[
          {
            id: "lead_status",
            label: "Status",
            type: "select",
            options: LEAD_STATUSES.map((v) => ({ value: v, label: v })),
          },
          {
            id: "lead_source",
            label: "Sumber",
            type: "select",
            options: LEAD_SOURCES.map((v) => ({ value: v, label: v })),
          },
        ]}
        features={{
          urlSync: true,
          globalFilter: true,
          facetedValues: true,
          sorting: true,
          pagination: true,
          rowSelection: "multi",
          densityToggle: true,
          fullScreenToggle: true,
          export: {
            excel: true,
            csv: true,
          },
        }}
        onStateChange={onStateChange}
        autoResetPageIndex={false}
        onRowClick={(row) => openDetail(row)}
        rowActions={[
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            destructive: true,
            onClick: (row) => setLeadToDelete(row),
          },
        ]}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <div className="flex gap-2 items-center">
            <AppButton
              variantStyle="danger"
              startIcon={<Trash2 size={16} />}
              disabled={isBulkDeleting}
              onClick={() =>
                setBulkDeleteTarget({
                  leads: selectedRows as Lead[],
                  clearSelection,
                })
              }
            >
              {isBulkDeleting ? "Deleting..." : `Delete (${selectedRows.length})`}
            </AppButton>
          </div>
        )}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        lead={selectedLead}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationPopup
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={confirmDeleteLead}
        title="Are you sure?"
        description={`Are you sure you want to delete lead "${leadToDelete?.contact?.name ?? ""}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationPopup
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={performBulkDelete}
        title={`Delete ${bulkDeleteTarget?.leads.length ?? 0} lead(s)?`}
        description="The selected leads will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
