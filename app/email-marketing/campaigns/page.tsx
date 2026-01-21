"use client";

import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import CampaignsTable from '@/components/email-marketing/campaigns/CampaignsTable';
import AddCampaignModal from '@/components/email-marketing/campaigns/modals/AddCampaignModal';
import EditCampaignModal from '@/components/email-marketing/campaigns/modals/EditCampaignModal';
import PageHeader from '@/components/ui-mui/page-header';
import { useDeleteCampaign } from '@/lib/hooks/useCampaigns';
import { Campaign } from '@/lib/types/email-marketing';
import { AlertTriangle } from 'lucide-react';

export default function CampaignsPage() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  
  const deleteMutation = useDeleteCampaign();

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  };

  const handleView = (campaign: Campaign) => {
    toast('View statistics coming soon!');
    // TODO: Implement view modal
  };

  const handleDeleteRequest = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(campaignToDelete.id);
      toast.success(`Campaign "${campaignToDelete.subject}" deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete campaign.');
    } finally {
      setConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Campaigns"
        breadcrumbs={[
          { label: "Email Marketing" },
          { label: "Campaigns" },
        ]}
      />

      <div className="mb-6">
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Campaign
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your email marketing campaigns
        </Typography>
      </div>

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <CampaignsTable
          onAdd={handleOpenAddModal}
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          onView={handleView}
          refreshTrigger={refreshTrigger}
        />
      </Card>

      <AddCampaignModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />
      
      <EditCampaignModal 
        open={isEditModalOpen} 
        onClose={handleCloseModals} 
        onSuccess={handleSuccess}
        campaign={selectedCampaign}
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
            Are you sure you want to delete campaign "{campaignToDelete?.subject}"? This action cannot be undone.
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
