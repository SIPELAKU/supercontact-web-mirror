// components/whatsapp-marketing/group-broadcasting/GroupBroadcastingTable.tsx
"use client";

import { DeleteButton, EditButton, DuplicateButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';
import { useGroupBroadcasts, useDuplicateGroupBroadcasts } from '@/lib/hooks/useGroupBroadcasts';
import { GroupBroadcast } from '@/lib/types/whatsapp-marketing';
import { Box } from '@mui/material';
import { format } from 'date-fns';
import { Megaphone, Plus, Copy, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/notifications';
import { useEffect, useMemo, useState } from 'react';

interface GroupBroadcastingTableProps {
  onAdd: () => void;
  onEdit: (broadcast: GroupBroadcast) => void;
  onDeleteRequest: (broadcast: GroupBroadcast) => void;
  onBulkDeleteRequest: (ids: string[]) => void;
  refreshTrigger: number;
}

const GroupBroadcastingTable = ({ onAdd, onEdit, onDeleteRequest, onBulkDeleteRequest }: GroupBroadcastingTableProps) => {
  const router = useRouter();

  // Server-side pagination (gained in Phase 1) driven by SuperTable state
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isError, error, refetch } = useGroupBroadcasts({
    page: tableState.pageIndex + 1,
    limit: tableState.pageSize,
  });
  const duplicateMutation = useDuplicateGroupBroadcasts();

  useEffect(() => {
    if (isError && error) {
      notify.error('Failed to fetch group broadcasts.');
    }
  }, [isError, error]);

  const broadcasts = data?.data?.broadcast_groups || [];
  const totalCount = data?.data?.total || 0;

  const handleDuplicate = async (ids: string[], clearSelection?: () => void) => {
    try {
      await duplicateMutation.mutateAsync({ broadcast_group_ids: ids });
      notify.success(`${ids.length} group(s) duplicated successfully.`);
      clearSelection?.();
    } catch (err: any) {
      notify.error(err.message || 'Failed to duplicate group(s).');
    }
  };

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
      tableId="group-broadcasting-table"
      urlKey=""
      columns={columns}
      data={broadcasts}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load group broadcasts. Please try again."
      onRetry={() => refetch()}
      manualPagination={true}
      rowCount={totalCount}
      onStateChange={(state) => {
        setTableState({
          pageIndex: state.pagination.pageIndex,
          pageSize: state.pagination.pageSize,
        });
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
              onClick={() => handleDuplicate(rows.map((b) => b.id), clearSelection)}
              disabled={duplicateMutation.isPending}
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
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <DuplicateButton
            onClick={() => handleDuplicate([row.original.id])}
            isLoading={duplicateMutation.isPending && (duplicateMutation.variables?.broadcast_group_ids || []).includes(row.original.id)}
          />
          <EditButton onClick={() => onEdit(row.original)} />
          <DeleteButton onClick={() => onDeleteRequest(row.original)} />
        </Box>
      )}
      renderEmptyState={() => (
        <EmptyState
          icon={Megaphone}
          title="No group broadcasts yet"
          description="Create a broadcast group to send WhatsApp campaigns to a set of recipients."
          action={{ label: 'Add Group', onClick: onAdd, icon: <Plus size={16} /> }}
        />
      )}
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
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
