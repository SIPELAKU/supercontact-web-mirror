// components/whatsapp-marketing/recipients/RecipientsClient.tsx
"use client";

import { useCallback, useState } from 'react';

import { notify } from '@/lib/notifications';
import PageHeader from '@/components/ui/page-header';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import {
  useWaRecipients,
  useDeleteWaRecipient,
  useBulkDeleteWaRecipients,
  useDuplicateWaRecipients,
  useDeleteAllWaRecipients,
} from '@/lib/hooks/useWaRecipients';
import RecipientsTable from './RecipientsTable';
import AddRecipientModal from './AddRecipientModal';
import ImportWaRecipientModal from './ImportWaRecipientModal';
import type { WaRecipient } from '@/lib/types/whatsapp-marketing';

export default function RecipientsClient() {
  // Pagination, search & sorting state
  // (limit matches the table's default pageSize of 10)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  // Modal / confirm state
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<WaRecipient | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  // Search is already debounced by SuperTable (500ms) — no extra debounce layer here
  const sort = sorting[0];

  const { data, isLoading, isError, error, refetch } = useWaRecipients({
    recipient_type: 'whatsapp',
    page,
    limit,
    search: searchQuery || undefined,
    sort_by: sort?.id as import('@/lib/types/whatsapp-marketing').WaRecipientSortBy | undefined,
    sort_order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
  });

  const recipients = data?.data?.recipients || [];
  const totalCount = data?.data?.total || 0;

  const deleteMutation = useDeleteWaRecipient();
  const bulkDeleteMutation = useBulkDeleteWaRecipients();
  const deleteAllMutation = useDeleteAllWaRecipients();
  const duplicateMutation = useDuplicateWaRecipients();

  // Handlers
  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setImportModalOpen(false);
    setSelectedRecipient(null);
  };
  const handleSuccess = () => {
    handleCloseModals();
    refetch();
  };

  const handleOpenEditModal = (recipient: WaRecipient) => {
    setSelectedRecipient(recipient);
    setEditModalOpen(true);
  };

  const handleDeleteRequest = (ids: string[]) => {
    if (ids.length > 0) {
      setSelectedToDelete(ids);
      setConfirmOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;
    try {
      if (selectedToDelete.length === 1) {
        await deleteMutation.mutateAsync(selectedToDelete[0]);
      } else {
        await bulkDeleteMutation.mutateAsync(selectedToDelete);
      }
      notify.success(`${selectedToDelete.length} recipient(s) deleted successfully.`);
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete recipient(s).');
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
    }
  };

  const handleConfirmDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      notify.success('All recipients deleted successfully.');
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete all recipients.');
    } finally {
      setConfirmAllOpen(false);
    }
  };

  const handleDuplicate = async (ids: string[], target: string) => {
    try {
      await duplicateMutation.mutateAsync({ ids, target });
      notify.success(`${ids.length} recipient(s) duplicated successfully.`);
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to duplicate recipient(s).');
    }
  };

  const handleStateChange = useCallback(
    (state: { page: number; limit: number; search: string; sorting: { id: string; desc: boolean }[] }) => {
      const searchChanged = state.search !== searchQuery;
      if (searchChanged) setSearchQuery(state.search);
      if (state.limit !== limit) {
        setLimit(state.limit);
        setPage(1);
      } else if (searchChanged) {
        setPage(1); // Reset to first page on search
      } else if (state.page !== page) {
        setPage(state.page);
      }
      setSorting(state.sorting || []);
    },
    [page, limit, searchQuery]
  );

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Recipients"
        breadcrumbs={[
          { label: 'Whatsapp Marketing' },
          { label: 'Recipients' },
        ]}
      />

      <RecipientsTable
        recipients={recipients}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        totalCount={totalCount}
        onAdd={handleOpenAddModal}
        onImport={() => setImportModalOpen(true)}
        onEdit={handleOpenEditModal}
        onDeleteRequest={handleDeleteRequest}
        onDeleteAll={() => setConfirmAllOpen(true)}
        onDuplicate={handleDuplicate}
        onStateChange={handleStateChange}
        isDuplicating={duplicateMutation.isPending}
      />

      <AddRecipientModal
        open={isAddModalOpen}
        recipientType="whatsapp"
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
      />

      <AddRecipientModal
        open={isEditModalOpen}
        recipientType="whatsapp"
        initialData={selectedRecipient ?? undefined}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
      />

      <ImportWaRecipientModal
        open={isImportModalOpen}
        recipientType="whatsapp"
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${selectedToDelete?.length} selected recipient(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />

      {/* Delete All Confirmation */}
      <ConfirmationPopup
        isOpen={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Confirm Delete All"
        description={<>Are you sure you want to delete <strong>all recipients</strong>? This action cannot be undone and will clear all data from this table.</>}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteAllMutation.isPending}
      />
    </div>
  );
}
