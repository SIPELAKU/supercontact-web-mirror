"use client";

import { useCallback, useState } from 'react';
import { notify } from '@/lib/notifications';
import Cookies from 'js-cookie';

import SubscribersTable from '@/components/email-marketing/subscribers/SubscribersTable';
import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import EditSubscriberModal from '@/components/email-marketing/subscribers/modals/EditSubscriberModal';
import ImportSubscriberModal from '@/components/email-marketing/subscribers/modals/ImportSubscriberModal';
import ImportHistoryModal from '@/components/email-marketing/subscribers/modals/ImportHistoryModal';
import PageHeader from '@/components/ui/page-header';
import { useSubscribers, useDeleteSubscriber, useBulkDeleteSubscribers, useDeleteAllSubscribers, useDuplicateSubscribers } from '@/lib/hooks/useSubscribers';
import { fetchSubscribers } from '@/lib/api/email-marketing/subscribers';
import { Subscriber } from '@/lib/types/email-marketing';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';

export default function SubscribersClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  // Server-side pagination, search & sorting state
  // (search is already debounced by SuperTable — no extra debounce layer here)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const sort = sorting[0];
  const sortBy = sort?.id;
  const sortOrder: 'asc' | 'desc' | undefined = sort ? (sort.desc ? 'desc' : 'asc') : undefined;

  const { data, isLoading, isError, error, refetch } = useSubscribers(page, limit, searchQuery, sortBy, sortOrder);

  const subscribers = data?.data?.contacts || [];
  const totalCount = data?.data?.total || 0;

  const deleteMutation = useDeleteSubscriber();
  const bulkDeleteMutation = useBulkDeleteSubscribers();
  const deleteAllMutation = useDeleteAllSubscribers();
  const duplicateMutation = useDuplicateSubscribers();
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleOpenImportModal = () => setImportModalOpen(true);
  const handleOpenHistoryModal = () => setHistoryModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setImportModalOpen(false);
    setSelectedSubscriber(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    // Delay refetch to allow background async processes to reflect in the database
    setTimeout(() => {
      refetch();
    }, 2000);
  };

  const handleOpenEditModal = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
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

      notify.success(`${selectedToDelete.length} subscriber(s) deleted successfully.`);
      refetch();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete subscriber(s).';
      notify.error(errorMessage);
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
    }
  };

  const handleConfirmDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      notify.success("All subscribers have been deleted successfully.");
      refetch();
    } catch (err: any) {
      notify.error(err.message || "Failed to delete all subscribers.");
    } finally {
      setConfirmAllOpen(false);
    }
  };

  const handleDuplicate = async (ids: string[]) => {
    try {
      await duplicateMutation.mutateAsync({
        target: 'subscriber',
        contact_ids: ids
      });
      notify.success(`${ids.length} subscriber(s) duplicated successfully.`);
      refetch();
    } catch (err: any) {
      notify.error(err.message || "Failed to duplicate subscriber(s).");
    }
  };

  // Handle state changes from SuperTable
  const handleStateChange = useCallback((state: { page: number; limit: number; search: string; sorting: { id: string; desc: boolean }[] }) => {
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
  }, [page, limit, searchQuery]);

  // Export handler: loop pagination to fetch all data
  const handleExportRequest = useCallback(async (): Promise<Subscriber[]> => {
    try {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');

      let allData: Subscriber[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const result = await fetchSubscribers(token, currentPage, 50, searchQuery || undefined, sortBy, sortOrder);

        const items = result?.data?.contacts || [];
        const total = result?.data?.total || 0;
        totalPages = Math.ceil(total / 50) || 1;

        allData = [...allData, ...items];
        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    } catch (err) {
      console.error('Export error:', err);
      notify.error('Failed to export subscribers.');

      return [];
    }
  }, [searchQuery, sortBy, sortOrder]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Subscribers"
        breadcrumbs={[
          { label: "Email Marketing" },
          { label: "Subscribers" },
        ]}
      />

      <SubscribersTable
        subscribers={subscribers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        totalCount={totalCount}
        onAdd={handleOpenAddModal}
        onEdit={handleOpenEditModal}
        onDeleteRequest={handleDeleteRequest}
        onImport={handleOpenImportModal}
        onImportHistory={handleOpenHistoryModal}
        onDeleteAllRequest={() => setConfirmAllOpen(true)}
        onDuplicate={handleDuplicate}
        onExportRequest={handleExportRequest}
        onStateChange={handleStateChange}
        isDuplicating={duplicateMutation.isPending}
      />

      <AddSubscriberModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      <ImportSubscriberModal open={isImportModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      <ImportHistoryModal 
        open={isHistoryModalOpen} 
        onClose={() => setHistoryModalOpen(false)} 
        targetFilter={["subscriber", "contact"]}
        storageKey="import_interval_subscriber"
      />
      {selectedSubscriber && (
        <EditSubscriberModal
          open={isEditModalOpen}
          onClose={handleCloseModals}
          subscriberData={selectedSubscriber}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${selectedToDelete?.length} selected subscriber(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />

      <ConfirmationPopup
        isOpen={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Delete All Data"
        description={<><strong>WARNING:</strong> Are you sure you want to delete <strong>all subscribers</strong> in your account? This action is highly destructive and cannot be undone.</>}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteAllMutation.isPending}
      />
    </div>
  );
}
