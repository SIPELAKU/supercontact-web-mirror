"use client";

import { Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button as MuiButton, Stack, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { notify } from '@/lib/notifications';

import SubscribersTable from '@/components/email-marketing/subscribers/SubscribersTable';
import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import EditSubscriberModal from '@/components/email-marketing/subscribers/modals/EditSubscriberModal';
import ImportSubscriberModal from '@/components/email-marketing/subscribers/modals/ImportSubscriberModal';
import PageHeader from '@/components/ui/page-header';
import { useDeleteSubscriber, useBulkDeleteSubscribers, useDeleteAllSubscribers } from '@/lib/hooks/useSubscribers';
import { Subscriber } from '@/lib/types/email-marketing';
import { AppButton } from '@/components/ui/app-button';

export default function SubscribersClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Subscriber[] | null>(null);

  const deleteMutation = useDeleteSubscriber();
  const bulkDeleteMutation = useBulkDeleteSubscribers();
  const deleteAllMutation = useDeleteAllSubscribers();
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);


  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleOpenImportModal = () => setImportModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setImportModalOpen(false);
    setSelectedSubscriber(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleOpenEditModal = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setEditModalOpen(true);
  };

  const handleDeleteRequest = (subscribers: Subscriber[]) => {
    if (subscribers.length > 0) {
      setSelectedToDelete(subscribers);
      setConfirmOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    try {
      const contactIds = selectedToDelete.map(s => s.id);

      if (contactIds.length === 1) {
        // Single delete
        await deleteMutation.mutateAsync(contactIds[0]);
      } else {
        // Bulk delete
        await bulkDeleteMutation.mutateAsync(contactIds);
      }

      notify.success(`${selectedToDelete.length} subscriber(s) deleted successfully.`);
      forceRefetch();
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
      forceRefetch();
    } catch (err: any) {
      notify.error(err.message || "Failed to delete all subscribers.");
    } finally {
      setConfirmAllOpen(false);
    }
  };

  return (

    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Subscribers"
        breadcrumbs={[
          { label: "Email Marketing" },
          { label: "Subscribers" },
        ]}
      />

      <div className="mb-6">
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          All Subscribers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your email marketing subscribers
        </Typography>
      </div>

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <SubscribersTable
          onAdd={handleOpenAddModal}
          onEdit={handleOpenEditModal}
          onDeleteRequest={handleDeleteRequest}
          onImport={handleOpenImportModal}
          onDeleteAllRequest={() => setConfirmAllOpen(true)}
          refreshTrigger={refreshTrigger}
          isDeleting={deleteMutation.isPending || bulkDeleteMutation.isPending || deleteAllMutation.isPending}
        />

      </Card>

      <AddSubscriberModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      <ImportSubscriberModal open={isImportModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
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

