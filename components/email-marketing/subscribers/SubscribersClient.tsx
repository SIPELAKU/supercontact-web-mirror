"use client";

import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { AppButton } from '@/components/ui/app-button';

export default function SubscribersClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  // Server-side pagination & search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, refetch } = useSubscribers(page, limit, debouncedSearch);

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
  const handleStateChange = useCallback((state: { page: number; limit: number; search: string }) => {
    if (state.page !== page) setPage(state.page);
    if (state.limit !== limit) {
      setLimit(state.limit);
      setPage(1);
    }
    if (state.search !== searchQuery) setSearchQuery(state.search);
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
        const result = await fetchSubscribers(token, currentPage, 50, debouncedSearch || undefined);

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
  }, [debouncedSearch]);

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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedToDelete?.length} selected subscriber(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setConfirmOpen(false)} color="gray" variantStyle='outline'>Cancel</AppButton>
          <AppButton onClick={handleConfirmDelete} color="danger" variantStyle='danger' disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}>
            {deleteMutation.isPending || bulkDeleteMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmAllOpen} onClose={() => setConfirmAllOpen(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <Typography variant="h6" color="error">Delete All Data</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>WARNING:</strong> Are you sure you want to delete <strong>all subscribers</strong> in your account? This action is highly destructive and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setConfirmAllOpen(false)} color="gray" variantStyle='outline'>Cancel</AppButton>
          <AppButton onClick={handleConfirmDeleteAll} color="danger" variantStyle='danger' disabled={deleteAllMutation.isPending}>
            {deleteAllMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete All Data!'}
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
