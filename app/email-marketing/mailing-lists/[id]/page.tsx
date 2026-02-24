// app/email-marketing/mailing-lists/[id]/page.tsx
"use client";

import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import { AppButton } from '@/components/ui/app-button';
import PageHeader from '@/components/ui/page-header';
import { useDeleteMailingListSubscriber, useMailingListDetail, useMailingListCampaigns } from '@/lib/hooks/useMailingLists';
import { Campaign, Subscriber } from '@/lib/types/email-marketing';
import ViewCampaignStatsModal from '@/components/email-marketing/campaigns/modals/ViewCampaignStatsModal';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import { ArrowLeft, Eye, Filter, Search, Trash2, UserPlus } from 'lucide-react';
import { notify } from '@/lib/notifications';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const MailingListDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const listId = String(params.id);

    const { data: mailingListData, isLoading, error } = useMailingListDetail(listId);
    const deleteSubscriberMutation = useDeleteMailingListSubscriber();

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination for subscribers
    const [subscriberPage, setSubscriberPage] = useState(0);
    const [subscriberRowsPerPage, setSubscriberRowsPerPage] = useState(10);

    // Pagination for campaigns
    const [campaignPage, setCampaignPage] = useState(0);
    const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(10);

    const { data: campaignsData, isLoading: isLoadingCampaigns, isFetching: isFetchingCampaigns } = useMailingListCampaigns(listId, campaignPage + 1, campaignRowsPerPage, activeTab === 1);

    // Modals
    const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

    const mailingList = mailingListData?.data;
    const subscribers = mailingList?.subscribers?.contacts || [];
    const campaigns: Campaign[] = campaignsData?.data?.campaigns || [];
    const totalCampaigns = campaignsData?.data?.total || 0;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
    };

    const handleDeleteSubscriber = async () => {
        if (!subscriberToDelete) return;

        try {
            await deleteSubscriberMutation.mutateAsync({
                mailingListId: listId,
                subscriberId: subscriberToDelete.id
            });

            notify.success('Subscriber removed from list successfully');
            setSubscriberToDelete(null);
        } catch (err: any) {
            notify.error(err.message || 'Failed to remove subscriber');
        }
    };

    // Filter subscribers based on search
    const filteredSubscribers = subscribers.filter(s =>
        searchQuery === '' ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter campaigns based on search
    const filteredCampaigns = campaigns.filter(c =>
        searchQuery === '' ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load mailing list details</Typography>
                <AppButton onClick={() => router.push('/email-marketing/mailing-lists')} sx={{ mt: 2 }}>
                    Back to Mailing Lists
                </AppButton>
            </Box>
        );
    }

    const paginatedSubscribers = filteredSubscribers.slice(
        subscriberPage * subscriberRowsPerPage,
        subscriberPage * subscriberRowsPerPage + subscriberRowsPerPage
    );

    // Campaigns are paginated on server
    const paginatedCampaigns = filteredCampaigns;

    if (isLoading) {
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
                    Kembali ke Mailing List
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
                    <Tab label="Campaign Terkirim" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                {/* Toolbar */}
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                        <AppButton
                            variantStyle="soft"
                            startIcon={<Filter size={18} />}
                            sx={{
                                height: '42px',
                                px: 2.5
                            }}
                        >
                            Filters
                        </AppButton>
                        <TextField
                            size="small"
                            placeholder={activeTab === 0 ? "Search..." : "Search campaigns..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#9ca3af' }} />
                            }}
                            sx={{
                                flex: 1,
                                maxWidth: '400px',
                                '& .MuiOutlinedInput-root': {
                                    height: '42px',
                                    borderRadius: '8px',
                                    bgcolor: 'white',
                                    '& fieldset': {
                                        borderColor: '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d1d5db',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#5D87FF',
                                        borderWidth: '1px',
                                    }
                                }
                            }}
                        />
                    </Box>
                    {activeTab === 0 && (
                        <AppButton
                            variantStyle="primary"
                            startIcon={<UserPlus size={18} />}
                            onClick={() => setShowAddSubscriberModal(true)}
                            sx={{
                                height: '42px',
                                px: 3,
                            }}
                        >
                            Tambah Subscriber
                        </AppButton>
                    )}
                </Box>

                {/* Subscribers Tab */}
                {activeTab === 0 && (
                    <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
                            <Table>
                                <TableHead>
                                    <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pl: 3 }}>Email</TableCell>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Nama</TableCell>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Nama Perusahaan</TableCell>
                                        <TableCell align="center" sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3 }}>Aksi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedSubscribers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchQuery ? 'No subscribers found matching your search.' : 'No subscribers in this list yet.'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedSubscribers.map((subscriber) => (
                                            <TableRow
                                                key={subscriber.id}
                                                hover
                                                sx={{
                                                    '&:hover': { bgcolor: '#f9fafb' },
                                                    '& td': { borderBottom: '1px solid #f3f4f6' }
                                                }}
                                            >
                                                <TableCell sx={{ py: 2, pl: 3 }}>{subscriber.email}</TableCell>
                                                <TableCell sx={{ py: 2 }}>{subscriber.name || '-'}</TableCell>
                                                <TableCell sx={{ py: 2 }}>{subscriber.company || '-'}</TableCell>
                                                <TableCell align="center" sx={{ py: 2, pr: 3 }}>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => setSubscriberToDelete(subscriber)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={filteredSubscribers.length}
                                rowsPerPage={subscriberRowsPerPage}
                                page={subscriberPage}
                                onPageChange={(_e, newPage) => setSubscriberPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setSubscriberRowsPerPage(parseInt(e.target.value, 10));
                                    setSubscriberPage(0);
                                }}
                            />
                        </div>
                    </>
                )}

                {/* Campaigns Tab */}
                {activeTab === 1 && (
                    <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
                            <Table>
                                <TableHead>
                                    <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pl: 3 }}>Subject</TableCell>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Sent Date</TableCell>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Delivered</TableCell>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Opened</TableCell>
                                        <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Open Rate</TableCell>
                                        <TableCell align="center" sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoadingCampaigns || isFetchingCampaigns ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <CircularProgress size={30} />
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedCampaigns.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchQuery ? 'No campaigns found matching your search.' : 'No sent campaigns yet.'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCampaigns.map((campaign) => {
                                            const openRate = campaign.stats.delivered > 0
                                                ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)
                                                : '0';
                                            return (
                                                <TableRow
                                                    key={campaign.id}
                                                    hover
                                                    sx={{
                                                        '&:hover': { bgcolor: '#f9fafb' },
                                                        '& td': { borderBottom: '1px solid #f3f4f6' }
                                                    }}
                                                >
                                                    <TableCell sx={{ py: 2, pl: 3 }}>{campaign.subject}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        {campaign.sent_at
                                                            ? format(new Date(campaign.sent_at), 'dd MMM yyyy, HH:mm')
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>{campaign.stats.delivered}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{campaign.stats.opened}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{openRate}%</TableCell>
                                                    <TableCell align="center" sx={{ py: 2, pr: 3 }}>
                                                        <Tooltip title="View Statistics">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedCampaign(campaign);
                                                                    setViewModalOpen(true);
                                                                }}
                                                            >
                                                                <Eye size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalCampaigns}
                                rowsPerPage={campaignRowsPerPage}
                                page={campaignPage}
                                onPageChange={(_e, newPage) => setCampaignPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setCampaignRowsPerPage(parseInt(e.target.value, 10));
                                    setCampaignPage(0);
                                }}
                            />
                        </div>
                    </>
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(subscriberToDelete)}
                onClose={() => !deleteSubscriberMutation.isPending && setSubscriberToDelete(null)}
            >
                <DialogTitle>Remove Subscriber</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove <strong>{subscriberToDelete?.email}</strong> from this mailing list?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <AppButton variantStyle="outline" onClick={() => setSubscriberToDelete(null)} disabled={deleteSubscriberMutation.isPending}>
                        Cancel
                    </AppButton>
                    <AppButton variantStyle="danger" onClick={handleDeleteSubscriber} disabled={deleteSubscriberMutation.isPending}>
                        {deleteSubscriberMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Remove'}
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
        </Box>
    );
};

export default MailingListDetailPage;
