// app/email-marketing/mailing-lists/[id]/page.tsx
"use client";

import AddSubscriberModal from '@/components/email-marketing/subscribers/modals/AddSubscriberModal';
import { Campaign, MailingList, Subscriber } from '@/lib/types/email-marketing';
import {
    Box,
    Breadcrumbs,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Link as MuiLink,
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
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const MailingListDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const listId = Number(params.id);

    const [mailingList, setMailingList] = useState<MailingList | null>(null);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Pagination for subscribers
    const [subscriberPage, setSubscriberPage] = useState(0);
    const [subscriberRowsPerPage, setSubscriberRowsPerPage] = useState(10);
    
    // Pagination for campaigns
    const [campaignPage, setCampaignPage] = useState(0);
    const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(10);

    // Modals
    const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // MOCK DATA - Remove this when backend is ready
                const { mockMailingLists, mockSubscribers, mockCampaigns, simulateApiDelay } = 
                    await import('@/lib/data/email-marketing-mock');
                await simulateApiDelay(300);

                // Find the mailing list
                const list = mockMailingLists.find(l => l.id === listId);
                if (!list) {
                    toast.error('Mailing list not found');
                    router.push('/email-marketing/mailing-lists');
                    return;
                }
                setMailingList(list);

                // Filter subscribers that belong to this list
                const listSubscribers = mockSubscribers.filter(s => 
                    s.list_ids && s.list_ids.includes(listId)
                );
                setSubscribers(listSubscribers);

                // Filter sent campaigns (for demo, showing all sent campaigns)
                const sentCampaigns = mockCampaigns.filter(c => c.state === 'done');
                setCampaigns(sentCampaigns);

            } catch (err: any) {
                toast.error('Failed to fetch mailing list details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [listId, router, refreshTrigger]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
    };

    const handleDeleteSubscriber = async () => {
        if (!subscriberToDelete) return;
        
        setIsDeleting(true);
        try {
            // TODO: Replace with real API call when backend is ready
            // await axiosClient.delete(`/subscribers/${subscriberToDelete.id}`);
            
            // MOCK - Simulate success
            const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
            await simulateApiDelay(300);
            
            toast.success('Subscriber removed from list successfully');
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            toast.error('Failed to remove subscriber');
        } finally {
            setIsDeleting(false);
            setSubscriberToDelete(null);
        }
    };

    // Filter subscribers based on search
    const filteredSubscribers = subscribers.filter(s => 
        searchQuery === '' || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter campaigns based on search
    const filteredCampaigns = campaigns.filter(c => 
        searchQuery === '' || 
        c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            {/* Header with Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <MuiLink component={Link} href="/email-marketing/mailing-lists" underline="hover" color="inherit">
                        Email Marketing
                    </MuiLink>
                    <MuiLink component={Link} href="/email-marketing/mailing-lists" underline="hover" color="inherit">
                        Mailing List
                    </MuiLink>
                    <Typography color="text.primary">{mailingList.name}</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => router.push('/email-marketing/mailing-lists')}
                    >
                        Kembali ke Mailing List
                    </Button>
                </Box>
            </Box>

            {/* Title and Contact Count */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {mailingList.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {mailingList.contact_count} Kontak
                </Typography>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Subscribers
                                <Chip label={filteredSubscribers.length} size="small" />
                            </Box>
                        } 
                    />
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Campaign Terkirim
                                <Chip label={filteredCampaigns.length} size="small" />
                            </Box>
                        } 
                    />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box>
                {/* Toolbar */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Filter className="w-4 h-4" />}
                        >
                            Filters
                        </Button>
                        <TextField
                            size="small"
                            placeholder={activeTab === 0 ? "Search..." : "Search campaigns..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
                            }}
                            sx={{ minWidth: '300px' }}
                        />
                    </Box>
                    {activeTab === 0 && (
                        <Button
                            variant="contained"
                            startIcon={<UserPlus className="w-4 h-4" />}
                            onClick={() => setShowAddSubscriberModal(true)}
                        >
                            Tambah Subscriber
                        </Button>
                    )}
                </Box>

                {/* Subscribers Tab */}
                {activeTab === 0 && (
                    <>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Nama</TableCell>
                                        <TableCell>Nama Perusahaan</TableCell>
                                        <TableCell align="center">Aksi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedSubscribers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                {searchQuery ? 'No subscribers found matching your search.' : 'No subscribers in this list yet.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedSubscribers.map((subscriber) => (
                                            <TableRow key={subscriber.id} hover>
                                                <TableCell>{subscriber.email}</TableCell>
                                                <TableCell>{subscriber.name || '-'}</TableCell>
                                                <TableCell>{subscriber.company_name || '-'}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Delete">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => setSubscriberToDelete(subscriber)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Sent Date</TableCell>
                                        <TableCell>Delivered</TableCell>
                                        <TableCell>Opened</TableCell>
                                        <TableCell>Open Rate</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedCampaigns.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                {searchQuery ? 'No campaigns found matching your search.' : 'No sent campaigns yet.'}
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
                                                                <Eye className="w-4 h-4" />
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
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                defaultListId={listId}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(subscriberToDelete)}
                onClose={() => !isDeleting && setSubscriberToDelete(null)}
            >
                <DialogTitle>Remove Subscriber</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove <strong>{subscriberToDelete?.email}</strong> from this mailing list?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubscriberToDelete(null)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteSubscriber} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={20} /> : 'Remove'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MailingListDetailPage;
