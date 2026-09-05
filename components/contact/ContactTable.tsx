"use client";

import { useState, useCallback, useMemo } from "react";
import { Contact } from "@/lib/models/types";
import { useActiveCustomerTypes, useRegionTree } from "@/lib/hooks/useCommercialContext";
import { useActiveContactTags, useBulkTagContacts } from "@/lib/hooks/useContactTags";
import { tagChipStyle } from "@/lib/utils/contactTags";
import { AppDialog } from "@/components/ui/app-dialog";
import { notify } from "@/lib/notifications";
import { usePermission } from "@/lib/hooks/usePermission";
import { flattenTree } from "@/lib/utils/categoryTree";
import { SuperTable } from "@/components/ui/super-table";
import type { SuperTableState } from "@/components/ui/super-table";
import { contactColumns } from "./columns";
import { AppButton } from "@/components/ui/app-button";
import { Eye, X, Mail, Phone, Building2, MapPin, Briefcase, Calendar, Plus, Download, Trash2, Save, Tag, Users, Pencil, Copy } from "lucide-react";
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
  // Phase 3 filter sources. All three are single-page reads whose grants a
  // contacts user already holds (spec A27: types and regions read on
  // `contacts` | `companies` | `quotations` | `sales:config:manage`; tags read
  // on `contacts`), so none of them 403s for a normal seller.
  const { data: customerTypes } = useActiveCustomerTypes();
  const { data: regionTree } = useRegionTree();
  const { data: tagPage } = useActiveContactTags();

  // A filter is declared ONLY when it has options. The rationale this file
  // already carried - "a control that silently does nothing is worse than no
  // control" - applies just as much to a select with an empty list: a tenant
  // that has not created a single customer type would get three chips that
  // filter to nothing. Each one appears the moment its vocabulary exists.
  const contactFilters = useMemo(() => {
    const typeOptions = (customerTypes?.items ?? []).map((type) => ({
      value: type.id,
      label: type.name,
    }));
    const regionOptions = flattenTree(regionTree ?? []).map((node) => ({
      value: node.id,
      label: node.label,
    }));
    const tagOptions = (tagPage?.items ?? []).map((tag) => ({
      value: tag.id,
      label: tag.name,
    }));
    return [
      ...(typeOptions.length > 0
        ? [{ id: "customer_type_id", label: "Tipe Pelanggan", type: "select" as const, options: typeOptions }]
        : []),
      ...(regionOptions.length > 0
        ? [{ id: "region_id", label: "Wilayah", type: "select" as const, options: regionOptions }]
        : []),
      // AND across ids, matching the platform's token-search AND semantics
      // (spec A0.1): picking VIP and Reseller returns the contacts that carry
      // BOTH, not either.
      ...(tagOptions.length > 0
        ? [{ id: "tag_ids", label: "Tag", type: "multiselect" as const, options: tagOptions }]
        : []),
    ];
  }, [customerTypes, regionTree, tagPage]);

  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);

  // Bulk tagging (spec A0.1). One tag added to - or removed from - the checked
  // contacts, which is the only way to tag a set without opening each record.
  // Both directions are idempotent server-side, so re-running is harmless.
  const { can } = usePermission();
  const canTag = can("contacts");
  const bulkTagMutation = useBulkTagContacts();
  const [tagDialog, setTagDialog] = useState<{
    ids: string[];
    clearSelection: () => void;
  } | null>(null);

  const runBulkTag = async (tagId: string, action: "add" | "remove") => {
    if (!tagDialog) return;
    try {
      const result = await bulkTagMutation.mutateAsync({
        contact_ids: tagDialog.ids,
        tag_id: tagId,
        action,
      });
      const skipped = result.skipped
        ? `, ${result.skipped} sudah sesuai`
        : "";
      notify.success(
        action === "add" ? "Tag dipasang" : "Tag dilepas",
        { description: `${result.affected} kontak diperbarui${skipped}.` }
      );
      // `not_found` is how the endpoint reports ids that are not this
      // tenant's contacts - or that this user cannot see under
      // `contacts_cross_user_visibility` - instead of 404-ing the batch.
      // Without this the user is told the whole batch succeeded.
      if (result.not_found.length > 0) {
        notify.warning("Sebagian kontak dilewati", {
          description: `${result.not_found.length} kontak tidak ditemukan atau di luar akses Anda.`,
        });
      }
      tagDialog.clearSelection();
      setTagDialog(null);
      onSuccess?.();
    } catch (error: any) {
      notify.error("Gagal memperbarui tag", { description: error?.message });
    }
  };

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
        // The in-code rationale that used to sit here - "GET /contacts takes
        // exactly page, limit, search, include_all, sort_by and sort_order, so
        // a filter control here would silently do nothing" - is SATISFIED as
        // of Phase 3: the endpoint now takes `customer_type_id`, `region_id`
        // and repeated `tag_ids` (spec A0.1, E8), and ContactClient forwards
        // `state.filters` to all three. Per-column text filters stay off; a
        // control that silently does nothing is still worse than no control.
        filters={contactFilters}
        features={{
          // Every column here carries an explicit `size`, which virtualization
          // requires: it forces MRT into `layoutMode: 'grid'`, where widths come
          // from the column def instead of the browser's natural table layout.
          virtualize: true,
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
            {canTag && (tagPage?.items ?? []).length > 0 && (
              <AppButton
                variantStyle="outline"
                startIcon={<Tag size={16} />}
                onClick={() =>
                  setTagDialog({
                    ids: selectedRows.map((r) => r.id),
                    clearSelection,
                  })
                }
              >
                {`Tag (${selectedRows.length})`}
              </AppButton>
            )}
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


      <AppDialog
        open={tagDialog !== null}
        onClose={() => setTagDialog(null)}
        title="Tag kontak terpilih"
        description={`${tagDialog?.ids.length ?? 0} kontak. Memasang tag yang sudah menempel tidak menggandakannya.`}
        maxWidth="sm"
        actions={
          <AppButton variantStyle="outline" onClick={() => setTagDialog(null)}>
            Tutup
          </AppButton>
        }
      >
        <div className="flex flex-col gap-2">
          {(tagPage?.items ?? []).map((tag) => (
            <div key={tag.id} className="flex items-center justify-between gap-3">
              <span
                className="rounded-[8px] px-3 py-1 text-xs font-medium"
                style={tagChipStyle(tag.color)}
              >
                {tag.name}
              </span>
              <div className="flex gap-2">
                <AppButton
                  variantStyle="outline"
                  disabled={bulkTagMutation.isPending}
                  onClick={() => runBulkTag(tag.id, "add")}
                >
                  Pasang
                </AppButton>
                <AppButton
                  variantStyle="outline"
                  color="danger"
                  disabled={bulkTagMutation.isPending}
                  onClick={() => runBulkTag(tag.id, "remove")}
                >
                  Lepas
                </AppButton>
              </div>
            </div>
          ))}
        </div>
      </AppDialog>

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
