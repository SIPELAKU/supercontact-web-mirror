// app/email-marketing/mailing-lists/[id]/page.tsx
"use client";

import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import ImportSubscriberModal from '@/components/email-marketing/subscribers/modals/ImportSubscriberModal';
import ImportHistoryModal from '@/components/email-marketing/subscribers/modals/ImportHistoryModal';
import { SubscriberPreviewPopup } from '@/components/email-marketing/subscribers/SubscriberPreviewPopup';
import { AppButton } from '@/components/ui/app-button';
import PageHeader from '@/components/ui/page-header';
import { useMailingListDetail, useDeleteMailingListSubscriber, useBulkDeleteMailingListSubscribers, useDeleteAllMailingListSubscribers, useMailingListCampaigns } from '@/lib/hooks/useMailingLists';
import { Campaign, Subscriber } from '@/lib/types/email-marketing';
import ViewCampaignStatsModal from '@/components/email-marketing/campaigns/modals/ViewCampaignStatsModal';
import { SuperTable } from '@/components/ui/super-table';
import { subscriberColumns, campaignColumns } from './columns';
import {
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    Stack
} from '@mui/material';
import { format }
    from 'date-fns';
import { AlertTriangle, ArrowLeft, Download, Eye, Mail, Search, Trash2, UserPlus, History } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { notify } from '@/lib/notifications';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const MailingListDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const listId = String(params.id);

    const [activeTab, setActiveTab] = useState(0);
    // Search is already debounced by SuperTable (500ms) — no extra debounce layer here
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination for subscribers
    const [subscriberPage, setSubscriberPage] = useState(0);
    const [subscriberRowsPerPage, setSubscriberRowsPerPage] = useState(10);

    // Pagination for campaigns
    const [campaignPage, setCampaignPage] = useState(0);
    const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(10);

    const { data: mailingListData, isLoading, isFetching, error, refetch } = useMailingListDetail(listId, subscriberPage + 1, subscriberRowsPerPage, activeTab === 0 ? searchQuery : undefined);
    const deleteSubscriberMutation = useDeleteMailingListSubscriber();
    const bulkDeleteSubscriberMutation = useBulkDeleteMailingListSubscribers();
    const deleteAllSubscriberMutation = useDeleteAllMailingListSubscribers();
    const [subscriberToDelete, setSubscriberToDelete] = useState<any>(null);
    const [confirmAllOpen, setConfirmAllOpen] = useState(false);
    const { data: campaignsData, isLoading: isLoadingCampaigns, isFetching: isFetchingCampaigns, isError: isErrorCampaigns, error: errorCampaigns, refetch: refetchCampaigns } = useMailingListCampaigns(listId, campaignPage + 1, campaignRowsPerPage, activeTab === 1 ? searchQuery : undefined, activeTab === 1);

    // Modals
    const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [previewSubscriber, setPreviewSubscriber] = useState<Subscriber | null>(null);
    const [selectedToDelete, setSelectedToDelete] = useState<string[]>([]);

    const mailingList = mailingListData?.data;
    const subscribers = mailingList?.subscribers?.contacts || [];
    const campaigns: Campaign[] = campaignsData?.data?.campaigns || [];
    const totalCampaigns = campaignsData?.data?.total || 0;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
    };

    const handleDeleteSubscriber = async () => {
        try {
            if (subscriberToDelete?.id === 'BULK') {
                await bulkDeleteSubscriberMutation.mutateAsync({
                    mailingListId: listId,
                    contactIds: selectedToDelete
                });
                notify.success(`${selectedToDelete.length} subscriber(s) removed from list successfully`);
            } else if (subscriberToDelete) {
                await deleteSubscriberMutation.mutateAsync({
                    mailingListId: listId,
                    subscriberId: subscriberToDelete.id
                });
                notify.success('Subscriber removed from list successfully');
            }

            setSubscriberToDelete(null);
            setSelectedToDelete([]);
        } catch (err: any) {
            notify.error(err.message || 'Failed to remove subscriber(s)');
        }
    };

    const handleConfirmDeleteAll = async () => {
        try {
            await deleteAllSubscriberMutation.mutateAsync(listId);
            notify.success('All subscribers removed from list successfully');
            setConfirmAllOpen(false);
            setSelectedToDelete([]);
        } catch (err: any) {
            notify.error(err.message || 'Failed to remove all subscribers');
        }
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = filteredSubscribers.map((n) => n.id);
            setSelectedToDelete(newSelecteds);
            return;
        }
        setSelectedToDelete([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selectedIndex = selectedToDelete.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedToDelete, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedToDelete.slice(1));
        } else if (selectedIndex === selectedToDelete.length - 1) {
            newSelected = newSelected.concat(selectedToDelete.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedToDelete.slice(0, selectedIndex),
                selectedToDelete.slice(selectedIndex + 1),
            );
        }
        setSelectedToDelete(newSelected);
    };

    const handleBulkDelete = async (selectedRows: any[], clearSelection: () => void) => {
        setSelectedToDelete(selectedRows.map(r => r.original.id));
        setSubscriberToDelete({ id: 'BULK', email: 'selected' });
        // The actual deletion happens in handleDeleteSubscriber which should call clearSelection
        // But for now we just store the clearSelection function if needed, 
        // or just let the user confirm and then we'll refresh.
    };

    // Server-filtered subscribers
    const filteredSubscribers = subscribers;
    const totalSubscribers = mailingList?.subscribers?.total || 0;

    // Full-page fallback only for a hard initial failure — once the list is
    // loaded, later query errors surface inside the tables (with Retry).
    if (error && !mailingListData) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load mailing list details</Typography>
                <AppButton onClick={() => router.push('/email-marketing/mailing-lists')} sx={{ mt: 2 }}>
                    Back to Mailing Lists
                </AppButton>
            </Box>
        );
    }

    if (isLoading && !mailingListData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!mailingList) {
        return null;
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Page Header */}
            <PageHeader
                title={mailingList.name}
                breadcrumbs={[
                    { label: "Email Marketing" },
                    { label: "Mailing Lists" },
                    { label: mailingList.name }
                ]}
            />

            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
                <AppButton
                    variantStyle="outline"
                    color="primary"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => router.push('/email-marketing/mailing-lists')}
                    sx={{ textTransform: 'none' }}
                >
                    Back to Mailing Lists
                </AppButton>
            </Box>

            {/* Title with Contact Count Chip */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {mailingList.name}
                </Typography>
                <Chip
                    label={`${mailingList.subscriber_count} Kontak`}
                    color="primary"
                    size="medium"
                />
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Subscribers" />
                    <Tab label="Sent Campaigns" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Subscribers Tab */}
                {activeTab === 0 && (
                    <SuperTable<Subscriber>
                        tableId="mailing-list-subscribers-table"
                        data={subscribers}
                        columns={subscriberColumns}
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
                                    label: "Add Subscriber",
                                    onClick: () => setShowAddSubscriberModal(true),
                                    icon: <UserPlus size={16} />,
                                }}
                            />
                        )}
                        rowCount={totalSubscribers}
                        manualPagination={true}
                        manualFiltering={true}
                        onStateChange={(state) => {
                            const searchChanged = state.globalFilter !== undefined && state.globalFilter !== searchQuery;
                            if (searchChanged) {
                                setSearchQuery(state.globalFilter);
                                setSubscriberPage(0); // Reset to first page on search
                                setSubscriberRowsPerPage(state.pagination?.pageSize ?? subscriberRowsPerPage);
                            } else if (state.pagination) {
                                setSubscriberPage(state.pagination.pageIndex);
                                setSubscriberRowsPerPage(state.pagination.pageSize);
                            }
                        }}
                        features={{
                            globalFilter: true,
                            rowSelection: "multi",
                            pagination: true,
                            densityToggle: true,
                            fullScreenToggle: true,
                        }}
                        renderRowActions={({ row }) => (
                            <div className="flex gap-1">
                                <Tooltip title="Preview">
                                    <IconButton
                                        size="small"
                                        onClick={() => setPreviewSubscriber(row.original)}
                                        sx={{ color: '#5479EE', '&:hover': { bgcolor: '#EEF2FF' } }}
                                    >
                                        <Eye size={18} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => setSubscriberToDelete(row.original)}
                                    >
                                        <Trash2 size={18} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )}
                        renderTopLeftToolbar={() => (
                            <div className="flex gap-2">
                                <AppButton
                                    variantStyle="outline"
                                    startIcon={<Download size={18} />}
                                    onClick={() => setShowImportModal(true)}
                                    sx={{ height: '40px' }}
                                >
                                    Import
                                </AppButton>
                                <AppButton
                                    variantStyle="outline"
                                    startIcon={<History size={18} />}
                                    onClick={() => setShowImportHistoryModal(true)}
                                    sx={{ height: '40px' }}
                                >
                                    History
                                </AppButton>
                                <AppButton
                                    variantStyle="primary"
                                    startIcon={<UserPlus size={18} />}
                                    onClick={() => setShowAddSubscriberModal(true)}
                                    sx={{ height: '40px' }}
                                >
                                    Add Subscriber
                                </AppButton>
                            </div>
                        )}
                        renderBulkActions={({ selectedRows, clearSelection }) => (
                            <div className="flex gap-2 items-center">
                                <AppButton
                                    variantStyle="danger"
                                    startIcon={<Trash2 size={18} />}
                                    onClick={() => handleBulkDelete(selectedRows, clearSelection)}
                                    sx={{ height: '40px' }}
                                >
                                    Delete ({selectedRows.length})
                                </AppButton>
                                <AppButton
                                    variantStyle="soft"
                                    color="danger"
                                    startIcon={<Trash2 size={18} />}
                                    onClick={() => setConfirmAllOpen(true)}
                                    sx={{ height: '40px' }}
                                >
                                    Delete All Data
                                </AppButton>
                            </div>
                        )}
                    />
                )}

                {/* Campaigns Tab */}
                {activeTab === 1 && (
                    <SuperTable<Campaign>
                        tableId="mailing-list-campaigns-table"
                        data={campaigns}
                        columns={campaignColumns}
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
                            const searchChanged = state.globalFilter !== undefined && state.globalFilter !== searchQuery;
                            if (searchChanged) {
                                setSearchQuery(state.globalFilter);
                                setCampaignPage(0); // Reset to first page on search
                                setCampaignRowsPerPage(state.pagination?.pageSize ?? campaignRowsPerPage);
                            } else if (state.pagination) {
                                setCampaignPage(state.pagination.pageIndex);
                                setCampaignRowsPerPage(state.pagination.pageSize);
                            }
                        }}
                        features={{
                            globalFilter: true,
                            pagination: true,
                            densityToggle: true,
                            fullScreenToggle: true,
                        }}
                        renderRowActions={({ row }) => (
                            <Tooltip title="View Statistics">
                                <IconButton
                                    size="small"
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
            </div>

            {/* Add Subscriber Modal */}
            <AddSubscriberModal
                open={showAddSubscriberModal}
                onClose={() => setShowAddSubscriberModal(false)}
                onSuccess={() => {
                    setShowAddSubscriberModal(false);
                }}
                defaultListId={listId}
                target="mailing_list"
            />

            {/* Import Subscriber Modal */}
            <ImportSubscriberModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                }}
                mailingListIds={[listId]}
            />

            {/* Import History Modal */}
            <ImportHistoryModal
                open={showImportHistoryModal}
                onClose={() => setShowImportHistoryModal(false)}
                targetFilter={["mailing_list"]}
                storageKey="import_interval_mailing_list"
                mailingListIds={[listId]}
            />

            <Dialog
                open={Boolean(subscriberToDelete) || selectedToDelete.length > 0 && Boolean(subscriberToDelete?.id === 'BULK')}
                onClose={() => {
                    if (!deleteSubscriberMutation.isPending && !bulkDeleteSubscriberMutation.isPending) {
                        setSubscriberToDelete(null);
                    }
                }}
            >
                <DialogTitle>Remove Subscriber{selectedToDelete.length > 1 ? 's' : ''}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedToDelete.length > 0 && subscriberToDelete?.id === 'BULK' ? (
                            <>Are you sure you want to remove <strong>{selectedToDelete.length}</strong> selected subscriber(s) from this mailing list?</>
                        ) : (
                            <>Are you sure you want to remove <strong>{subscriberToDelete?.email}</strong> from this mailing list?</>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <AppButton variantStyle="outline" onClick={() => setSubscriberToDelete(null)} disabled={deleteSubscriberMutation.isPending || bulkDeleteSubscriberMutation.isPending}>
                        Cancel
                    </AppButton>
                    <AppButton variantStyle="danger" onClick={handleDeleteSubscriber} disabled={deleteSubscriberMutation.isPending || bulkDeleteSubscriberMutation.isPending}>
                        {deleteSubscriberMutation.isPending || bulkDeleteSubscriberMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Remove'}
                    </AppButton>
                </DialogActions>
            </Dialog>

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

            <Dialog open={confirmAllOpen} onClose={() => setConfirmAllOpen(false)}>
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <Typography variant="h6" color="error">Remove All Subscribers</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>WARNING:</strong> Are you sure you want to remove <strong>all subscribers</strong> from this mailing list? This action will only remove them from this list, it will not delete the contacts themselves.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <AppButton onClick={() => setConfirmAllOpen(false)} color="gray" variantStyle='outline' disabled={deleteAllSubscriberMutation.isPending}>Cancel</AppButton>
                    <AppButton onClick={handleConfirmDeleteAll} color="danger" variantStyle='danger' disabled={deleteAllSubscriberMutation.isPending}>
                        {deleteAllSubscriberMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Delete All'}
                    </AppButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MailingListDetailPage;
