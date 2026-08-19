// app/whatsapp-marketing/group-broadcasting/[id]/page.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import PageHeader from '@/components/ui/page-header';
import { useGroupBroadcastDetail, useGroupBroadcastCampaigns } from '@/lib/hooks/useGroupBroadcasts';
import {
    Box,
    Chip,
    CircularProgress,
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
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import { ArrowLeft, Search, Upload, Plus, Eye } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AddRecipientModal from '@/components/whatsapp-marketing/recipients/AddRecipientModal';
import ImportWaRecipientModal from '@/components/whatsapp-marketing/recipients/ImportWaRecipientModal';
import ViewBroadcastCampaignStatsModal from '@/components/whatsapp-marketing/group-broadcasting/modals/ViewBroadcastCampaignStatsModal';
import { useQueryClient } from '@tanstack/react-query';
import { BroadcastCampaign } from '@/lib/types/whatsapp-marketing';

const GroupBroadcastDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const broadcastGroupId = String(params.id);

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const queryClient = useQueryClient();
    const [isAddRecipientModalOpen, setAddRecipientModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<BroadcastCampaign | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Pagination for recipients
    const [recipientPage, setRecipientPage] = useState(0);
    const [recipientRowsPerPage, setRecipientRowsPerPage] = useState(10);

    // Pagination for campaigns
    const [campaignPage, setCampaignPage] = useState(0);
    const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(10);

    const { data: detailData, isLoading: isLoadingDetail, error: detailError } = useGroupBroadcastDetail(
        broadcastGroupId,
        recipientPage + 1,
        recipientRowsPerPage
    );

    const { data: campaignsData, isLoading: isLoadingCampaigns } = useGroupBroadcastCampaigns(
        broadcastGroupId,
        campaignPage + 1,
        campaignRowsPerPage,
        debouncedSearch,
        activeTab === 1
    );

    const groupBroadcast = detailData?.data;
    const recipients = groupBroadcast?.recipients?.recipients || [];
    const totalRecipients = groupBroadcast?.recipients?.total || 0;

    // INTERIM: the /broadcast-groups/{id} recipients endpoint does not support a
    // `search` param yet, so the Recipients-tab search filters client-side over
    // the currently loaded page only. Switch to a server `search` param once the
    // backend supports it.
    const recipientSearch = debouncedSearch.trim().toLowerCase();
    const visibleRecipients = activeTab === 0 && recipientSearch
        ? recipients.filter((r) =>
            [r.name, r.email, r.phone_number, r.company]
                .some((v) => (v || '').toLowerCase().includes(recipientSearch))
        )
        : recipients;

    const campaigns = campaignsData?.data?.broadcasts || [];
    const totalCampaigns = campaignsData?.data?.total || 0;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['group-broadcast-detail', broadcastGroupId] });
    };

    if (detailError) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load group broadcast details</Typography>
                <AppButton onClick={() => router.push('/whatsapp-marketing/group-broadcasting')} sx={{ mt: 2 }} variantStyle="primary">
                    Back to Group Broadcasting
                </AppButton>
            </Box>
        );
    }

    if (isLoadingDetail && !groupBroadcast) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!groupBroadcast) return null;

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title={groupBroadcast.name}
                breadcrumbs={[
                    { label: "WhatsApp Marketing" },
                    { label: "Group Broadcasting", href: "/whatsapp-marketing/group-broadcasting" },
                    { label: groupBroadcast.name }
                ]}
            />

            <Box sx={{ mb: 3 }}>
                <AppButton
                    variantStyle="outline"
                    color="primary"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => router.push('/whatsapp-marketing/group-broadcasting')}
                    sx={{ textTransform: 'none' }}
                >
                    Kembali ke Group Broadcasting
                </AppButton>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {groupBroadcast.name}
                </Typography>
                <Chip
                    label={`${groupBroadcast.recipient_count} Recipients`}
                    color="primary"
                    size="medium"
                />
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Recipients" />
                    <Tab label="Broadcast (campaign) sent" />
                </Tabs>
            </Box>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
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
                                    '& fieldset': { borderColor: '#e5e7eb' },
                                    '&:hover fieldset': { borderColor: '#d1d5db' },
                                    '&.Mui-focused fieldset': { borderColor: '#5D87FF', borderWidth: '1px' }
                                }
                            }}
                        />
                    </Box>

                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AppButton
                                variantStyle="outline"
                                onClick={() => setImportModalOpen(true)}
                                startIcon={<Upload size={16} />}
                                color="primary"
                            >
                                Import
                            </AppButton>
                            <AppButton
                                variantStyle="primary"
                                onClick={() => setAddRecipientModalOpen(true)}
                                startIcon={<Plus size={16} />}
                            >
                                Add Recipient
                            </AppButton>
                        </Box>
                    )}
                </Box>

                {/* Recipients Tab */}
                {activeTab === 0 && (
                    <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableHead>
                                        <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Name</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Email</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Phone Number</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Company</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoadingDetail ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                                    <CircularProgress size={30} />
                                                </TableCell>
                                            </TableRow>
                                        ) : visibleRecipients.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No recipients found.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            visibleRecipients.map((recipient) => (
                                                <TableRow key={recipient.id} hover>
                                                    <TableCell sx={{ py: 2 }}>{recipient.name || '-'}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{recipient.email || '-'}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{recipient.phone_number || '-'}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{recipient.company || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalRecipients}
                                rowsPerPage={recipientRowsPerPage}
                                page={recipientPage}
                                onPageChange={(_e, newPage) => setRecipientPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRecipientRowsPerPage(parseInt(e.target.value, 10));
                                    setRecipientPage(0);
                                }}
                            />
                        </div>
                    </>
                )}

                {/* Campaigns Tab */}
                {activeTab === 1 && (
                    <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableHead>
                                        <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pl: 3 }}>Campaign Name</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Sent Date</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Sent</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Delivered</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Read</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Failed</TableCell>
                                            <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoadingCampaigns ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                    <CircularProgress size={30} />
                                                </TableCell>
                                            </TableRow>
                                        ) : campaigns.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No campaigns found.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            campaigns.map((campaign) => (
                                                <TableRow key={campaign.id} hover>
                                                    <TableCell sx={{ py: 2, pl: 3 }}>{campaign.name}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        {campaign.sent_at ? format(new Date(campaign.sent_at), 'dd MMM yyyy, HH:mm') : '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 2 }}>{campaign.stats.sent}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{campaign.stats.delivered}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{campaign.stats.read}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>{campaign.stats.failed}</TableCell>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedCampaign(campaign);
                                                                setViewModalOpen(true);
                                                            }}
                                                        >
                                                            <Eye size={16} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
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

            <AddRecipientModal
                open={isAddRecipientModalOpen}
                recipientType="whatsapp"
                onClose={() => setAddRecipientModalOpen(false)}
                onSuccess={handleSuccess}
                target="broadcast_group"
                broadcastGroupId={broadcastGroupId}
            />

            <ImportWaRecipientModal
                open={isImportModalOpen}
                recipientType="whatsapp"
                onClose={() => setImportModalOpen(false)}
                onSuccess={handleSuccess}
                target="broadcast_group"
                broadcastGroupId={broadcastGroupId}
            />

            <ViewBroadcastCampaignStatsModal
                open={isViewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedCampaign(null);
                }}
                campaign={selectedCampaign}
                onRefresh={() => {
                    queryClient.invalidateQueries({ queryKey: ['group-broadcast-campaigns', broadcastGroupId] });
                }}
            />
        </Box>
    );
};

export default GroupBroadcastDetailPage;
