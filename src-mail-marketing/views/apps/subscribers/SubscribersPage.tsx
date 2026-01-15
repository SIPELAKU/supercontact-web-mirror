// src/views/apps/subscribers/SubscribersPage.tsx

import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import DashboardCard from 'src/components/shared/DashboardCard';
import toast from 'react-hot-toast';
import axios from 'src/api/axios';

import SubscribersTable from 'src/components/apps/subscribers/SubscribersTable';
import AddSubscriberModal from 'src/components/apps/subscribers/modal/AddSubscriberModal';
import EditSubscriberModal from 'src/components/apps/subscribers/modal/EditSubscriberModal';
import { Subscriber } from 'src/types/apps/subscribers';

const SubscribersPage = () => {
  const BCrumb = [
    { to: '/dashboards/modern', title: 'Dashboard' },
    { to: '/app/email-marketing/campaigns', title: 'Email Marketing' },
    { title: 'Subscribers' },
  ];

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Subscriber[] | null>(null); // <-- Ubah menjadi array
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

  // --- Ubah Logika di Bawah Ini ---

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
      const idsToDelete = selectedToDelete.map(sub => sub.id);
      await axios.post(`/subscribers/delete-multiple`, { ids: idsToDelete });
      
      toast.success(`${selectedToDelete.length} subscriber berhasil dihapus.`);
      forceRefetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal menghapus subscriber.';
      toast.error(errorMessage);
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer title="Subscribers" description="Kelola daftar subscriber untuk email marketing">
      <Breadcrumb title="Subscribers" items={BCrumb} />
      <DashboardCard>
        <SubscribersTable
          onAdd={handleOpenAddModal}
          onEdit={handleOpenEditModal}
          onDeleteRequest={handleDeleteRequest}
          refreshTrigger={refreshTrigger}
          isDeleting={isDeleting} // <-- Teruskan prop
        />
      </DashboardCard>

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
            <Typography variant="h6">Konfirmasi Penghapusan</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Anda yakin ingin menghapus {selectedToDelete?.length} subscriber terpilih? Aksi ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default SubscribersPage;