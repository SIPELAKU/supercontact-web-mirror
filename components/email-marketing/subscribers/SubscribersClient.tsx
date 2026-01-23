"use client";

import { Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button as MuiButton, Stack, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import SubscribersTable from '@/components/email-marketing/subscribers/SubscribersTable';
import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import EditSubscriberModal from '@/components/email-marketing/subscribers/modals/EditSubscriberModal';
import PageHeader from '@/components/ui/page-header';
import { useDeleteSubscriber } from '@/lib/hooks/useSubscribers';
import { Subscriber } from '@/lib/types/email-marketing';

export default function SubscribersClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Subscriber[] | null>(null);
  
  const deleteMutation = useDeleteSubscriber();

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
    
    try {
      // Delete subscribers one by one
      for (const subscriber of selectedToDelete) {
        await deleteMutation.mutateAsync(subscriber.id);
      }
      
      toast.success(`${selectedToDelete.length} subscriber(s) deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete subscriber(s).';
      toast.error(errorMessage);
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 pt-6 space-y-6">
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
          refreshTrigger={refreshTrigger}
          isDeleting={deleteMutation.isPending}
        />
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
          <MuiButton onClick={() => setConfirmOpen(false)} color="secondary">Cancel</MuiButton>
          <MuiButton onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
