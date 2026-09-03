"use client";

import { useState, useCallback } from "react";
import { Contact } from "@/lib/models/types";
import { SuperTable } from "@/components/ui/super-table";
import type { SuperTableState } from "@/components/ui/super-table";
import { contactColumns } from "./columns";
import { AppButton } from "@/components/ui/app-button";
import { Eye, X, Mail, Phone, Building2, MapPin, Briefcase, Calendar, Plus, Download, Trash2, Save, Users, Pencil, Copy } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Chip, Divider, Stack } from "@mui/material";
import { SaveAsModal } from "@/components/modal/SaveAsModal";

interface ContactTableProps {
  data: Contact[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  rowCount: number;

  onStateChange?: (state: SuperTableState) => void;
  onExportRequest?: (params: { format: 'csv' | 'excel'; currentState: SuperTableState }) => Promise<Contact[]> | Contact[];

  onEdit: (item: Contact) => void;
  onDelete: (item: Contact) => void;
  onDetail: (item: Contact) => void;
  onBulkDelete?: (contacts: Contact[], clearSelection: () => void) => void;
  onDuplicate?: (contacts: Contact[], clearSelection?: () => void) => void;
  onDeleteAll?: () => void;
  isDuplicating?: boolean;

  onOpenAdd: () => void;
  onOpenImport: () => void;
  onSuccess?: () => void;
}

export const ContactTable = ({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  rowCount,
  onStateChange,
  onExportRequest,
  onEdit,
  onDelete,
  onDetail,
  onBulkDelete,
  onDuplicate,
  onDeleteAll,
  onOpenAdd,
  onOpenImport,
  isDuplicating,
  onSuccess,
}: ContactTableProps) => {
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <>
      <SuperTable<Contact>
        tableId="contacts-table"
        urlKey=""
        data={data}
        columns={contactColumns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        rowCount={rowCount}
        renderEmptyState={() => (
          <EmptyState
            icon={Users}
            title="No contacts found"
            description="Add your first contact or import an existing list to get started."
            action={{ label: "Add Contact", onClick: onOpenAdd, icon: <Plus size={16} /> }}
          />
        )}
        manualPagination={true}
        manualFiltering={true}
        manualSorting={true}
        autoResetPageIndex={false}
        onStateChange={onStateChange}
        onExportRequest={onExportRequest}
        entityLabel="kontak"
        // The API splits this into words and requires each to match somewhere
        // in the record, so "budi jakarta" finds Budi in Jakarta. Naming the
        // fields here is what tells someone that is worth trying.
        searchPlaceholder="Cari nama, email, telepon, perusahaan, atau alamat"
        // No `filters` and no `columnFilters`. GET /contacts takes exactly
        // page, limit, search, include_all, sort_by and sort_order - there is
        // no filter parameter to send. It used to render a text filter under
        // every column anyway, with `manualFiltering` on and the page
        // forwarding only page/limit/search/sorting, so typing in any of them
        // did nothing at all. A control that silently does nothing is worse
        // than no control; the searchable fields are named in the placeholder
        // instead, which is what those boxes were being used to guess at.
        features={{
          urlSync: true,
          globalFilter: true,
          facetedValues: true,
          sorting: true,
          rowSelection: "multi",
          densityToggle: true,
          fullScreenToggle: true,
          export: {
            excel: true,
            csv: true,
          },
        }}
        onRowClick={(row) => onDetail(row)}
        rowActions={[
          {
            id: "edit",
            label: "Edit",
            icon: <Pencil size={16} />,
            onClick: (row) => onEdit(row),
          },
          {
            id: "duplicate",
            label: "Duplicate",
            icon: <Copy size={16} />,
            onClick: (row) => onDuplicate?.([row]),
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            destructive: true,
            onClick: (row) => onDelete(row),
          },
        ]}
        renderTopLeftToolbar={() => (
          <>
            {/* Desktop */}
            <div className="hidden md:flex gap-2">
              <AppButton
                onClick={onOpenImport}
                variantStyle="outline"
                color="primary"
                startIcon={<Download size={16} />}
              >
                Import
              </AppButton>
              <AppButton
                onClick={onOpenAdd}
                variantStyle="primary"
                startIcon={<Plus size={16} />}
              >
                Add Contact
              </AppButton>
            </div>

            {/* Mobile - icon only */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={onOpenImport}
                className="flex items-center justify-center w-9 h-9 rounded-md border border-[#5479EE] text-[#5479EE] hover:bg-blue-50 transition-colors"
                title="Import"
              >
                <Download size={16} />
              </button>
              <button
                onClick={onOpenAdd}
                className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
                title="Add Contact"
              >
                <Plus size={16} />
              </button>
            </div>
          </>
        )}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <div className="flex gap-2 items-center">
            <AppButton
              variantStyle="primary"
              color="success"
              startIcon={<Save size={16} />}
              onClick={() => {
                setSelectedIds(selectedRows.map(r => r.id));
                setClearSelectionFn(() => clearSelection);
                setIsSaveAsModalOpen(true);
              }}
            >
              Save As
            </AppButton>
            <AppButton
              variantStyle="primary"
              disabled={isDuplicating}
              onClick={() => onDuplicate?.(selectedRows, clearSelection)}
            >
              {isDuplicating ? "Duplicating..." : `Duplicate (${selectedRows.length})`}
            </AppButton>
            <AppButton
              variantStyle="danger"
              startIcon={<Trash2 size={16} />}
              onClick={() => onBulkDelete?.(selectedRows, clearSelection)}
            >
              {`Delete (${selectedRows.length})`}
            </AppButton>
            {onDeleteAll && (
              <AppButton
                variantStyle="soft"
                color="danger"
                startIcon={<Trash2 size={16} />}
                onClick={onDeleteAll}
              >
                Delete All Data
              </AppButton>
            )}
          </div>
        )}
      />


      <SaveAsModal
        open={isSaveAsModalOpen}
        onClose={() => setIsSaveAsModalOpen(false)}
        selectedIds={selectedIds}
        sourceType="contact"
        onSuccess={() => {
          if (clearSelectionFn) clearSelectionFn();
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};
