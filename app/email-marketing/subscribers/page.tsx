"use client";

import { Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import SubscribersTable from '@/components/email-marketing/subscribers/SubscribersTable';
import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import EditSubscriberModal from '@/components/email-marketing/subscribers/modals/EditSubscriberModal';
import { Subscriber } from '@/lib/types/email-marketing';

export default function SubscribersPage() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Subscriber[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
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
    setIsDeleting(true);
    try {
      // TODO: Replace with real API call when backend is ready
      // const idsToDelete = selectedToDelete.map(sub => sub.id);
      // await axiosClient.post(`/subscribers/delete-multiple`, { ids: idsToDelete });
      
      // MOCK - Simulate success
      const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(500);
      
      toast.success(`${selectedToDelete.length} subscriber(s) deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete subscriber(s).';
      toast.error(errorMessage);
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">All Subscribers</h1>
        <p className="text-gray-600 mt-1">Manage your email marketing subscribers</p>
      </div>

      <Card>
        <CardContent>
          <SubscribersTable
            onAdd={handleOpenAddModal}
            onEdit={handleOpenEditModal}
            onDeleteRequest={handleDeleteRequest}
            refreshTrigger={refreshTrigger}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>

      <AddSubscriberModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
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
            <IconAlertTriangle size="1.5rem" color="orange" />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedToDelete?.length} selected subscriber(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
