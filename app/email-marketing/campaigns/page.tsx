"use client";

import { Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import CampaignsTable from '@/components/email-marketing/campaigns/CampaignsTable';
import AddCampaignModal from '@/components/email-marketing/campaigns/modals/AddCampaignModal';
import { Campaign } from '@/lib/types/email-marketing';
import { AlertTriangle } from 'lucide-react';

export default function CampaignsPage() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const forceRefetch = () => setRefreshTrigger(c => c + 1);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    forceRefetch();
  };

  const handleEdit = (campaign: Campaign) => {
    toast.info('Edit functionality coming soon!');
    // TODO: Implement edit modal
  };

  const handleView = (campaign: Campaign) => {
    toast.info('View statistics coming soon!');
    // TODO: Implement view modal
  };

  const handleDeleteRequest = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    try {
      // MOCK - Simulate success
      const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(500);
      
      toast.success(`Campaign "${campaignToDelete.subject}" deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      toast.error('Failed to delete campaign.');
    } finally {
      setConfirmOpen(false);
      setCampaignToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Campaign</h1>
        <p className="text-gray-600 mt-1">Manage your email marketing campaigns</p>
      </div>

      <Card>
        <CardContent>
          <CampaignsTable
            onAdd={handleOpenAddModal}
            onEdit={handleEdit}
            onDeleteRequest={handleDeleteRequest}
            onView={handleView}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      <AddCampaignModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />

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
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
