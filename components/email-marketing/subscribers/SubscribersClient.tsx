"use client";

import { useCallback, useState } from 'react';
import { notify } from '@/lib/notifications';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { History, MoreVertical, Plus, Trash2, Upload } from 'lucide-react';

import SubscribersTable from '@/components/email-marketing/subscribers/SubscribersTable';
import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import EditSubscriberModal from '@/components/email-marketing/subscribers/modals/EditSubscriberModal';
import ImportSubscriberModal from '@/components/email-marketing/subscribers/modals/ImportSubscriberModal';
import ImportHistoryModal from '@/components/email-marketing/subscribers/modals/ImportHistoryModal';
import PageHeader from '@/components/ui/page-header';
import { AppButton } from '@/components/ui/app-button';
import { useSubscribers, useDeleteSubscriber, useBulkDeleteSubscribers, useDeleteAllSubscribers, useDuplicateSubscribers } from '@/lib/hooks/useSubscribers';
import { fetchSubscribers } from '@/lib/api/email-marketing/subscribers';
import { Subscriber } from '@/lib/types/email-marketing';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { EXPORT_MAX_PAGES, EXPORT_PAGE_SIZE } from '@/lib/constants/export';

export default function SubscribersClient() {
  const queryClient = useQueryClient();

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[] | null>(null);

  // Server-side pagination, search & sorting state
  // (search is already debounced by SuperTable — no extra debounce layer here)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25); // matches SuperTable's lazy batch
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const sort = sorting[0];
  const sortBy = sort?.id;
  const sortOrder: 'asc' | 'desc' | undefined = sort ? (sort.desc ? 'desc' : 'asc') : undefined;

  const { data, isLoading, isFetching, isError, error, refetch } = useSubscribers(page, limit, searchQuery, sortBy, sortOrder);

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

  // Invalidate rather than the old blind `setTimeout(refetch, 2000)` — a guess
  // that was always either too early for an import or too slow for a single
  // add.
  const handleSuccess = () => {
    handleCloseModals();
    queryClient.invalidateQueries({ queryKey: ['subscribers'] });
  };

  // An import runs as a background job, so there is nothing to refetch yet when
  // the wizard closes. Hand the user straight to Import History, which polls
  // the job and invalidates ['subscribers'] the moment it finishes — the
  // mechanism the 2-second timer was blindly guessing at.
  const handleImportSuccess = () => {
    handleCloseModals();
    setHistoryModalOpen(true);
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

  // Export handler: walk every page of the current query, reporting progress
  // so the export dialog can show "Fetched 3,000 of 12,400 rows".
  const handleExportRequest = useCallback(async ({
    onProgress,
  }: {
    onProgress?: (fetched: number, total: number) => void;
  }): Promise<Subscriber[]> => {
    const token = Cookies.get('access_token');
    if (!token) throw new Error('No authentication token');

    let allData: Subscriber[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const result = await fetchSubscribers(
        token,
        currentPage,
        EXPORT_PAGE_SIZE,
        searchQuery || undefined,
        sortBy,
        sortOrder
      );

      const items = result?.data?.contacts || [];
      const total = result?.data?.total || 0;
      totalPages = Math.min(
        Math.ceil(total / EXPORT_PAGE_SIZE) || 1,
        EXPORT_MAX_PAGES
      );

      allData = [...allData, ...items];
      onProgress?.(allData.length, total);
      currentPage++;
    } while (currentPage <= totalPages);

    return allData;
  }, [searchQuery, sortBy, sortOrder]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Subscribers"
        description="Everyone who can receive an email campaign. Add them one at a time, or import a spreadsheet."
        breadcrumbs={[
          { label: "Email Marketing", href: "/email-marketing" },
          { label: "Subscribers" },
        ]}
        actions={
          <>
            <AppButton
              variantStyle="outline"
              color="gray"
              onClick={handleOpenHistoryModal}
              startIcon={<History size={16} />}
              className="whitespace-nowrap"
            >
              History
            </AppButton>
            <AppButton
              variantStyle="outline"
              onClick={handleOpenImportModal}
              startIcon={<Upload size={16} />}
              className="whitespace-nowrap"
            >
              Import
            </AppButton>
            <AppButton
              variantStyle="primary"
              onClick={handleOpenAddModal}
              startIcon={<Plus size={16} />}
              className="whitespace-nowrap"
            >
              Add Subscriber
            </AppButton>
            <IconButton
              aria-label="More actions"
              aria-haspopup="true"
              onClick={(e) => setMoreAnchor(e.currentTarget)}
              size="small"
            >
              <MoreVertical size={18} />
            </IconButton>
            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={() => setMoreAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setMoreAnchor(null);
                  setConfirmAllOpen(true);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'error.main', minWidth: 32 }}>
                  <Trash2 size={16} />
                </ListItemIcon>
                <ListItemText primary="Delete all subscribers" />
              </MenuItem>
            </Menu>
          </>
        }
      />

      <SubscribersTable
        subscribers={subscribers}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        totalCount={totalCount}
        onAdd={handleOpenAddModal}
        onEdit={handleOpenEditModal}
        onDeleteRequest={handleDeleteRequest}
        onDuplicate={handleDuplicate}
        onExportRequest={handleExportRequest as any}
        onStateChange={handleStateChange}
        onSuccess={handleSuccess}
        isDuplicating={duplicateMutation.isPending}
      />

      <AddSubscriberModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      <ImportSubscriberModal open={isImportModalOpen} onClose={handleCloseModals} onSuccess={handleImportSuccess} />
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
