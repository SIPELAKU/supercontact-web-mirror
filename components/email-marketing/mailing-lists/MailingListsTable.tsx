// components/email-marketing/mailing-lists/MailingListsTable.tsx
"use client";

import { format } from 'date-fns';
import { Mail, Pencil, Plus, Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';
import { fetchMailingLists } from '@/lib/api';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { notify } from '@/lib/notifications';
import { MailingList } from '@/lib/types/email-marketing';
import { EXPORT_MAX_PAGES, EXPORT_PAGE_SIZE } from '@/lib/constants/export';

interface MailingListsTableProps {
  onAdd: () => void;
  onEdit: (list: MailingList) => void;
  onDeleteRequest: (list: MailingList) => void;
}

const columns: MRT_ColumnDef<MailingList>[] = [
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
    size: 130,
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
];

const MailingListsTable = ({ onAdd, onEdit, onDeleteRequest }: MailingListsTableProps) => {
  const router = useRouter();

  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 25,
    globalFilter: '',
    sorting: [] as { id: string; desc: boolean }[],
  });

  const sort = tableState.sorting[0];
  const sortBy = sort?.id;
  const sortOrder: 'asc' | 'desc' | undefined = sort ? (sort.desc ? 'desc' : 'asc') : undefined;

  const { data, isLoading, isFetching, isError, error, refetch } = useMailingLists(
    tableState.pageIndex + 1,
    tableState.pageSize,
    tableState.globalFilter,
    sortBy,
    sortOrder
  );

  const lists = data?.data?.mailing_lists || [];
  const totalCount = data?.data?.total || 0;

  useEffect(() => {
    if (isError && error) {
      notify.error('Failed to fetch mailing lists.');
    }
  }, [isError, error]);

  const handleExportRequest = useCallback(
    async ({ onProgress }: { onProgress?: (fetched: number, total: number) => void }) => {
      const token = Cookies.get('access_token');
      if (!token) return [];
      let allData: MailingList[] = [];
      let currentPage = 1;
      let totalPages = 1;
      do {
        const res = await fetchMailingLists(
          token,
          currentPage,
          EXPORT_PAGE_SIZE,
          tableState.globalFilter,
          sortBy,
          sortOrder
        );
        allData = [...allData, ...(res?.data?.mailing_lists || [])];
        totalPages = Math.min(res?.data?.total_pages || 1, EXPORT_MAX_PAGES);
        onProgress?.(allData.length, res?.data?.total || allData.length);
        currentPage++;
      } while (currentPage <= totalPages);
      return allData;
    },
    [tableState.globalFilter, sortBy, sortOrder]
  );

  return (
    <SuperTable<MailingList>
      entityLabel="mailing list"
      searchPlaceholder="Cari nama mailing list"
      tableId="mailing-lists-table"
      urlKey=""
      exportFileName="Mailing Lists"
      columns={columns}
      data={lists}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      errorMessage="Failed to load mailing lists. Please try again."
      onRetry={() => refetch()}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      rowCount={totalCount}
      onStateChange={(state: SuperTableState) => {
        setTableState((prev) => {
          const searchChanged = state.globalFilter !== prev.globalFilter;
          const sizeChanged = state.pagination.pageSize !== prev.pageSize;
          return {
            // manualPagination turns off TanStack's autoResetPageIndex, so this
            // reset has to be explicit — otherwise searching from page 4 asks
            // for page 4 of the filtered result and shows an empty table.
            pageIndex: searchChanged || sizeChanged ? 0 : state.pagination.pageIndex,
            pageSize: state.pagination.pageSize,
            globalFilter: state.globalFilter,
            sorting: state.sorting || [],
          };
        });
      }}
      onExportRequest={handleExportRequest as any}
      // The name is the way in: a real link, so it works with middle-click,
      // Cmd-click and the keyboard. Row click stays as a mouse convenience.
      primaryColumn={{
        accessorKey: 'name',
        href: (row) => `/email-marketing/mailing-lists/${row.id}`,
      }}
      onRowClick={(row) => router.push(`/email-marketing/mailing-lists/${row.id}`)}
      rowActions={[
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
          icon={Mail}
          title="No mailing lists yet"
          description="Create a mailing list to start collecting subscribers."
          action={{ label: 'Add Mailing List', onClick: onAdd, icon: <Plus size={16} /> }}
        />
      )}
      features={{
        // The API grew sort_by/sort_order (name, subscriber_count, created_at),
        // so this list is no longer stuck on newest-first.
        sorting: true,
        globalFilter: true,
        columnFilters: false,
        pagination: true,
        columnVisibility: true,
        densityToggle: true,
        fullScreenToggle: true,
        urlSync: true,
        export: { excel: true, csv: true },
      }}
    />
  );
};

export default MailingListsTable;
