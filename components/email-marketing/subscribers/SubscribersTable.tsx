// components/email-marketing/subscribers/SubscribersTable.tsx
"use client";

import { useMemo, useState } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { Download, Eye, Pencil, Plus, Trash2, Save, History, MailPlus } from 'lucide-react';
import { SaveAsModal } from "@/components/modal/SaveAsModal";
import { EmptyState } from '@/components/ui/empty-state';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import { DeleteButton, EditButton, DuplicateButton } from '@/components/ui/app-action-buttons-table';
import { Subscriber } from '@/lib/types/email-marketing';
import { SubscriberPreviewPopup } from './SubscriberPreviewPopup';

interface SubscribersTableProps {
  subscribers: Subscriber[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  totalCount: number;
  onAdd: () => void;
  onEdit: (subscriber: Subscriber) => void;
  onDeleteRequest: (ids: string[]) => void;
  onImport: () => void;
  onImportHistory: () => void;
  onDeleteAllRequest: () => void;
  onExportRequest?: (params: any) => Promise<Subscriber[]>;
  onStateChange: (state: { page: number; limit: number; search: string; sorting: { id: string; desc: boolean }[] }) => void;
  onDuplicate?: (ids: string[]) => void;
  isDuplicating?: boolean;
  onSuccess?: () => void;
}

const SubscribersTable = ({
  subscribers,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  totalCount,
  onAdd,
  onEdit,
  onDeleteRequest,
  onImport,
  onImportHistory,
  onDeleteAllRequest,
  onExportRequest,
  onStateChange,
  onDuplicate,
  isDuplicating,
  onSuccess,
}: SubscribersTableProps) => {
  const [previewSubscriber, setPreviewSubscriber] = useState<Subscriber | null>(null);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);

  const columns = useMemo<MRT_ColumnDef<Subscriber>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email',
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
      <SuperTable<Subscriber>
        tableId="subscribers-table"
        data={subscribers}
        columns={columns}
        rowCount={totalCount}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        renderEmptyState={() => (
          <EmptyState
            icon={MailPlus}
            title="No subscribers found"
            description="Add subscribers manually or import a list to start emailing."
            action={{ label: "Add Subscriber", onClick: onAdd, icon: <Plus size={16} /> }}
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
        onExportRequest={onExportRequest}
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
            {/* Desktop: Tombol dengan label */}
            <div className="hidden md:flex gap-2">
              <AppButton
                variantStyle="outline"
                onClick={onImportHistory}
                startIcon={<History size={16} />}
                className="whitespace-nowrap"
              >
                History
              </AppButton>
              <AppButton
                variantStyle="outline"
                onClick={onImport}
                startIcon={<Download size={16} />}
                className="whitespace-nowrap"
              >
                Import
              </AppButton>
              <AppButton
                variantStyle="primary"
                onClick={onAdd}
                startIcon={<Plus size={16} />}
                className="whitespace-nowrap"
              >
                Add Subscriber
              </AppButton>
            </div>

            {/* Mobile: Icon only */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={onImportHistory}
                className="flex items-center justify-center w-9 h-9 rounded-md border border-[#5479EE] text-[#5479EE] hover:bg-blue-50 transition-colors"
                title="History"
              >
                <History size={16} />
              </button>
              <button
                onClick={onImport}
                className="flex items-center justify-center w-9 h-9 rounded-md border border-[#5479EE] text-[#5479EE] hover:bg-blue-50 transition-colors"
                title="Import"
              >
                <Download size={16} />
              </button>
              <button
                onClick={onAdd}
                className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
                title="Add Subscriber"
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
                setSelectedIds((selectedRows as Subscriber[]).map((r) => r.id));
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
                const ids = (selectedRows as Subscriber[]).map((r) => r.id);
                if (onDuplicate) onDuplicate(ids);
                clearSelection();
              }}
            >
              {isDuplicating ? "Duplicating..." : `Duplicate (${selectedRows.length})`}
            </AppButton>
            <AppButton
              variantStyle="danger"
              color="danger"
              startIcon={<Trash2 size={16} />}
              onClick={() => {
                const ids = (selectedRows as Subscriber[]).map((r) => r.id);
                onDeleteRequest(ids);
                clearSelection();
              }}
            >
              {`Delete (${selectedRows.length})`}
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
                  setPreviewSubscriber(row.original);
                }}
                sx={{ color: '#5479EE', '&:hover': { bgcolor: '#EEF2FF' } }}
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
            <EditButton onClick={() => onEdit(row.original)} />
            <DuplicateButton onClick={() => onDuplicate && onDuplicate([row.original.id])} />
            <DeleteButton onClick={() => onDeleteRequest([row.original.id])} />
          </Box>
        )}
      />

      <SubscriberPreviewPopup
        subscriber={previewSubscriber}
        onClose={() => setPreviewSubscriber(null)}
      />

      <SaveAsModal
        open={isSaveAsModalOpen}
        onClose={() => setIsSaveAsModalOpen(false)}
        selectedIds={selectedIds}
        sourceType="subscriber"
        onSuccess={() => {
          if (clearSelectionFn) clearSelectionFn();
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};

export default SubscribersTable;
