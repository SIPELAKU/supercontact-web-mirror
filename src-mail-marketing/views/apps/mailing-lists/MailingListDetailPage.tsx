// src/views/apps/mailing-lists/MailingListDetailPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Tabs, Tab, Button, Stack, Chip
} from '@mui/material';
import { IconArrowBackUp, IconUsers, IconMailForward } from '@tabler/icons-react';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import DashboardCard from 'src/components/shared/DashboardCard';
import { MailingList } from 'src/types/apps/campaigns';
import ListSubscribersTable from 'src/components/apps/mailing-lists/detail/ListSubscribersTable';
import ListCampaignsTable from 'src/components/apps/mailing-lists/detail/ListCampaignsTable';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`list-detail-tabpanel-${index}`}
            aria-labelledby={`list-detail-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MailingListDetailPage = () => {
    const { listId } = useParams<{ listId: string }>();
    const navigate = useNavigate();
    const [listDetails, setListDetails] = useState<MailingList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshingTables, setIsRefreshingTables] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const fetchListDetails = useCallback(async (showMainLoader = true) => {
        if (showMainLoader) setIsLoading(true);
        setError(null);
        try {
            if (!listId) throw new Error("ID List tidak valid");
            const response = await axios.get(`/marketing/mailing-lists/${listId}`);
            setListDetails(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Gagal memuat detail mailing list.';
            setError(errorMessage);
            if (showMainLoader) toast.error(errorMessage);
            if (err.response?.status === 404 && showMainLoader) {
                navigate('/app/email-marketing/mailing-lists');
            }
        } finally {
            if (showMainLoader) setIsLoading(false);
        }
    }, [listId, navigate]);

    useEffect(() => {
        fetchListDetails(true);
    }, [fetchListDetails]);

    const forceRefreshParent = useCallback(async () => {
        setIsRefreshingTables(true);
        await fetchListDetails(false);
        setRefreshTrigger(t => t + 1);
        setIsRefreshingTables(false);
    }, [fetchListDetails]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const BCrumb = [
        { to: '/dashboards/modern', title: 'Dashboard' },
        { to: '/app/email-marketing/mailing-lists', title: 'Mailing Lists' },
        { title: listDetails?.name || (isLoading ? 'Memuat...' : 'Error') },
    ];

    return (
        <PageContainer title={`Mailing List: ${listDetails?.name || ''}`} description="Detail mailing list">
            <Breadcrumb title={listDetails?.name || (isLoading ? 'Memuat Detail...' : 'Detail Mailing List')} items={BCrumb} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Button
                    variant="outlined"
                    startIcon={<IconArrowBackUp size="1.1rem" />}
                    component={RouterLink}
                    to="/app/email-marketing/mailing-lists"
                >
                    Kembali ke Daftar
                </Button>
            </Stack>

            <DashboardCard>
                {isLoading && !listDetails && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && !isLoading && !listDetails && (
                    <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
                )}

                {listDetails && (
                    <Box sx={{ width: '100%', position: 'relative' }}>
                        {isRefreshingTables && (
                            <Box sx={{
                                position: 'absolute',
                                top: 60,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                            }}>
                                <CircularProgress />
                            </Box>
                        )}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
                            <Typography variant="h4">{listDetails.name}</Typography>
                            <Chip label={`${isRefreshingTables ? '...' : (listDetails.contact_count ?? '?')} Kontak`} size="small" />
                        </Stack>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={currentTab} onChange={handleTabChange} aria-label="detail mailing list tabs">
                                <Tab label="Subscribers" icon={<IconUsers />} iconPosition="start" id="list-detail-tab-0" aria-controls="list-detail-tabpanel-0" />
                                <Tab label="Campaigns Terkirim" icon={<IconMailForward />} iconPosition="start" id="list-detail-tab-1" aria-controls="list-detail-tabpanel-1" />
                            </Tabs>
                        </Box>

                        <TabPanel value={currentTab} index={0}>
                            <ListSubscribersTable listId={Number(listId)} refreshTrigger={refreshTrigger} forceRefreshParent={forceRefreshParent} />
                        </TabPanel>
                        <TabPanel value={currentTab} index={1}>
                            <ListCampaignsTable listId={Number(listId)} refreshTrigger={refreshTrigger} />
                        </TabPanel>
                    </Box>
                )}
            </DashboardCard>
        </PageContainer>
    );
};

export default MailingListDetailPage;