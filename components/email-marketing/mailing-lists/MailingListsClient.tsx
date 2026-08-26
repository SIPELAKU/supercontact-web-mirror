"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<MailingList | null>(null);

  const deleteMutation = useDeleteMailingList();

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedList(null);
  };

  // No forceRefetch here any more: `refreshTrigger` was incremented on every
  // success but never reached a query key (the table did not even destructure
  // the prop), so the list only ever refreshed because the mutations happen to
  // call invalidateQueries — which they do, and which is the real mechanism.
  const handleSuccess = () => handleCloseModals();

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
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete mailing list.');
    } finally {
      setConfirmOpen(false);
      setListToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      {/* One header. This page used to render PageHeader and then a second
          <Typography component="h1">Mailing Lists</Typography> right below it —
          two <h1> elements saying the same thing — and then wrapped the table
          in an extra <Card>, giving a bordered box inside SuperTable's own
          bordered Paper. */}
      <PageHeader
        title="Mailing Lists"
        description="Group subscribers into lists so a campaign can target them in one go."
        breadcrumbs={[
          { label: "Email Marketing", href: "/email-marketing" },
          { label: "Mailing Lists" },
        ]}
        actions={
          <AppButton
            variantStyle="primary"
            startIcon={<Plus size={16} />}
            onClick={handleOpenAddModal}
          >
            Add Mailing List
          </AppButton>
        }
      />

      <MailingListsTable
        onAdd={handleOpenAddModal}
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest}
      />

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
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
