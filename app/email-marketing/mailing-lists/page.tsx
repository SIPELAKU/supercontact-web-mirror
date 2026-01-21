"use client";

import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import MailingListsTable from '@/components/email-marketing/mailing-lists/MailingListsTable';
import AddMailingListModal from '@/components/email-marketing/mailing-lists/modals/AddMailingListModal';
import EditMailingListModal from '@/components/email-marketing/mailing-lists/modals/EditMailingListModal';
import PageHeader from '@/components/ui-mui/page-header';
import { useDeleteMailingList } from '@/lib/hooks/useMailingLists';
import { MailingList } from '@/lib/types/email-marketing';
import { AlertTriangle } from 'lucide-react';

export default function MailingListsPage() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<MailingList | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<MailingList | null>(null);
  
  const deleteMutation = useDeleteMailingList();

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedList(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleEdit = (list: MailingList) => {
    setSelectedList(list);
    setEditModalOpen(true);
  };

  const handleDeleteRequest = (list: MailingList) => {
    setListToDelete(list);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(listToDelete.id);
      toast.success(`Mailing list "${listToDelete.name}" deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete mailing list.');
    } finally {
      setConfirmOpen(false);
      setListToDelete(null);
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Mailing Lists"
        breadcrumbs={[
          { label: "Email Marketing" },
          { label: "Mailing Lists" },
        ]}
      />

      <div className="mb-6">
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Mailing Lists
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your mailing lists
        </Typography>
      </div>

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <MailingListsTable
          onAdd={handleOpenAddModal}
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          refreshTrigger={refreshTrigger}
        />
      </Card>

      <AddMailingListModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      
      <EditMailingListModal 
        open={isEditModalOpen} 
        onClose={handleCloseModals} 
        onSuccess={handleSuccess}
        mailingList={selectedList}
      />

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
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
