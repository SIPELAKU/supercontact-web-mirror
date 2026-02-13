"use client";


import { Card, Typography } from '@mui/material';
import { useState } from 'react';
import { notify } from '@/lib/notifications';

import MailingListsTable from '@/components/email-marketing/mailing-lists/MailingListsTable';
import AddMailingListModal from '@/components/email-marketing/mailing-lists/modals/AddMailingListModal';
import EditMailingListModal from '@/components/email-marketing/mailing-lists/modals/EditMailingListModal';
import PageHeader from '@/components/ui/page-header';
import { useDeleteMailingList } from '@/lib/hooks/useMailingLists';
import { MailingList } from '@/lib/types/email-marketing';
import { AppButton } from '@/components/ui/app-button';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';

export default function MailingListsClient() {
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
      notify.success(`Mailing list "${listToDelete.name}" deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete mailing list.');
    } finally {
      setConfirmOpen(false);
      setListToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Mailing Lists"
        breadcrumbs={[
          { label: "Email Marketing" },
          { label: "Mailing Lists" },
        ]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
            Mailing Lists
          </Typography>
        </div>
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

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete mailing list "${listToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
