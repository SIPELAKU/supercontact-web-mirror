// src/views/apps/campaigns/CampaignsPage.tsx

import { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, Typography, Stack, CircularProgress
} from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import DashboardCard from 'src/components/shared/DashboardCard';
import toast from 'react-hot-toast';
import axios from 'src/api/axios';

import CampaignsTable from 'src/components/apps/campaigns/CampaignsTable';
import ViewCampaignModal from 'src/components/apps/campaigns/modal/ViewCampaignModal';
import AddCampaignModal from 'src/components/apps/campaigns/modal/AddCampaignModal';
import EditCampaignModal from 'src/components/apps/campaigns/modal/EditCampaignModal';
import { Campaign } from 'src/types/apps/campaigns';

const CampaignsPage = () => {
  const BCrumb = [{ to: '/dashboards/modern', title: 'Dashboard' }, { title: 'Email Marketing' }];

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setViewModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    // Beri jeda sedikit sebelum refresh agar data di server sempat terupdate
    setTimeout(() => forceRefetch(), 500);
  };

  const handleOpenEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  };

  const handleOpenViewModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewModalOpen(true);
  };

  const handleDeleteRequest = (campaign: Campaign) => {
    setSelectedToDelete(campaign);
    setConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/marketing/${selectedToDelete.id}`);
      toast.success(`Kampanye "${selectedToDelete.subject}" berhasil dihapus.`);
      forceRefetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal menghapus kampanye.';
      toast.error(errorMessage);
    } finally {
      setConfirmOpen(false);
      setSelectedToDelete(null);
      setIsDeleting(false);
    }
  };
  
  return (
    <PageContainer title="Email Marketing" description="Kelola kampanye email marketing">
      <Breadcrumb title="Email Marketing" items={BCrumb} />
      <DashboardCard>
        <CampaignsTable
          onAdd={handleOpenAddModal}
          onEdit={handleOpenEditModal}
          onDeleteRequest={handleDeleteRequest}
          onView={handleOpenViewModal}
          refreshTrigger={refreshTrigger}
        />
      </DashboardCard>
      
      <AddCampaignModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      {selectedCampaign && (
        <>
          <EditCampaignModal open={isEditModalOpen} onClose={handleCloseModals} campaignData={selectedCampaign} onSuccess={handleSuccess} />
          <ViewCampaignModal open={isViewModalOpen} onClose={handleCloseModals} campaignId={selectedCampaign.id} />
        </>
      )}
      
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconAlertTriangle size="1.5rem" color="orange" />
            <Typography variant="h6">Konfirmasi Penghapusan</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>Anda yakin ingin menghapus kampanye "{selectedToDelete?.subject}"? Aksi ini tidak dapat dibatalkan.</Typography>
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

export default CampaignsPage;