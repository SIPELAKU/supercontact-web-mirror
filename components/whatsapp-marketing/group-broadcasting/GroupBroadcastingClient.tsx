// components/whatsapp-marketing/group-broadcasting/GroupBroadcastingClient.tsx
"use client";

import { Card } from '@mui/material';
import { useEffect, useState } from 'react';
import GroupBroadcastingTable from './GroupBroadcastingTable';
import PageHeader from '@/components/ui/page-header';
import type { SuperTableState } from '@/components/ui/super-table';
import {
  BROADCAST_GROUP_SORT_KEYS,
  type GroupBroadcast,
  type GroupBroadcastsParams,
} from '@/lib/types/whatsapp-marketing';
import { toApiSort } from '@/lib/utils/apiSort';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { notify } from '@/lib/notifications';
import AddGroupBroadcastModal from './modals/AddGroupBroadcastModal';
import EditGroupBroadcastModal from './modals/EditGroupBroadcastModal';
import {
  groupBroadcastsKey,
  useDeleteGroupBroadcast,
  useDuplicateGroupBroadcasts,
  useGroupBroadcasts,
} from '@/lib/hooks/useGroupBroadcasts';
import { useListRefresh } from '@/lib/hooks/useListRefresh';

export default function GroupBroadcastingClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [broadcastToEdit, setBroadcastToEdit] = useState<GroupBroadcast | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [deleteDescription, setDeleteDescription] = useState('');

  // Page, search and sort driven by SuperTable and applied by the API.
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const { sortBy, sortOrder } = toApiSort(sorting, BROADCAST_GROUP_SORT_KEYS);
  const listParams: GroupBroadcastsParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };
  const { data, isLoading, isError, error, refetch } = useGroupBroadcasts(listParams);

  useEffect(() => {
    if (isError && error) {
      notify.error('Failed to fetch group broadcasts.');
    }
  }, [isError, error]);

  const broadcasts = data?.data?.broadcast_groups || [];
  const totalCount = data?.data?.total || 0;

  const deleteMutation = useDeleteGroupBroadcast();
  const duplicateMutation = useDuplicateGroupBroadcasts();
  const duplicatingIds = duplicateMutation.isPending
    ? duplicateMutation.variables?.broadcast_group_ids ?? []
    : [];

  // Loading state and batch-1 refresh around every write on this page.
  const listRefresh = useListRefresh({
    batchIndex: pagination.pageIndex,
    firstBatchKey: groupBroadcastsKey({ ...listParams, page: 1 }),
  });

  const handleStateChange = (state: SuperTableState) => {
    setPagination({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
    });
    setSearch(state.globalFilter || '');
    setSorting(state.sorting ?? []);
  };

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setBroadcastToEdit(null);
  };

  // Add and Edit save inside their modals and call this afterwards.
  const handleSuccess = () => {
    handleCloseModals();
    void listRefresh.refreshAfterSave();
  };

  const handleEdit = (broadcast: GroupBroadcast) => {
    setBroadcastToEdit(broadcast);
    setEditModalOpen(true);
  };

  const handleDuplicate = (ids: string[], clearSelection?: () => void) =>
    listRefresh.run(async () => {
      try {
        await duplicateMutation.mutateAsync({ broadcast_group_ids: ids });
        notify.success(`${ids.length} group(s) duplicated successfully.`);
        clearSelection?.();
        await listRefresh.refresh();
      } catch (err: any) {
        notify.error(err.message || 'Failed to duplicate group(s).');
      }
    });

  const handleDeleteRequest = (broadcast: GroupBroadcast) => {
    setIdsToDelete([broadcast.id]);
    setDeleteDescription(`Are you sure you want to delete group broadcast "${broadcast.name}"? This action cannot be undone.`);
    setConfirmOpen(true);
  };

  const handleBulkDeleteRequest = (ids: string[]) => {
    setIdsToDelete(ids);
    setDeleteDescription(`Are you sure you want to delete ${ids.length} selected group broadcast(s)? This action cannot be undone.`);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () =>
    listRefresh.run(async () => {
      if (idsToDelete.length === 0) return;
      try {
        await deleteMutation.mutateAsync({ broadcast_group_ids: idsToDelete });
        notify.success(`${idsToDelete.length} group broadcast(s) deleted successfully.`);
        setConfirmOpen(false);
        setIdsToDelete([]);
      } catch (err: any) {
        // The popup stays open to retry; nothing was deleted.
        notify.error(err.message || 'Failed to delete broadcast group(s).');
        return;
      }
      await listRefresh.refresh();
    });

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Group Broadcasting"
        breadcrumbs={[
          { label: "WhatsApp Marketing" },
          { label: "Group Broadcasting" },
        ]}
      />

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <GroupBroadcastingTable
          broadcasts={broadcasts}
          isLoading={isLoading || listRefresh.isRefreshing}
          isError={isError}
          onRetry={() => refetch()}
          totalCount={totalCount}
          restartKey={listRefresh.restartKey}
          onStateChange={handleStateChange}
          onAdd={handleOpenAddModal}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          duplicatingIds={duplicatingIds}
          onDeleteRequest={handleDeleteRequest}
          onBulkDeleteRequest={handleBulkDeleteRequest}
        />
      </Card>

      <AddGroupBroadcastModal
        open={isAddModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
      />

      <EditGroupBroadcastModal
        open={isEditModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        broadcast={broadcastToEdit}
      />

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={deleteDescription}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
