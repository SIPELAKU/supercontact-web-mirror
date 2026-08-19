"use client";

import { useState, useCallback } from "react";
import { Contact } from "@/lib/models/types";
import { SuperTable } from "@/components/ui/super-table";
import type { SuperTableState } from "@/components/ui/super-table";
import { contactColumns } from "./columns";
import { DeleteButton, EditButton, DuplicateButton } from "@/components/ui/app-action-buttons-table";
import { AppButton } from "@/components/ui/app-button";
import { Eye, X, Mail, Phone, Building2, MapPin, Briefcase, Calendar, Plus, Download, Trash2, Save, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, Chip, Divider, Stack } from "@mui/material";
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
  const [previewContact, setPreviewContact] = useState<Contact | null>(null);
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
        features={{
          globalFilter: true,
          globalFilterAlwaysVisible: false,
          columnFilters: true,
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
        onRowClick={(row) => onDetail(row)}
        renderRowActions={({ row }) => (
          <div className="flex gap-1">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewContact(row.original);
              }}
              sx={{ color: '#5479EE', '&:hover': { bgcolor: '#EEF2FF' } }}
            >
              <Eye size={18} />
            </IconButton>
            <Box onClick={(e) => e.stopPropagation()}>
              <EditButton onClick={() => onEdit(row.original)} />
            </Box>
            <Box onClick={(e) => e.stopPropagation()}>
              <DuplicateButton onClick={() => onDuplicate?.([row.original])} />
            </Box>
            <Box onClick={(e) => e.stopPropagation()}>
              <DeleteButton onClick={() => onDelete(row.original)} />
            </Box>
          </div>
        )}
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

      {/* Contact Preview Dialog */}
      <Dialog
        open={Boolean(previewContact)}
        onClose={() => setPreviewContact(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        {previewContact && (
          <>
            {/* Header */}
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1, pt: 3, px: 3,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#5479EE] flex items-center justify-center text-white text-lg font-bold">
                  {previewContact.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <Typography variant="h6" fontWeight={700}>{previewContact.name}</Typography>
                  {previewContact.position && (
                    <Typography variant="body2" color="text.secondary">{previewContact.position}</Typography>
                  )}
                </div>
              </div>
              <IconButton onClick={() => setPreviewContact(null)} size="small">
                <X size={20} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
              <Divider sx={{ mb: 2.5 }} />

              {/* Contact Info Grid */}
              <div className="space-y-3">
                {previewContact.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Mail size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{previewContact.email}</p>
                    </div>
                  </div>
                )}
                {previewContact.phone_number && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Phone size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{previewContact.phone_number}</p>
                    </div>
                  </div>
                )}
                {previewContact.company && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Building2 size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm font-medium text-gray-900">{previewContact.company}</p>
                    </div>
                  </div>
                )}
                {previewContact.position && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Briefcase size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="text-sm font-medium text-gray-900">{previewContact.position}</p>
                    </div>
                  </div>
                )}
                {previewContact.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                      <MapPin size={16} className="text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{previewContact.address}</p>
                    </div>
                  </div>
                )}
                {previewContact.created_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Calendar size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(previewContact.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {/* Subscription Status */}
                <div className="flex items-center gap-2">
                  <Chip
                    label={previewContact.is_subscriber ? "Subscribed" : "Not Subscribed"}
                    size="small"
                    color={previewContact.is_subscriber ? "success" : "default"}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </div>
                {/* Recipient Status */}
                <div className="flex items-center gap-2">
                  <Chip
                    label={previewContact.is_recipient ? "Recipient" : "Not Recipient"}
                    size="small"
                    color={previewContact.is_recipient ? "success" : "default"}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </div>
              </Stack>

              {/* Custom Fields */}
              {previewContact.custom_fields && Object.keys(previewContact.custom_fields).length > 0 && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Additional Info
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(previewContact.custom_fields).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-5">
                <AppButton
                  variantStyle="primary"
                  color="primary"
                  className="flex-1"
                  onClick={() => {
                    const contact = previewContact;
                    setPreviewContact(null);
                    onDetail(contact);
                  }}
                >
                  View Full Details
                </AppButton>
                <AppButton
                  variantStyle="outline"
                  color="primary"
                  onClick={() => {
                    const contact = previewContact;
                    setPreviewContact(null);
                    onEdit(contact);
                  }}
                >
                  Edit
                </AppButton>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>

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
