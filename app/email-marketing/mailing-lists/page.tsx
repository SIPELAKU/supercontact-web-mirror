"use client";

import { Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import MailingListsTable from '@/components/email-marketing/mailing-lists/MailingListsTable';
import AddMailingListModal from '@/components/email-marketing/mailing-lists/modals/AddMailingListModal';
import { MailingList } from '@/lib/types/email-marketing';
import { AlertTriangle } from 'lucide-react';

export default function MailingListsPage() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<MailingList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
  };

  const handleSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleEdit = (list: MailingList) => {
    toast.info('Edit functionality coming soon!');
    // TODO: Implement edit modal
  };

  const handleDeleteRequest = (list: MailingList) => {
    setListToDelete(list);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete) return;
    setIsDeleting(true);
    try {
      // MOCK - Simulate success
      const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(500);
      
      toast.success(`Mailing list "${listToDelete.name}" deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      toast.error('Failed to delete mailing list.');
    } finally {
      setConfirmOpen(false);
      setListToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mailing List</h1>
        <p className="text-gray-600 mt-1">Manage your mailing lists</p>
      </div>

      <Card>
        <CardContent>
          <MailingListsTable
            onAdd={handleOpenAddModal}
            onEdit={handleEdit}
            onDeleteRequest={handleDeleteRequest}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      <AddMailingListModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete mailing list "{listToDelete?.name}"? This action cannot be undone.
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
