// components/email-marketing/mailing-lists/MailingListsTable.tsx
"use client";

import { Box } from '@mui/material';
import { format } from 'date-fns';
import { Mail, Plus } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { DeleteButton, EditButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';
import { fetchMailingLists } from '@/lib/api';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { notify } from '@/lib/notifications';
import { MailingList } from '@/lib/types/email-marketing';

interface MailingListsTableProps {
  onAdd: () => void;
  onEdit: (list: MailingList) => void;
  onDeleteRequest: (list: MailingList) => void;
  refreshTrigger: number;
}

const MailingListsTable = ({ onAdd, onEdit, onDeleteRequest }: MailingListsTableProps) => {
  const router = useRouter();

  // Server-side pagination + search driven by SuperTable state
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 10,
    globalFilter: '',
  });

  const { data, isLoading, isError, error, refetch } = useMailingLists(
    tableState.pageIndex + 1,
    tableState.pageSize,
    tableState.globalFilter
  );

  const lists = data?.data?.mailing_lists || [];
  const totalCount = data?.data?.total || 0;

  useEffect(() => {
    if (isError && error) {
      notify.error('Failed to fetch mailing lists.');
    }
  }, [isError, error]);

  // Export the full (searched) set, not just the visible page
  const handleExportRequest = async (params: { format: 'csv' | 'excel'; currentState: SuperTableState }) => {
    const token = Cookies.get('access_token');
    if (!token) return [];
    try {
      const LIMIT_PER_PAGE = 100;
      let allData: MailingList[] = [];
      let currentPage = 1;
      let totalPages = 1;
      do {
        const res = await fetchMailingLists(token, currentPage, LIMIT_PER_PAGE, params.currentState.globalFilter);
        allData = [...allData, ...(res?.data?.mailing_lists || [])];
        totalPages = res?.data?.total_pages || 1;
        currentPage++;
      } while (currentPage <= totalPages);
      return allData;
    } catch (err) {
      console.error('Export error:', err);
      return [];
    }
  };

  const columns = useMemo<MRT_ColumnDef<MailingList>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        Cell: ({ cell }) => (
          <span className="font-semibold text-gray-900">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'subscriber_count',
        header: 'Subscribers',
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
    <SuperTable<MailingList>
      tableId="mailing-lists-table"
      columns={columns}
      data={lists}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load mailing lists. Please try again."
      onRetry={() => refetch()}
      manualPagination={true}
      manualFiltering={true}
      rowCount={totalCount}
      onStateChange={(state) => {
        setTableState({
          pageIndex: state.pagination.pageIndex,
          pageSize: state.pagination.pageSize,
          globalFilter: state.globalFilter,
        });
      }}
      onExportRequest={handleExportRequest as any}
      onRowClick={(row) => router.push(`/email-marketing/mailing-lists/${row.id}`)}
      renderTopLeftToolbar={() => (
        <AppButton
          variantStyle="primary"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
        >
          Add Mailing List
        </AppButton>
      )}
      renderRowActions={({ row }) => (
        <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
          <EditButton onClick={() => onEdit(row.original)} />
          <DeleteButton onClick={() => onDeleteRequest(row.original)} />
        </Box>
      )}
      renderEmptyState={() => (
        <EmptyState
          icon={Mail}
          title="No mailing lists yet"
          description="Create a mailing list to start collecting subscribers."
          action={{ label: 'Add Mailing List', onClick: onAdd, icon: <Plus size={16} /> }}
        />
      )}
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
      features={{
        // API has no sort params - avoid a misleading page-only sort
        sorting: false,
        globalFilter: true,
        columnFilters: false,
        pagination: true,
        export: { excel: true, csv: true },
      }}
    />
  );
};

export default MailingListsTable;
