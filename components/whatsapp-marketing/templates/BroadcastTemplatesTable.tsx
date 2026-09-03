// components/whatsapp-marketing/templates/BroadcastTemplatesTable.tsx
"use client";

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import type { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';
import { primaryContentType } from '@/lib/utils/whatsapp-template';
import { Stack } from '@mui/material';
import { Copy, Trash2, LayoutTemplate } from 'lucide-react';
import { TemplateApprovalStatusBadge } from './TemplateApprovalBadge';
import { EmptyState } from '@/components/ui/empty-state';

interface BroadcastTemplatesTableProps {
  templates: BroadcastTemplate[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
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
  isError,
  errorMessage,
  onRetry,
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
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'types',
        header: 'Content Type',
        Cell: ({ row }) => {
          // The template's REAL type, not its text fallback. Every rich type
          // ships a `twilio/text` beside it and JSONB sorts keys by length, so
          // `Object.keys(types)[0]` was `twilio/text` for every rich template.
          const primary = primaryContentType(row.original.types);
          return primary ? primary.replace(/^(twilio|whatsapp)\//, '') : '-';
        },
      },
      {
        accessorKey: 'whatsapp_approval_status',
        header: 'Approval Status',
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
      isError={isError}
      errorMessage={errorMessage}
      onRetry={onRetry}
      renderEmptyState={() => (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates found"
          description="Create a WhatsApp template and submit it for approval to start broadcasting."
          action={{ label: "Create Template", onClick: onCreate, icon: <Plus size={16} /> }}
        />
      )}
      manualPagination={true}
      manualFiltering={true}
      onStateChange={(state) => {
        onStateChange({
          page: state.pagination.pageIndex + 1,
          limit: state.pagination.pageSize,
          search: state.globalFilter || '',
        });
      }}
      entityLabel="template"
      searchPlaceholder="Cari nama template atau SID"
      // The name/language text boxes and the approval-status dropdown are
      // gone: GET /broadcast-templates accepts page, limit, search and
      // account_id, so with `manualFiltering` on none of the three ever
      // reached the server. Approval status is worth having back as a real
      // filter once the endpoint can honour it.
      features={{
        globalFilter: true,
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
          <span className="hidden sm:inline">Create Template</span>
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
      rowActions={[
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: <Copy size={16} />,
          onClick: (row) => onDuplicate([row.id]),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 size={16} />,
          destructive: true,
          onClick: (row) => onDeleteRequest([row.id]),
        },
      ]}
      onRowClick={(row) => onEdit(row)}
      getRowClassName={() => 'group'}
    />
  );
};

export default BroadcastTemplatesTable;
