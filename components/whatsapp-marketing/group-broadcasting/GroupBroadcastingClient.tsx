// components/whatsapp-marketing/group-broadcasting/GroupBroadcastingClient.tsx
"use client";

import { Card } from '@mui/material';
import { useState } from 'react';
import GroupBroadcastingTable from './GroupBroadcastingTable';
import PageHeader from '@/components/ui/page-header';
import { GroupBroadcast } from '@/lib/types/whatsapp-marketing';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { notify } from '@/lib/notifications';
import AddGroupBroadcastModal from './modals/AddGroupBroadcastModal';
import EditGroupBroadcastModal from './modals/EditGroupBroadcastModal';
import { useDeleteGroupBroadcast } from '@/lib/hooks/useGroupBroadcasts';

export default function GroupBroadcastingClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [broadcastToEdit, setBroadcastToEdit] = useState<GroupBroadcast | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState<GroupBroadcast | null>(null);

  const deleteMutation = useDeleteGroupBroadcast();

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setBroadcastToEdit(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleEdit = (broadcast: GroupBroadcast) => {
    setBroadcastToEdit(broadcast);
    setEditModalOpen(true);
  };

  const handleDeleteRequest = (broadcast: GroupBroadcast) => {
    setBroadcastToDelete(broadcast);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!broadcastToDelete) return;

    try {
      await deleteMutation.mutateAsync(broadcastToDelete.id);
      notify.success(`Broadcast group "${broadcastToDelete.name}" deleted successfully.`);
      setConfirmOpen(false);
      setBroadcastToDelete(null);
      forceRefetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete broadcast group.');
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Group Broadcasting"
        breadcrumbs={[
          { label: "Whatsapp Marketing" },
          { label: "Group Broadcasting" },
        ]}
      />

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <GroupBroadcastingTable
          onAdd={handleOpenAddModal}
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          refreshTrigger={refreshTrigger}
        />
      </Card>

      <AddGroupBroadcastModal
        open={isAddModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
      />

      <EditGroupBroadcastModal
        open={isEditModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        broadcast={broadcastToEdit}
      />

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete group broadcast "${broadcastToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
