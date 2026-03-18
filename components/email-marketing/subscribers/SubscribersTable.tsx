// components/email-marketing/subscribers/SubscribersTable.tsx
"use client";

import { useMemo, useState } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import { DeleteButton, EditButton } from '@/components/ui/app-action-buttons-table';
import { Subscriber } from '@/lib/types/email-marketing';
import { SubscriberPreviewPopup } from './SubscriberPreviewPopup';

interface SubscribersTableProps {
  subscribers: Subscriber[];
  isLoading: boolean;
  totalCount: number;
  onAdd: () => void;
  onEdit: (subscriber: Subscriber) => void;
  onDeleteRequest: (ids: string[]) => void;
  onImport: () => void;
  onDeleteAllRequest: () => void;
  onExportRequest?: (params: any) => Promise<Subscriber[]>;
  onStateChange: (state: { page: number; limit: number; search: string }) => void;
}

const SubscribersTable = ({
  subscribers,
  isLoading,
  totalCount,
  onAdd,
  onEdit,
  onDeleteRequest,
  onImport,
  onDeleteAllRequest,
  onExportRequest,
  onStateChange,
}: SubscribersTableProps) => {
  const [previewSubscriber, setPreviewSubscriber] = useState<Subscriber | null>(null);

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
        manualPagination={true}
        manualSorting={false}
        manualFiltering={false}
        onStateChange={(state) => {
          onStateChange({
            page: state.pagination.pageIndex + 1,
            limit: state.pagination.pageSize,
            search: state.globalFilter || '',
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
                onClick={onImport}
                startIcon={<Download size={16} />}
              >
                Import
              </AppButton>
              <AppButton
                variantStyle="primary"
                onClick={onAdd}
                startIcon={<Plus size={16} />}
              >
                Add Subscriber
              </AppButton>
            </div>

            {/* Mobile: Icon only */}
            <div className="flex md:hidden gap-2">
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
          <AppButton
            variantStyle="outline"
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
            <DeleteButton onClick={() => onDeleteRequest([row.original.id])} />
          </Box>
        )}
      />

      <SubscriberPreviewPopup
        subscriber={previewSubscriber}
        onClose={() => setPreviewSubscriber(null)}
      />
    </>
  );
};

export default SubscribersTable;
