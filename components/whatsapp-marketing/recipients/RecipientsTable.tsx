// components/whatsapp-marketing/recipients/RecipientsTable.tsx
"use client";

import { useMemo, useState } from 'react';
import { Box, Stack, IconButton, Tooltip } from '@mui/material';
import { Plus, Trash2, Upload, Eye, Save, MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import { DeleteButton, EditButton, DuplicateButton } from '@/components/ui/app-action-buttons-table';
import type { WaRecipient } from '@/lib/types/whatsapp-marketing';
import { WaRecipientPreviewPopup } from './WaRecipientPreviewPopup';
import { SaveAsModal } from "@/components/modal/SaveAsModal";

interface RecipientsTableProps {
  recipients: WaRecipient[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  totalCount: number;
  onAdd: () => void;
  onImport: () => void;
  onEdit: (recipient: WaRecipient) => void;
  onDeleteRequest: (ids: string[]) => void;
  onDeleteAll?: () => void;
  onDuplicate?: (ids: string[], target: string) => void;
  onStateChange: (state: { page: number; limit: number; search: string; sorting: { id: string; desc: boolean }[] }) => void;
  isDuplicating?: boolean;
  onSuccess?: () => void;
}

const RecipientsTable = ({
  recipients,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  totalCount,
  onAdd,
  onImport,
  onEdit,
  onDeleteRequest,
  onDeleteAll,
  onDuplicate,
  onStateChange,
  isDuplicating,
  onSuccess,
}: RecipientsTableProps) => {
  const [previewRecipient, setPreviewRecipient] = useState<WaRecipient | null>(null);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);

  const columns = useMemo<MRT_ColumnDef<WaRecipient>[]>(
    () => [
      {
        accessorKey: 'phone_number',
        header: 'Phone Number',
        filterVariant: 'text',
        Cell: ({ cell }) => (
          <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        filterVariant: 'text',
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'company',
        header: 'Company',
        filterVariant: 'text',
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'position',
        header: 'Position',
        filterVariant: 'text',
        Cell: ({ cell }) => cell.getValue<string>() || 'N/A',
      },
    ],
    []
  );

  return (
    <>
      <SuperTable<WaRecipient>
        tableId="wa-recipients-table"
        data={recipients}
        columns={columns}
        rowCount={totalCount}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={MessageSquare}
            title="No recipients found"
            description="Add recipients manually or import a list to start WhatsApp broadcasting."
            action={{ label: "Add Recipient", onClick: onAdd, icon: <Plus size={16} /> }}
          />
        )}
        manualPagination={true}
        manualSorting={true}
        manualFiltering={true}
        onStateChange={(state) => {
          onStateChange({
            page: state.pagination.pageIndex + 1,
            limit: state.pagination.pageSize,
            search: state.globalFilter || '',
            sorting: state.sorting || [],
          });
        }}
        initialState={{
          pagination: {
            pageIndex: 0,
            pageSize: 10,
          },
        }}
        features={{
          pagination: true,
          globalFilter: true,
          globalFilterAlwaysVisible: true,
          columnFilters: true,
          sorting: true,
          rowSelection: 'multi',
          columnVisibility: true,
          densityToggle: true,
          fullScreenToggle: true,
          export: { excel: true, csv: true },
          urlSync: true,
        }}
        renderTopLeftToolbar={() => (
          <>
            {/* Desktop */}
            <div className="hidden md:flex gap-2">
              <AppButton
                variantStyle="outline"
                onClick={onImport}
                startIcon={<Upload size={16} />}
                color="primary"
              >
                Import
              </AppButton>
              <AppButton
                variantStyle="primary"
                onClick={onAdd}
                startIcon={<Plus size={16} />}
              >
                Add Recipient
              </AppButton>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={onImport}
                className="flex items-center justify-center w-9 h-9 rounded-md border border-[#5479EE] text-[#5479EE] hover:bg-blue-50 transition-colors"
                title="Import Recipients"
              >
                <Upload size={16} />
              </button>
              <button
                onClick={onAdd}
                className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
                title="Add Recipient"
              >
                <Plus size={16} />
              </button>
            </div>
          </>
        )}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <Stack direction="row" spacing={1}>
            <AppButton
              variantStyle="primary"
              color="success"
              startIcon={<Save size={16} />}
              onClick={() => {
                setSelectedIds((selectedRows as WaRecipient[]).map((r) => r.id));
                setClearSelectionFn(() => clearSelection);
                setIsSaveAsModalOpen(true);
              }}
            >
              Save As
            </AppButton>
            <AppButton
              variantStyle="primary"
              disabled={isDuplicating}
              onClick={() => {
                const ids = (selectedRows as WaRecipient[]).map((r) => r.id);
                if (onDuplicate) onDuplicate(ids, 'recipient');
                clearSelection();
              }}
            >
              {isDuplicating ? 'Duplicating...' : `Duplicate (${selectedRows.length})`}
            </AppButton>
            <AppButton
              variantStyle="danger"
              color="danger"
              startIcon={<Trash2 size={16} />}
              onClick={() => {
                const ids = (selectedRows as WaRecipient[]).map((r) => r.id);
                onDeleteRequest(ids);
                clearSelection();
              }}
            >
              {`Deletes (${selectedRows.length})`}
            </AppButton>
            <AppButton
              variantStyle="soft"
              color="danger"
              startIcon={<Trash2 size={16} />}
              onClick={onDeleteAll}
            >
              Delete All Data
            </AppButton>
          </Stack>
        )}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Preview">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewRecipient(row.original);
                }}
                sx={{ color: '#5479EE', '&:hover': { bgcolor: '#EEF2FF' } }}
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
            <EditButton onClick={() => onEdit(row.original)} />
            <DuplicateButton onClick={() => onDuplicate && onDuplicate([row.original.id], 'recipient')} />
            <DeleteButton onClick={() => onDeleteRequest([row.original.id])} />
          </Box>
        )}
      />

      <WaRecipientPreviewPopup
        recipient={previewRecipient}
        onClose={() => setPreviewRecipient(null)}
      />

      <SaveAsModal
        open={isSaveAsModalOpen}
        onClose={() => setIsSaveAsModalOpen(false)}
        selectedIds={selectedIds}
        sourceType="recipient"
        onSuccess={() => {
          if (clearSelectionFn) clearSelectionFn();
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};

export default RecipientsTable;
