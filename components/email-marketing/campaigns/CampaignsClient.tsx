"use client";


import { Card, Typography } from '@mui/material';
import { useState } from 'react';
import { notify } from '@/lib/notifications';

import CampaignsTable from '@/components/email-marketing/campaigns/CampaignsTable';
import AddCampaignModal from '@/components/email-marketing/campaigns/modals/AddCampaignModal';
import EditCampaignModal from '@/components/email-marketing/campaigns/modals/EditCampaignModal';
import PageHeader from '@/components/ui/page-header';
import { useDeleteCampaign } from '@/lib/hooks/useCampaigns';
import { Campaign } from '@/lib/types/email-marketing';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';

export default function CampaignsClient() {
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
    notify.info('View statistics coming soon!');
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
      notify.success(`Campaign "${campaignToDelete.subject}" deleted successfully.`);
      forceRefetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete campaign.');
    } finally {
      setConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Campaigns"
        breadcrumbs={[
          { label: "Email Marketing" },
          { label: "Campaigns" },
        ]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
            Campaign
          </Typography>
        </div>
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

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete campaign "${campaignToDelete?.subject}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
