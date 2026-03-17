"use client";


import { Card, Typography } from '@mui/material';
import { useState, useMemo } from 'react';
import { notify } from '@/lib/notifications';
import { handleError } from '@/lib/utils/errorHandler';
import { useAuth } from '@/lib/context/AuthContext';
import { SuperTableState } from '@/components/ui/super-table';
import { Plus } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';

import CampaignsTable from '@/components/email-marketing/campaigns/CampaignsTable';
import AddCampaignModal from '@/components/email-marketing/campaigns/modals/AddCampaignModal';
import EditCampaignModal from '@/components/email-marketing/campaigns/modals/EditCampaignModal';
import ViewCampaignStatsModal from '@/components/email-marketing/campaigns/modals/ViewCampaignStatsModal';
import PageHeader from '@/components/ui/page-header';
import { useDeleteCampaign, useCampaigns } from '@/lib/hooks/useCampaigns';
import { fetchCampaigns } from '@/lib/api';
import { Campaign } from '@/lib/types/email-marketing';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';

export default function CampaignsClient() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const { token } = useAuth();
  const deleteMutation = useDeleteCampaign();
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // SuperTable State Hook
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 10,
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[],
  });

  const handleTableStateChange = (state: SuperTableState) => {
    setTableState({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      globalFilter: state.globalFilter,
      columnFilters: state.columnFilters || [],
    });
  };

  const getFilterValue = (id: string) => {
    const filter = tableState.columnFilters.find((f: { id: string; value: unknown }) => f.id === id);
    return filter ? (filter.value as string) : "";
  };

  const pageParam = tableState.pageIndex + 1; // Backend 1-indexed
  const limitParam = tableState.pageSize;
  const searchParam = tableState.globalFilter || "";
  const statusParam = getFilterValue("status") || undefined;

  // React Query Fetcher (Main Table Data)
  const {
    data: campaignsResponse,
    isLoading,
    isError,
    error,
  } = useCampaigns(pageParam, limitParam, searchParam);

  // Extract status filter dari columnFilters
  const statusFilter = tableState.columnFilters
    .find((f: {id: string; value: unknown}) => f.id === 'status')
    ?.value as string | undefined;

  // Filter campaigns berdasarkan status jika ada
  const filteredCampaigns = useMemo(() => {
    if (!statusFilter || statusFilter === '') {
      return campaignsResponse?.data?.campaigns || [];
    }
    return (campaignsResponse?.data?.campaigns || []).filter(
      (c: Campaign) => c.status === statusFilter
    );
  }, [campaignsResponse, statusFilter]);

  const totalCount = campaignsResponse?.data?.total || 0;

  // Manual API Fetcher for Export Function (Do-While Loop)
  const handleExportRequest = async (params: { format: 'excel' | 'csv' }): Promise<Campaign[]> => {
    if (!token) throw new Error("No authorization token");
    let allData: Campaign[] = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const resp = await fetchCampaigns(token, currentPage, 1000, searchParam);
      
      if (!resp.success) {
        throw new Error("Failed to fetch page data for export");
      }
      
      allData = [...allData, ...resp.data.campaigns];
      totalPages = Math.ceil(resp.data.total / resp.data.limit);
      currentPage++;
      
    } while (currentPage <= totalPages);
    
    return allData;
  };

  const handleBulkDelete = async (
    selectedCampaigns: Campaign[],
    clearSelection: () => void
  ) => {
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const skippedNames: string[] = [];

    const deletableStatuses = ['Draft'];
    
    for (const campaign of selectedCampaigns) {
      // Skip jika status tidak boleh dihapus
      if (!deletableStatuses.includes(campaign.status)) {
        skippedCount++;
        skippedNames.push(`${campaign.subject} (${campaign.status})`);
        continue;
      }
      
      try {
        await deleteMutation.mutateAsync(campaign.id);
        successCount++;
      } catch {
        failCount++;
      }
    }
    
    setIsBulkDeleting(false);
    clearSelection();
    
    if (successCount > 0) notify.success(`${successCount} kampanye berhasil dihapus`);
    if (failCount > 0) notify.error(`${failCount} kampanye gagal dihapus`);
    if (skippedCount > 0) {
      notify.warning(
        `${skippedCount} kampanye dilewati karena tidak dapat dihapus`,
        { description: skippedNames.join(', ') }
      );
    }
    
    forceRefetch();
  };

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
    forceRefetch();
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  };

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewModalOpen(true);
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

      <CampaignsTable
        campaigns={filteredCampaigns}
        isLoading={isLoading}
        isError={isError}
        rowCount={totalCount}
        onStateChange={handleTableStateChange}
        onExportRequest={handleExportRequest}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onView={handleView}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        renderTopLeftToolbar={() => (
          <>
            {/* Desktop */}
            <div className="hidden md:flex gap-2">
              <AppButton onClick={handleOpenAddModal}
                startIcon={<Plus size={16} />}>
                Create Campaign
              </AppButton>
            </div>

            {/* Mobile — icon only w-9 h-9 */}
            <div className="flex md:hidden gap-2">
              <button onClick={handleOpenAddModal}
                className="flex items-center justify-center w-9 h-9 
                           rounded-md bg-[#5479EE] text-white 
                           hover:bg-[#3F66E0] transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </>
        )}
      />

      <AddCampaignModal open={isAddModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />

      <EditCampaignModal
        open={isEditModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        campaign={selectedCampaign}
      />

      <ViewCampaignStatsModal
        open={isViewModalOpen}
        onClose={handleCloseModals}
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
