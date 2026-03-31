// components/whatsapp-marketing/recipients/RecipientsTable.tsx
"use client";

import { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import { DeleteButton, EditButton, DuplicateButton } from '@/components/ui/app-action-buttons-table';
import type { WaRecipient } from '@/lib/types/whatsapp-marketing';

interface RecipientsTableProps {
  recipients: WaRecipient[];
  isLoading: boolean;
  totalCount: number;
  onAdd: () => void;
  onEdit: (recipient: WaRecipient) => void;
  onDeleteRequest: (ids: string[]) => void;
  onDeleteAll?: () => void;
  onDuplicate?: (ids: string[], target: string) => void;
  onStateChange: (state: { page: number; limit: number; search: string }) => void;
  isDuplicating?: boolean;
}

const RecipientsTable = ({
  recipients,
  isLoading,
  totalCount,
  onAdd,
  onEdit,
  onDeleteRequest,
  onDeleteAll,
  onDuplicate,
  onStateChange,
  isDuplicating,
}: RecipientsTableProps) => {
  const columns = useMemo<MRT_ColumnDef<WaRecipient>[]>(
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
    <SuperTable<WaRecipient>
      tableId="wa-recipients-table"
      data={recipients}
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
      initialState={{
        pagination: {
          pageIndex: 0,
          pageSize: 5,
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
          <EditButton onClick={() => onEdit(row.original)} />
          <DuplicateButton onClick={() => onDuplicate && onDuplicate([row.original.id], 'recipient')} />
          <DeleteButton onClick={() => onDeleteRequest([row.original.id])} />
        </Box>
      )}
    />
  );
};

export default RecipientsTable;
