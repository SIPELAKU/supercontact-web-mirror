// components/whatsapp-marketing/group-broadcasting/GroupBroadcastingTable.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';
import { GroupBroadcast } from '@/lib/types/whatsapp-marketing';
import { Box } from '@mui/material';
import { format } from 'date-fns';
import { Megaphone, Plus, Copy, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface GroupBroadcastingTableProps {
  broadcasts: GroupBroadcast[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  totalCount: number;
  restartKey?: number;
  onStateChange: (state: SuperTableState) => void;
  onAdd: () => void;
  onEdit: (broadcast: GroupBroadcast) => void;
  onDuplicate: (ids: string[], clearSelection?: () => void) => void;
  /** Ids of a duplicate still in flight, for the spinner on their rows. */
  duplicatingIds: string[];
  onDeleteRequest: (broadcast: GroupBroadcast) => void;
  onBulkDeleteRequest: (ids: string[]) => void;
}

const GroupBroadcastingTable = ({
  broadcasts,
  isLoading,
  isError,
  onRetry,
  totalCount,
  restartKey,
  onStateChange,
  onAdd,
  onEdit,
  onDuplicate,
  duplicatingIds,
  onDeleteRequest,
  onBulkDeleteRequest,
}: GroupBroadcastingTableProps) => {
  const router = useRouter();

  const columns = useMemo<MRT_ColumnDef<GroupBroadcast>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        Cell: ({ cell }) => (
          <span className="font-semibold text-gray-900">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'recipient_count',
        header: 'Recipients',
        size: 120,
        Cell: ({ cell }) => <>{cell.getValue<number>()?.toLocaleString() ?? 0}</>,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return (
            <span className="text-sm text-gray-600">
              {value ? format(new Date(value), 'dd MMM yyyy, HH:mm') : '-'}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <SuperTable<GroupBroadcast>
      entityLabel="grup broadcast"
      searchPlaceholder="Cari nama grup"
      tableId="group-broadcasting-table"
      urlKey=""
      columns={columns}
      data={broadcasts}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load group broadcasts. Please try again."
      onRetry={onRetry}
      manualPagination={true}
      rowCount={totalCount}
      restartKey={restartKey}
      onStateChange={onStateChange}
      primaryColumn={{
        accessorKey: 'name',
        href: (row) => `/whatsapp-marketing/group-broadcasting/${row.id}`,
      }}
      onRowClick={(row) => router.push(`/whatsapp-marketing/group-broadcasting/${row.id}`)}
      renderTopLeftToolbar={() => (
        <AppButton
          variantStyle="primary"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
        >
          Add Group
        </AppButton>
      )}
      renderBulkActions={({ selectedRows, clearSelection }) => {
        const rows = selectedRows as GroupBroadcast[];
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <AppButton
              variantStyle="outline"
              color="primary"
              startIcon={<Copy className="w-4 h-4" />}
              onClick={() => onDuplicate(rows.map((b) => b.id), clearSelection)}
              disabled={duplicatingIds.length > 0}
            >
              Duplicate ({rows.length})
            </AppButton>
            <AppButton
              variantStyle="danger"
              color="danger"
              startIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                // Parent owns the confirmation + delete; clear here so no
                // stale selection lingers over the refreshed list.
                onBulkDeleteRequest(rows.map((b) => b.id));
                clearSelection();
              }}
            >
              Delete ({rows.length})
            </AppButton>
          </Box>
        );
      }}
      rowActions={[
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: <Copy size={16} />,
          isLoading: (row) => duplicatingIds.includes(row.id),
          onClick: (row) => onDuplicate([row.id]),
        },
        {
          id: 'edit',
          label: 'Edit',
          icon: <Pencil size={16} />,
          onClick: (row) => onEdit(row),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 size={16} />,
          destructive: true,
          onClick: (row) => onDeleteRequest(row),
        },
      ]}
      renderEmptyState={() => (
        <EmptyState
          icon={Megaphone}
          title="No group broadcasts yet"
          description="Create a broadcast group to send WhatsApp campaigns to a set of recipients."
          action={{ label: 'Add Group', onClick: onAdd, icon: <Plus size={16} /> }}
        />
      )}
      features={{
          urlSync: true,
        // API has no sort/search params yet - keep both off rather than
        // offering controls that only act on the loaded page
        sorting: false,
        globalFilter: false,
        columnFilters: false,
        pagination: true,
        rowSelection: 'multi',
      }}
    />
  );
};

export default GroupBroadcastingTable;
