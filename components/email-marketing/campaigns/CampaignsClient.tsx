"use client";

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { notify } from '@/lib/notifications';
import { handleError } from '@/lib/utils/errorHandler';
import { useAuth } from '@/lib/context/AuthContext';
import { SuperTableState } from '@/components/ui/super-table';
import { Plus } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';

import CampaignsTable from '@/components/email-marketing/campaigns/CampaignsTable';
import ViewCampaignStatsModal from '@/components/email-marketing/campaigns/modals/ViewCampaignStatsModal';
import PageHeader from '@/components/ui/page-header';
import { TableFilterBar, TableFilterValues } from '@/components/ui/table-filter-bar';
import { useDeleteCampaign, useCampaigns, useDuplicateCampaigns, useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import { fetchCampaigns } from '@/lib/api';
import { Campaign } from '@/lib/types/email-marketing';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import {
  CAMPAIGN_STATUS_OPTIONS,
  canDeleteCampaign,
  deletingLosesHistory,
} from '@/lib/constants/campaign-status';
import { EXPORT_MAX_PAGES, EXPORT_PAGE_SIZE } from '@/lib/constants/export';

export default function CampaignsClient() {
  const router = useRouter();
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const { token } = useAuth();
  const deleteMutation = useDeleteCampaign();
  const duplicateMutation = useDuplicateCampaigns();
  const updateMutation = useUpdateCampaign();
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDuplicating, setIsBulkDuplicating] = useState(false);
  const [resendingCampaignId, setResendingCampaignId] = useState<string | null>(null);
  const [stoppingCampaignId, setStoppingCampaignId] = useState<string | null>(null);

  // SuperTable state + the filter bar's values, which the API now honours.
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 10,
    globalFilter: "",
    sorting: [] as { id: string; desc: boolean }[],
  });
  // The status filter lives in the URL alongside SuperTable's own ?p/?q/?sort,
  // so a filtered view survives a refresh and can be pasted to a colleague.
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filters: TableFilterValues = useMemo(
    () => ({ status: searchParams.get('status') || undefined }),
    [searchParams]
  );

  const handleTableStateChange = (state: SuperTableState) => {
    setTableState((prev) => {
      const searchChanged = state.globalFilter !== prev.globalFilter;
      const sizeChanged = state.pagination.pageSize !== prev.pageSize;
      return {
        // With manualPagination, TanStack sets autoResetPageIndex to false, so
        // nothing resets the page for us. Searching from page 5 used to ask the
        // server for page 5 of the filtered result and render an empty table.
        pageIndex: searchChanged || sizeChanged ? 0 : state.pagination.pageIndex,
        pageSize: state.pagination.pageSize,
        globalFilter: state.globalFilter,
        sorting: state.sorting || [],
      };
    });
  };

  const handleFiltersChange = (next: TableFilterValues) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next.status) params.set('status', next.status);
    else params.delete('status');
    // Filtering changes the result set, so page 1 is the only sane landing
    // spot — and SuperTable's own ?p key has to go with it.
    params.delete('p');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setTableState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const pageParam = tableState.pageIndex + 1; // Backend 1-indexed
  const limitParam = tableState.pageSize;
  const searchParam = tableState.globalFilter || "";
  const statusParam = filters.status || undefined;

  // Server-side sorting (sort_by/sort_order contract)
  const sortParam = tableState.sorting[0];
  const sortByParam = sortParam?.id;
  const sortOrderParam: 'asc' | 'desc' | undefined = sortParam
    ? (sortParam.desc ? 'desc' : 'asc')
    : undefined;

  const {
    data: campaignsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCampaigns(pageParam, limitParam, searchParam, statusParam, sortByParam, sortOrderParam);

  const campaigns = campaignsResponse?.data?.campaigns || [];
  const totalCount = campaignsResponse?.data?.total || 0;

  const statusFilters = useMemo(
    () => [
      {
        id: 'status',
        label: 'Status',
        anyLabel: 'Any status',
        // Straight from the API's CampaignStatus enum. The old hard-coded list
        // offered "Sending" and "Canceled" (which don't exist) and hid
        // Processing, Failed and Stopped (which do).
        options: CAMPAIGN_STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
      },
    ],
    []
  );

  const handleExportRequest = useCallback(
    async ({ onProgress }: { onProgress?: (fetched: number, total: number) => void }): Promise<Campaign[]> => {
      if (!token) throw new Error("No authorization token");
      let allData: Campaign[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const resp = await fetchCampaigns(
          token,
          currentPage,
          EXPORT_PAGE_SIZE,
          searchParam,
          statusParam,
          sortByParam,
          sortOrderParam
        );
        if (!resp.success) throw new Error("Failed to fetch page data for export");

        allData = [...allData, ...resp.data.campaigns];
        totalPages = Math.min(
          Math.ceil(resp.data.total / EXPORT_PAGE_SIZE) || 1,
          EXPORT_MAX_PAGES
        );
        onProgress?.(allData.length, resp.data.total);
        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    },
    [token, searchParam, statusParam, sortByParam, sortOrderParam]
  );

  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    campaigns: Campaign[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkDelete = (selectedCampaigns: Campaign[], clearSelection: () => void) => {
    setBulkDeleteTarget({ campaigns: selectedCampaigns, clearSelection });
  };

  // Skips follow the API's rule (In Queue / Processing must be stopped first),
  // not the old ['Draft'] allow-list which silently skipped Sent, Failed and
  // Stopped campaigns the server would happily have deleted.
  const bulkDeletable = bulkDeleteTarget?.campaigns.filter((c) => canDeleteCampaign(c.status)) ?? [];
  const bulkSkipped = bulkDeleteTarget?.campaigns.filter((c) => !canDeleteCampaign(c.status)) ?? [];

  const performBulkDelete = async () => {
    if (!bulkDeleteTarget) return;
    const { clearSelection } = bulkDeleteTarget;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const campaign of bulkDeletable) {
      try {
        await deleteMutation.mutateAsync(campaign.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    setBulkDeleteTarget(null);
    clearSelection();

    if (successCount > 0) notify.success(`${successCount} campaign(s) deleted successfully`);
    if (failCount > 0) notify.error(`${failCount} campaign(s) failed to delete`);
    if (bulkSkipped.length > 0) {
      notify.warning(`${bulkSkipped.length} campaign(s) skipped — stop them before deleting`, {
        description: bulkSkipped.map((c) => `${c.subject} (${c.status})`).join(', '),
      });
    }
    refetch();
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      await duplicateMutation.mutateAsync([campaign.id]);
      notify.success(`Campaign "${campaign.subject}" duplicated successfully.`);
    } catch (err: any) {
      notify.error(handleError(err, "Duplicate Campaign"));
    }
  };

  const handleResend = async (campaign: Campaign) => {
    setResendingCampaignId(campaign.id);
    try {
      await updateMutation.mutateAsync({ campaignId: campaign.id, data: { action: 'send' } });
      notify.success(`Campaign "${campaign.subject}" has been queued for resending.`);
    } catch (err: any) {
      notify.error(handleError(err, "Resend Campaign"));
    } finally {
      setResendingCampaignId(null);
    }
  };

  // The API has supported `action: 'stop'` all along and the type was already
  // declared in the frontend, but nothing ever called it — so an In Queue
  // campaign could neither be stopped nor deleted (deletion requires stopping
  // first), leaving no way out but waiting for the send to finish.
  const handleStop = async (campaign: Campaign) => {
    setStoppingCampaignId(campaign.id);
    try {
      await updateMutation.mutateAsync({ campaignId: campaign.id, data: { action: 'stop' } });
      notify.success(`Campaign "${campaign.subject}" stopped.`);
    } catch (err: any) {
      notify.error(handleError(err, "Stop Campaign"));
    } finally {
      setStoppingCampaignId(null);
    }
  };

  const handleBulkDuplicate = async (selectedCampaigns: Campaign[], clearSelection: () => void) => {
    setIsBulkDuplicating(true);
    try {
      await duplicateMutation.mutateAsync(selectedCampaigns.map((c) => c.id));
      notify.success(`${selectedCampaigns.length} campaigns duplicated successfully.`);
      clearSelection();
    } catch (err: any) {
      notify.error(handleError(err, "Bulk Duplicate Campaigns"));
    } finally {
      setIsBulkDuplicating(false);
    }
  };

  const handleAdd = () => router.push('/email-marketing/campaigns/new');
  const handleEdit = (campaign: Campaign) =>
    router.push(`/email-marketing/campaigns/${campaign.id}/edit`);

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
        description="Every email blast you have written, with its delivery and open figures."
        breadcrumbs={[
          { label: "Email Marketing", href: "/email-marketing" },
          { label: "Campaigns" },
        ]}
        actions={
          <AppButton variantStyle="primary" onClick={handleAdd} startIcon={<Plus size={16} />}>
            Add Campaign
          </AppButton>
        }
      />

      <div>
        <TableFilterBar
          filters={statusFilters}
          values={filters}
          onChange={handleFiltersChange}
        />

        <CampaignsTable
          campaigns={campaigns}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorMessage={isError && error ? handleError(error, "Fetch Campaigns") : undefined}
          onRetry={() => refetch()}
          onAdd={handleAdd}
          rowCount={totalCount}
          onStateChange={handleTableStateChange}
          onExportRequest={handleExportRequest as any}
          resetPageKey={statusParam ?? ''}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onView={handleView}
          onDuplicate={handleDuplicate}
          onResend={handleResend}
          onStop={handleStop}
          resendingCampaignId={resendingCampaignId}
          stoppingCampaignId={stoppingCampaignId}
          onBulkDelete={handleBulkDelete}
          onBulkDuplicate={handleBulkDuplicate}
          isBulkDeleting={isBulkDeleting}
          isBulkDuplicating={isBulkDuplicating}
        />
      </div>

      <ViewCampaignStatsModal
        open={isViewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onResend={handleResend}
        isResending={!!selectedCampaign && resendingCampaignId === selectedCampaign.id}
      />

      <ConfirmationPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={
          campaignToDelete && deletingLosesHistory(campaignToDelete.status) ? (
            <>
              Delete <strong>&quot;{campaignToDelete.subject}&quot;</strong>? It has already been
              sent, so its delivery and open statistics will be deleted with it. This cannot be
              undone.
            </>
          ) : (
            <>
              Are you sure you want to delete campaign{" "}
              <strong>&quot;{campaignToDelete?.subject}&quot;</strong>? This action cannot be undone.
            </>
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmationPopup
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={performBulkDelete}
        title={`Delete ${bulkDeletable.length} campaign(s)?`}
        description={
          <>
            {bulkDeletable.some((c) => deletingLosesHistory(c.status)) && (
              <>
                Some of these have already been sent — their delivery and open statistics go with
                them.{" "}
              </>
            )}
            {bulkSkipped.length > 0 && (
              <>
                {bulkSkipped.length} campaign(s) will be skipped because they are still sending;
                stop them first.{" "}
              </>
            )}
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
