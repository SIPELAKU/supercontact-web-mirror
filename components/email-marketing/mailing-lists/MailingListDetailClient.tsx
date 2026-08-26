"use client";

import { useCallback, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import Cookies from 'js-cookie';
import { Eye, History, Mail, Trash2, Upload, UserPlus } from 'lucide-react';

import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import ImportSubscriberModal from '@/components/email-marketing/subscribers/modals/ImportSubscriberModal';
import ImportHistoryModal from '@/components/email-marketing/subscribers/modals/ImportHistoryModal';
import { SubscriberPreviewPopup } from '@/components/email-marketing/subscribers/SubscriberPreviewPopup';
import ViewCampaignStatsModal from '@/components/email-marketing/campaigns/modals/ViewCampaignStatsModal';
import { AppButton } from '@/components/ui/app-button';
import { AppTabs } from '@/components/ui/app-tabs';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { EmptyState } from '@/components/ui/empty-state';
import PageHeader from '@/components/ui/page-header';
import { SuperTable } from '@/components/ui/super-table';
import {
  useBulkDeleteMailingListSubscribers,
  useDeleteAllMailingListSubscribers,
  useDeleteMailingListSubscriber,
  useMailingListCampaigns,
  useMailingListDetail,
} from '@/lib/hooks/useMailingLists';
import { fetchMailingListDetail } from '@/lib/api';
import { notify } from '@/lib/notifications';
import { Campaign, Subscriber } from '@/lib/types/email-marketing';
import { EXPORT_MAX_PAGES, EXPORT_PAGE_SIZE } from '@/lib/constants/export';
import { campaignColumns, subscriberColumns } from './detail-columns';

type ListTab = 'subscribers' | 'campaigns';
const VALID_TABS: ListTab[] = ['subscribers', 'campaigns'];


// Rebuilding the URL from a template silently discards every OTHER query
// param - the table's own ?p / ?q / ?sort included - so switching tabs threw
// away the page and search the user had set. Merge instead of replace.
function withTab(pathname: string, current: URLSearchParams, tab: string) {
  const params = new URLSearchParams(current.toString());
  params.set("tab", tab);
  return `${pathname}?${params.toString()}`;
}

export default function MailingListDetailClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = String(params.id);

  const [activeTab, setActiveTab] = useState<ListTab>(() => {
    const fromUrl = searchParams.get('tab') as ListTab | null;
    return fromUrl && VALID_TABS.includes(fromUrl) ? fromUrl : 'subscribers';
  });

  // Search is already debounced by SuperTable — no extra debounce layer here
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriberPage, setSubscriberPage] = useState(0);
  const [subscriberRowsPerPage, setSubscriberRowsPerPage] = useState(10);
  const [campaignPage, setCampaignPage] = useState(0);
  const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(10);

  const {
    data: mailingListData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useMailingListDetail(
    listId,
    subscriberPage + 1,
    subscriberRowsPerPage,
    activeTab === 'subscribers' ? searchQuery : undefined
  );

  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    isFetching: isFetchingCampaigns,
    isError: isErrorCampaigns,
    error: errorCampaigns,
    refetch: refetchCampaigns,
  } = useMailingListCampaigns(
    listId,
    campaignPage + 1,
    campaignRowsPerPage,
    activeTab === 'campaigns' ? searchQuery : undefined,
    activeTab === 'campaigns'
  );

  const deleteSubscriberMutation = useDeleteMailingListSubscriber();
  const bulkDeleteSubscriberMutation = useBulkDeleteMailingListSubscribers();
  const deleteAllSubscriberMutation = useDeleteAllMailingListSubscribers();

  // Modals
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [previewSubscriber, setPreviewSubscriber] = useState<Subscriber | null>(null);

  // Removal targets. `bulkTarget` holds both the ids and the table's own
  // clearSelection so the checkboxes actually reset after a successful delete.
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [bulkTarget, setBulkTarget] = useState<{
    ids: string[];
    clearSelection: () => void;
  } | null>(null);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const mailingList = mailingListData?.data;
  const subscribers = mailingList?.subscribers?.contacts || [];
  const totalSubscribers = mailingList?.subscribers?.total || 0;
  const campaigns: Campaign[] = campaignsData?.data?.campaigns || [];
  const totalCampaigns = campaignsData?.data?.total || 0;

  const handleTabChange = (tab: ListTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    router.replace(withTab(`/email-marketing/mailing-lists/${listId}`, searchParams, tab), { scroll: false });
  };

  const handleRemoveOne = async () => {
    if (!subscriberToDelete) return;
    try {
      await deleteSubscriberMutation.mutateAsync({
        mailingListId: listId,
        subscriberId: subscriberToDelete.id,
      });
      notify.success('Subscriber removed from list successfully');
    } catch (err: any) {
      notify.error(err.message || 'Failed to remove subscriber');
    } finally {
      setSubscriberToDelete(null);
    }
  };

  const handleRemoveBulk = async () => {
    if (!bulkTarget) return;
    try {
      await bulkDeleteSubscriberMutation.mutateAsync({
        mailingListId: listId,
        contactIds: bulkTarget.ids,
      });
      notify.success(`${bulkTarget.ids.length} subscriber(s) removed from list successfully`);
      bulkTarget.clearSelection();
    } catch (err: any) {
      notify.error(err.message || 'Failed to remove subscribers');
    } finally {
      setBulkTarget(null);
    }
  };

  const handleConfirmDeleteAll = async () => {
    try {
      await deleteAllSubscriberMutation.mutateAsync(listId);
      notify.success('All subscribers removed from list successfully');
    } catch (err: any) {
      notify.error(err.message || 'Failed to remove all subscribers');
    } finally {
      setConfirmAllOpen(false);
    }
  };

  const handleExportSubscribers = useCallback(
    async ({ onProgress }: { onProgress?: (fetched: number, total: number) => void }) => {
      const token = Cookies.get('access_token');
      if (!token) return [];
      let allData: Subscriber[] = [];
      let currentPage = 1;
      let totalPages = 1;
      do {
        const res = await fetchMailingListDetail(
          token,
          listId,
          currentPage,
          EXPORT_PAGE_SIZE,
          searchQuery || undefined
        );
        const chunk = res?.data?.subscribers?.contacts || [];
        const total = res?.data?.subscribers?.total || 0;
        allData = [...allData, ...chunk];
        totalPages = Math.min(Math.ceil(total / EXPORT_PAGE_SIZE) || 1, EXPORT_MAX_PAGES);
        onProgress?.(allData.length, total);
        currentPage++;
      } while (currentPage <= totalPages);
      return allData;
    },
    [listId, searchQuery]
  );

  if (error && !mailingListData) {
    return (
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <PageHeader
          title="Mailing List"
          breadcrumbs={[
            { label: 'Email Marketing', href: '/email-marketing' },
            { label: 'Mailing Lists', href: '/email-marketing/mailing-lists' },
          ]}
        />
        <EmptyState
          icon={Mail}
          title="We could not load this mailing list"
          description="It may have been deleted, or the request failed. Try again, or go back to the list."
          action={{
            label: 'Back to Mailing Lists',
            onClick: () => router.push('/email-marketing/mailing-lists'),
          }}
        />
      </div>
    );
  }

  if (isLoading && !mailingListData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!mailingList) return null;

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      {/* One heading, not three. This page used to render PageHeader with the
          list name, then a "Back to Mailing Lists" button, then an <h5> with
          the same name again plus a chip labelled in Indonesian ("Kontak") in
          an English-only app. The breadcrumb is the way back. */}
      <PageHeader
        title={mailingList.name}
        description={`${(mailingList.subscriber_count ?? 0).toLocaleString()} subscriber(s) in this list.`}
        breadcrumbs={[
          { label: 'Email Marketing', href: '/email-marketing' },
          { label: 'Mailing Lists', href: '/email-marketing/mailing-lists' },
          { label: mailingList.name },
        ]}
        actions={
          activeTab === 'subscribers' ? (
            <>
              <AppButton
                variantStyle="outline"
                color="gray"
                startIcon={<History size={16} />}
                onClick={() => setShowImportHistoryModal(true)}
              >
                History
              </AppButton>
              <AppButton
                variantStyle="outline"
                startIcon={<Upload size={16} />}
                onClick={() => setShowImportModal(true)}
              >
                Import
              </AppButton>
              <AppButton
                variantStyle="primary"
                startIcon={<UserPlus size={16} />}
                onClick={() => setShowAddSubscriberModal(true)}
              >
                Add Subscriber
              </AppButton>
            </>
          ) : undefined
        }
      />

      <AppTabs<ListTab>
        value={activeTab}
        onChange={handleTabChange}
        tabs={[
          { value: 'subscribers', label: 'Subscribers' },
          { value: 'campaigns', label: 'Sent Campaigns' },
        ]}
      />

      {activeTab === 'subscribers' && (
        <SuperTable<Subscriber>
          tableId="mailing-list-subscribers-table"
          urlKey="subs"
          exportFileName={`${mailingList.name} Subscribers`}
          data={subscribers}
          columns={subscriberColumns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={!!error}
          errorMessage={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          renderEmptyState={() => (
            <EmptyState
              icon={UserPlus}
              title="No subscribers in this list"
              description="Add subscribers or import a list to grow this mailing list."
              action={{
                label: 'Add Subscriber',
                onClick: () => setShowAddSubscriberModal(true),
                icon: <UserPlus size={16} />,
              }}
            />
          )}
          rowCount={totalSubscribers}
          manualPagination={true}
          manualFiltering={true}
          onStateChange={(state) => {
            const searchChanged =
              state.globalFilter !== undefined && state.globalFilter !== searchQuery;
            if (searchChanged) {
              setSearchQuery(state.globalFilter);
              setSubscriberPage(0);
              setSubscriberRowsPerPage(state.pagination?.pageSize ?? subscriberRowsPerPage);
            } else if (state.pagination) {
              setSubscriberPage(state.pagination.pageIndex);
              setSubscriberRowsPerPage(state.pagination.pageSize);
            }
          }}
          onExportRequest={handleExportSubscribers as any}
          initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
          features={{
            globalFilter: true,
            globalFilterAlwaysVisible: true,
            // The detail endpoint takes page/limit/search only, so a sort arrow
            // here could reorder no more than the ten visible rows.
            sorting: false,
            columnFilters: false,
            rowSelection: 'multi',
            pagination: true,
            columnVisibility: true,
            densityToggle: true,
            fullScreenToggle: true,
            urlSync: true,
            export: { excel: true, csv: true },
          }}
          renderRowActions={({ row }) => (
            <div className="flex gap-1">
              <Tooltip title="Preview">
                <IconButton
                  size="small"
                  aria-label="Preview subscriber"
                  onClick={() => setPreviewSubscriber(row.original)}
                  sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.light' } }}
                >
                  <Eye size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove from list">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove from list"
                  onClick={() => setSubscriberToDelete(row.original)}
                >
                  <Trash2 size={18} />
                </IconButton>
              </Tooltip>
            </div>
          )}
          renderBulkActions={({ selectedRows, clearSelection }) => (
            <div className="flex gap-2 items-center flex-wrap">
              <AppButton
                variantStyle="danger"
                startIcon={<Trash2 size={16} />}
                onClick={() =>
                  // selectedRows are already row.original objects. The old code
                  // read `r.original.id` off them, which threw inside an
                  // un-awaited async handler — an unhandled rejection, so the
                  // button silently did nothing at all.
                  setBulkTarget({
                    ids: (selectedRows as Subscriber[]).map((r) => r.id),
                    clearSelection,
                  })
                }
              >
                Remove ({selectedRows.length})
              </AppButton>
              <AppButton
                variantStyle="soft"
                color="danger"
                startIcon={<Trash2 size={16} />}
                onClick={() => setConfirmAllOpen(true)}
              >
                Remove all
              </AppButton>
            </div>
          )}
        />
      )}

      {activeTab === 'campaigns' && (
        <SuperTable<Campaign>
          tableId="mailing-list-campaigns-table"
          urlKey="camp"
          exportFileName={`${mailingList.name} Campaigns`}
          data={campaigns}
          columns={campaignColumns}
          getRowId={(row) => row.id}
          isLoading={isLoadingCampaigns}
          isFetching={isFetchingCampaigns}
          isError={isErrorCampaigns}
          errorMessage={errorCampaigns instanceof Error ? errorCampaigns.message : undefined}
          onRetry={() => refetchCampaigns()}
          renderEmptyState={() => (
            <EmptyState
              icon={Mail}
              title="No campaigns sent to this list"
              description="Campaigns sent to this mailing list will appear here."
            />
          )}
          rowCount={totalCampaigns}
          manualPagination={true}
          manualFiltering={true}
          onStateChange={(state) => {
            const searchChanged =
              state.globalFilter !== undefined && state.globalFilter !== searchQuery;
            if (searchChanged) {
              setSearchQuery(state.globalFilter);
              setCampaignPage(0);
              setCampaignRowsPerPage(state.pagination?.pageSize ?? campaignRowsPerPage);
            } else if (state.pagination) {
              setCampaignPage(state.pagination.pageIndex);
              setCampaignRowsPerPage(state.pagination.pageSize);
            }
          }}
          initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
          features={{
            globalFilter: true,
            globalFilterAlwaysVisible: true,
            // Same reason as the subscribers tab: this endpoint has no sort
            // params, so an arrow would only sort the current page.
            sorting: false,
            columnFilters: false,
            pagination: true,
            columnVisibility: true,
            densityToggle: true,
            fullScreenToggle: true,
            urlSync: true,
          }}
          renderRowActions={({ row }) => (
            <Tooltip title="View statistics">
              <IconButton
                size="small"
                aria-label="View campaign statistics"
                onClick={() => {
                  setSelectedCampaign(row.original);
                  setViewModalOpen(true);
                }}
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
          )}
        />
      )}

      <AddSubscriberModal
        open={showAddSubscriberModal}
        onClose={() => setShowAddSubscriberModal(false)}
        onSuccess={() => setShowAddSubscriberModal(false)}
        defaultListId={listId}
        target="mailing_list"
      />

      <ImportSubscriberModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        // The import runs in the background; History polls the job and
        // invalidates this list when it completes.
        onSuccess={() => {
          setShowImportModal(false);
          setShowImportHistoryModal(true);
        }}
        mailingListIds={[listId]}
      />

      <ImportHistoryModal
        open={showImportHistoryModal}
        onClose={() => setShowImportHistoryModal(false)}
        targetFilter={['mailing_list']}
        storageKey="import_interval_mailing_list"
        mailingListIds={[listId]}
      />

      <ConfirmationPopup
        isOpen={Boolean(subscriberToDelete)}
        onClose={() => {
          if (!deleteSubscriberMutation.isPending) setSubscriberToDelete(null);
        }}
        onConfirm={handleRemoveOne}
        title="Remove Subscriber"
        description={
          <>
            Are you sure you want to remove <strong>{subscriberToDelete?.email}</strong> from this
            mailing list?
          </>
        }
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteSubscriberMutation.isPending}
      />

      <ConfirmationPopup
        isOpen={Boolean(bulkTarget)}
        onClose={() => {
          if (!bulkDeleteSubscriberMutation.isPending) setBulkTarget(null);
        }}
        onConfirm={handleRemoveBulk}
        title="Remove Subscribers"
        description={
          <>
            Are you sure you want to remove <strong>{bulkTarget?.ids.length}</strong> selected
            subscriber(s) from this mailing list?
          </>
        }
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={bulkDeleteSubscriberMutation.isPending}
      />

      <ViewCampaignStatsModal
        open={isViewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
      />

      <SubscriberPreviewPopup
        subscriber={previewSubscriber}
        onClose={() => setPreviewSubscriber(null)}
      />

      <ConfirmationPopup
        isOpen={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Remove All Subscribers"
        description={
          <>
            <strong>WARNING:</strong> Are you sure you want to remove <strong>all subscribers</strong>{' '}
            from this mailing list? This only removes them from the list — the contacts themselves
            are kept.
          </>
        }
        confirmText="Remove All"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteAllSubscriberMutation.isPending}
      />
    </div>
  );
}
