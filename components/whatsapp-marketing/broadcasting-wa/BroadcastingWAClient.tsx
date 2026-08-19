"use client";

import { useState, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { Plus, Copy } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import PageHeader from '@/components/ui/page-header';
import { SuperTableState } from '@/components/ui/super-table';
import { useAuth } from '@/lib/context/AuthContext';
import { notify } from '@/lib/notifications';
import { handleError } from '@/lib/utils/errorHandler';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';

import BroadcastingWATable from '@/components/whatsapp-marketing/broadcasting-wa/BroadcastingWATable';
import { useBroadcasts, useDeleteBroadcast, useDuplicateBroadcast } from '@/lib/hooks/useBroadcasts';
import { BroadcastCampaign } from '@/lib/types/whatsapp-marketing';
import { fetchBroadcasts } from '@/lib/api';

// Modals (to be created)
import AddBroadcastModal from '@/components/whatsapp-marketing/broadcasting-wa/modals/AddBroadcastModal';
import ViewBroadcastStatsModal from '@/components/whatsapp-marketing/broadcasting-wa/modals/ViewBroadcastStatsModal';
import EditBroadcastModal from './modals/EditBroadcastModal';

export default function BroadcastingWAClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastCampaign | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState<BroadcastCampaign | null>(null);

  const { token } = useAuth();
  const deleteMutation = useDeleteBroadcast();
  const duplicateMutation = useDuplicateBroadcast();

  // SuperTable State Hook
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 10,
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[],
    sorting: [{ id: "created_at", desc: true }] as { id: string; desc: boolean }[],
  });

  const handleTableStateChange = (state: SuperTableState) => {
    setTableState({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      globalFilter: state.globalFilter,
      columnFilters: state.columnFilters || [],
      sorting: state.sorting || [],
    });
  };

  const getFilterValue = (id: string) => {
    const filter = tableState.columnFilters.find((f: { id: string; value: unknown }) => f.id === id);
    return filter ? (filter.value as string) : "";
  };

  const pageParam = tableState.pageIndex + 1; // Backend 1-indexed
  const limitParam = tableState.pageSize;
  const searchParam = tableState.globalFilter || "";
  const statusParam = getFilterValue("status") || undefined;

  // Server-side sorting (sort_by/sort_order contract)
  const sortParam = tableState.sorting[0];
  const sortByParam = sortParam?.id;
  const sortOrderParam: 'asc' | 'desc' | undefined = sortParam
    ? (sortParam.desc ? 'desc' : 'asc')
    : undefined;

  // React Query Fetcher (Main Table Data)
  const {
    data: broadcastsResponse,
    isLoading,
    isError,
  } = useBroadcasts(pageParam, limitParam, searchParam, statusParam, sortByParam, sortOrderParam);

  const totalCount = broadcastsResponse?.data?.total || 0;
  const broadcasts = broadcastsResponse?.data?.broadcasts || [];

  // Export logic (Do-While loop to fetch all pages)
  const handleExportRequest = async (): Promise<BroadcastCampaign[]> => {
    if (!token) throw new Error("No authorization token");
    let allData: BroadcastCampaign[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const resp = await fetchBroadcasts(token, currentPage, 1000, searchParam, statusParam);
      if (!resp.success) throw new Error("Failed to fetch data for export");
      allData = [...allData, ...resp.data.broadcasts];
      totalPages = resp.data.total_pages;
      currentPage++;
    } while (currentPage <= totalPages);

    return allData;
  };

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setViewModalOpen(false);
    setSelectedBroadcast(null);
  };

  const handleEdit = (broadcast: BroadcastCampaign) => {
    setSelectedBroadcast(broadcast);
    setEditModalOpen(true);
  };

  const handleView = (broadcast: BroadcastCampaign) => {
    setSelectedBroadcast(broadcast);
    setViewModalOpen(true);
  };

  const handleDuplicate = async (broadcast: BroadcastCampaign) => {
    try {
      await duplicateMutation.mutateAsync([broadcast.id]);
      notify.success(`Broadcast "${broadcast.name}" duplicated successfully.`);
    } catch (err: any) {
      handleError(err, "Duplicate Broadcast");
    }
  };

  const handleBulkDuplicate = async (selectedRows: BroadcastCampaign[], clearSelection: () => void) => {
    if (!selectedRows.length) return;
    try {
      const ids = selectedRows.map(r => r.id);
      await duplicateMutation.mutateAsync(ids);
      notify.success(`${selectedRows.length} broadcasts duplicated successfully.`);
      clearSelection();
    } catch (err: any) {
      handleError(err, "Duplicate Broadcasts");
    }
  };

  const handleDeleteRequest = (broadcast: BroadcastCampaign) => {
    setBroadcastToDelete(broadcast);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!broadcastToDelete) return;
    try {
      await deleteMutation.mutateAsync(broadcastToDelete.id);
      notify.success(`Broadcast "${broadcastToDelete.name}" deleted successfully.`);
    } catch (err: any) {
      handleError(err, "Delete Broadcast");
    } finally {
      setConfirmOpen(false);
      setBroadcastToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Broadcasts"
        breadcrumbs={[
          { label: "WhatsApp Marketing" },
          { label: "Broadcasts" },
        ]}
      />

      <BroadcastingWATable
        broadcasts={broadcasts}
        isLoading={isLoading}
        isError={isError}
        rowCount={totalCount}
        onStateChange={handleTableStateChange}
        onExportRequest={handleExportRequest}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onView={handleView}
        onDuplicate={handleDuplicate}
        renderTopLeftToolbar={() => (
          <Box className="flex gap-2">
            <AppButton
              onClick={handleOpenAddModal}
              startIcon={<Plus size={16} />}
            >
              Create Broadcast
            </AppButton>
          </Box>
        )}
        renderBulkActions={({ selectedRows, clearSelection }) => (
          <Box className="flex gap-2">
            <AppButton
              variantStyle="primary"
              onClick={() => handleBulkDuplicate(selectedRows, clearSelection)}
              startIcon={<Copy size={16} />}
              isLoading={duplicateMutation.isPending}
            >
              Duplicate ({selectedRows.length})
            </AppButton>
          </Box>
        )}
      />

      <AddBroadcastModal open={isAddModalOpen} onClose={handleCloseModals} />

      <EditBroadcastModal
        open={isEditModalOpen}
        onClose={handleCloseModals}
        broadcast={selectedBroadcast}
      />

      <ViewBroadcastStatsModal
        open={isViewModalOpen}
        onClose={handleCloseModals}
        broadcast={selectedBroadcast}
      />

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete broadcast "${broadcastToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
