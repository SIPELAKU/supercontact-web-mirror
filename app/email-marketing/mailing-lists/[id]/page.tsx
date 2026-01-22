// app/email-marketing/mailing-lists/[id]/page.tsx
"use client";

import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import PageHeader from '@/components/ui/page-header';
import { useDeleteMailingListSubscriber, useMailingListDetail } from '@/lib/hooks/useMailingLists';
import { Campaign, Subscriber } from '@/lib/types/email-marketing';
import {
    Box,
    Button,
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
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

    // Modals
    const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

    const mailingList = mailingListData?.data;
    const subscribers = mailingList?.subscribers?.contacts || [];
    const campaigns: Campaign[] = []; // Campaigns will be implemented later

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
            
            toast.success('Subscriber removed from list successfully');
            setSubscriberToDelete(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove subscriber');
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
                <Button onClick={() => router.push('/email-marketing/mailing-lists')} sx={{ mt: 2 }}>
                    Back to Mailing Lists
                </Button>
            </Box>
        );
    }

    const paginatedSubscribers = filteredSubscribers.slice(
        subscriberPage * subscriberRowsPerPage,
        subscriberPage * subscriberRowsPerPage + subscriberRowsPerPage
    );

    const paginatedCampaigns = filteredCampaigns.slice(
        campaignPage * campaignRowsPerPage,
        campaignPage * campaignRowsPerPage + campaignRowsPerPage
    );

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
                <Button
                    variant="outlined"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => router.push('/email-marketing/mailing-lists')}
                    sx={{ textTransform: 'none' }}
                >
                    Kembali ke Mailing List
                </Button>
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
            <Box>
                {/* Toolbar */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Filter size={18} />}
                            sx={{ 
                                textTransform: 'none',
                                borderColor: 'transparent',
                                color: '#5D87FF',
                                bgcolor: '#ECF2FF',
                                height: '42px',
                                borderRadius: '8px',
                                px: 2.5,
                                fontWeight: 500,
                                '&:hover': {
                                    borderColor: 'transparent',
                                    bgcolor: '#d5e5ff'
                                }
                            }}
                        >
                            Filters
                        </Button>
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
                        <Button
                            variant="contained"
                            startIcon={<UserPlus size={18} />}
                            onClick={() => setShowAddSubscriberModal(true)}
                            sx={{ 
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                height: '42px',
                                borderRadius: '8px',
                                px: 3,
                                bgcolor: '#5D87FF',
                                fontWeight: 600,
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#4570ea',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            Tambah Subscriber
                        </Button>
                    )}
                </Box>

                {/* Subscribers Tab */}
                {activeTab === 0 && (
                    <>
                        <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Nama</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Nama Perusahaan</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Aksi</TableCell>
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
                                            <TableRow key={subscriber.id} hover>
                                                <TableCell>{subscriber.email}</TableCell>
                                                <TableCell>{subscriber.name || '-'}</TableCell>
                                                <TableCell>{subscriber.company || '-'}</TableCell>
                                                <TableCell align="center">
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
                        </TableContainer>
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
                    </>
                )}

                {/* Campaigns Tab */}
                {activeTab === 1 && (
                    <>
                        <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Sent Date</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Delivered</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Opened</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Open Rate</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedCampaigns.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchQuery ? 'No campaigns found matching your search.' : 'No sent campaigns yet.'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCampaigns.map((campaign) => {
                                            const openRate = campaign.delivered > 0 
                                                ? ((campaign.opened / campaign.delivered) * 100).toFixed(1)
                                                : '0';
                                            return (
                                                <TableRow key={campaign.id} hover>
                                                    <TableCell>{campaign.subject}</TableCell>
                                                    <TableCell>
                                                        {campaign.sent_date 
                                                            ? format(new Date(campaign.sent_date), 'dd MMM yyyy, HH:mm')
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell>{campaign.delivered}</TableCell>
                                                    <TableCell>{campaign.opened}</TableCell>
                                                    <TableCell>{openRate}%</TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="View Statistics">
                                                            <IconButton 
                                                                size="small"
                                                                onClick={() => toast('View statistics feature coming soon!')}
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
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={filteredCampaigns.length}
                            rowsPerPage={campaignRowsPerPage}
                            page={campaignPage}
                            onPageChange={(_e, newPage) => setCampaignPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setCampaignRowsPerPage(parseInt(e.target.value, 10));
                                setCampaignPage(0);
                            }}
                        />
                    </>
                )}
            </Box>

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
                    <Button onClick={() => setSubscriberToDelete(null)} disabled={deleteSubscriberMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteSubscriber} color="error" variant="contained" disabled={deleteSubscriberMutation.isPending}>
                        {deleteSubscriberMutation.isPending ? <CircularProgress size={20} /> : 'Remove'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MailingListDetailPage;
