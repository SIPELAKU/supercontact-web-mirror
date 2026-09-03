// components/email-marketing/subscribers/SubscribersTable.tsx
"use client";

import { useMemo, useState } from 'react';
import { Stack } from '@mui/material';
import { Copy, MailPlus, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { SaveAsModal } from "@/components/modal/SaveAsModal";
import { EmptyState } from '@/components/ui/empty-state';

import { SuperTable } from '@/components/ui/super-table';
import type { MRT_ColumnDef } from '@/components/ui/super-table/types';
import { AppButton } from '@/components/ui/app-button';
import { Subscriber } from '@/lib/types/email-marketing';

interface SubscribersTableProps {
  subscribers: Subscriber[];
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  totalCount: number;
  onAdd: () => void;
  onEdit: (subscriber: Subscriber) => void;
  onDeleteRequest: (ids: string[]) => void;
  onExportRequest?: (params: any) => Promise<Subscriber[]>;
  onStateChange: (state: { page: number; limit: number; search: string; sorting: { id: string; desc: boolean }[] }) => void;
  onDuplicate?: (ids: string[]) => void;
  isDuplicating?: boolean;
  onSuccess?: () => void;
}

const SubscribersTable = ({
  subscribers,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onRetry,
  totalCount,
  onAdd,
  onEdit,
  onDeleteRequest,
  onExportRequest,
  onStateChange,
  onDuplicate,
  isDuplicating,
  onSuccess,
}: SubscribersTableProps) => {
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);

  // No `filterVariant` here on purpose. Those four text inputs used to render
  // as an always-visible subheader row, but `manualFiltering` meant MRT never
  // filtered locally and the page only forwarded page/limit/search/sorting to
  // the API - so typing in any of them did nothing at all. The subscribers
  // endpoint supports search and sort, and that is exactly what the toolbar
  // now offers.
  const columns = useMemo<MRT_ColumnDef<Subscriber>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email',
        size: 280,
        Cell: ({ cell }) => (
          <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 220,
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'company',
        header: 'Company',
        size: 220,
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
      {
        accessorKey: 'position',
        header: 'Position',
        size: 180,
        Cell: ({ cell }) => cell.getValue<string>() || '-',
      },
    ],
    []
  );

  return (
    <>
      <SuperTable<Subscriber>
        entityLabel="subscriber"
        searchPlaceholder="Cari email, nama, atau perusahaan"
        tableId="subscribers-table"
        urlKey=""
        exportFileName="Subscribers"
        data={subscribers}
        columns={columns}
        rowCount={totalCount}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={onRetry}
        getRowId={(row) => row.id}
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
        // Class A in the README rule: a scalar record with no route of its
        // own, so the row opens the edit modal rather than navigating.
        onRowClick={(row) => onEdit(row)}
        onExportRequest={onExportRequest}
        features={{
          // Every column here carries an explicit `size`, which virtualization
          // requires: it forces MRT into `layoutMode: 'grid'`, where widths come
          // from the column def instead of the browser's natural table layout.
          virtualize: true,
          pagination: true,
          globalFilter: true,
          columnFilters: false,
          sorting: true,
          rowSelection: 'multi',
          columnVisibility: true,
          densityToggle: true,
          fullScreenToggle: true,
          export: { excel: true, csv: true },
          urlSync: true,
        }}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
              variantStyle="outline"
              startIcon={<Copy size={16} />}
              disabled={isDuplicating}
              onClick={() => {
                const ids = (selectedRows as Subscriber[]).map((r) => r.id);
                if (onDuplicate) onDuplicate(ids);
                clearSelection();
              }}
            >
              {isDuplicating ? "Duplicating…" : `Duplicate (${selectedRows.length})`}
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
        rowActions={[
          {
            id: 'edit',
            label: 'Edit',
            icon: <Pencil size={16} />,
            onClick: (row) => onEdit(row),
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: <Copy size={16} />,
            hidden: () => !onDuplicate,
            onClick: (row) => onDuplicate?.([row.id]),
          },
          {
            // Pinned rather than tucked into the menu: culling a subscriber
            // list is daily work here, and burying Delete behind two clicks
            // would be a real regression for the people who do it.
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 size={16} />,
            placement: 'quick',
            destructive: true,
            onClick: (row) => onDeleteRequest([row.id]),
          },
        ]}
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
