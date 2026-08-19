// components/whatsapp-marketing/templates/BroadcastTemplatesTable.tsx
"use client";

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import { DeleteButton, EditButton, DuplicateButton } from '@/components/ui/app-action-buttons-table';
import type { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';
import { Stack } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { TemplateApprovalStatusBadge } from './TemplateApprovalBadge';

interface BroadcastTemplatesTableProps {
  templates: BroadcastTemplate[];
  isLoading: boolean;
  totalCount: number;
  onStateChange: (state: { page: number; limit: number; search: string }) => void;
  onCreate: () => void;
  onEdit: (template: BroadcastTemplate) => void;
  onDuplicate: (ids: string[]) => void;
  onDeleteRequest: (ids: string[]) => void;
}

const BroadcastTemplatesTable = ({
  templates,
  isLoading,
  totalCount,
  onStateChange,
  onCreate,
  onEdit,
  onDuplicate,
  onDeleteRequest,
}: BroadcastTemplatesTableProps) => {
  const columns = useMemo<MRT_ColumnDef<BroadcastTemplate>[]>(
    () => [
      {
        accessorKey: 'friendly_name',
        header: 'Campaign Name',
        filterVariant: 'text',
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-[#5479EE] group-hover:underline">
              {row.original.friendly_name}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {row.original.provider_content_sid}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'language',
        header: 'Language',
        filterVariant: 'text',
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'types',
        header: 'Content Type',
        Cell: ({ row }) => {
          // This logic can be refined based on actual data structure of 'types'
          const types = row.original.types;
          const typeKeys = Object.keys(types);
          return typeKeys.length > 0 ? typeKeys[0].charAt(0).toUpperCase() + typeKeys[0].slice(1) : '-';
        },
      },
      {
        accessorKey: 'whatsapp_approval_status',
        header: 'Approval Status',
        filterVariant: 'text',
        Cell: ({ row }) => (
          <TemplateApprovalStatusBadge status={row.original.whatsapp_approval_status} />
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Updated',
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return date ? format(new Date(date), 'dd MMM yyyy, HH:mm') : '-';
        },
      },
    ],
    []
  );

  return (
    <SuperTable<BroadcastTemplate>
      tableId="broadcast-templates-table"
      data={templates}
      columns={columns}
      rowCount={totalCount}
      isLoading={isLoading}
      manualPagination={true}
      manualFiltering={true}
      onStateChange={(state) => {
        onStateChange({
          page: state.pagination.pageIndex + 1,
          limit: state.pagination.pageSize,
          search: state.globalFilter || '',
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
        urlSync: true,
      }}
      renderTopLeftToolbar={() => (
        <AppButton
          variantStyle="primary"
          onClick={onCreate}
          startIcon={<Plus size={16} />}
        >
          Create Template
        </AppButton>
      )}
      renderBulkActions={({ selectedRows, clearSelection }) => (
        <Stack direction="row" spacing={1}>
          <AppButton
            variantStyle="primary"
            onClick={() => {
              const ids = (selectedRows as BroadcastTemplate[]).map((r) => r.id);
              onDuplicate(ids);
              clearSelection();
            }}
          >
            Duplicate ({selectedRows.length})
          </AppButton>
          <AppButton
            variantStyle="danger"
            color="danger"
            startIcon={<Trash2 size={16} />}
            onClick={() => {
              const ids = (selectedRows as BroadcastTemplate[]).map((r) => r.id);
              onDeleteRequest(ids);
              clearSelection();
            }}
          >
            Delete ({selectedRows.length})
          </AppButton>
        </Stack>
      )}
      renderRowActions={({ row }) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <DuplicateButton onClick={(e) => { e.stopPropagation(); onDuplicate([row.original.id]); }} />
          <DeleteButton onClick={(e) => { e.stopPropagation(); onDeleteRequest([row.original.id]); }} />
        </Stack>
      )}
      onRowClick={(row) => onEdit(row)}
      getRowClassName={() => 'group'}
    />
  );
};

export default BroadcastTemplatesTable;
