"use client";

import { AppButton } from '@/components/ui/app-button';
import {
    Box,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { useMemo, useEffect, useState } from 'react';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';
import { useCampaignDetail, useCampaignSubscribers } from '@/lib/hooks/useCampaigns';
import { Campaign, CampaignSubscriber } from '@/lib/types/email-marketing';
import { format } from 'date-fns';
import { Activity, Mail, MousePointerClick, RefreshCcw } from 'lucide-react';

interface ViewCampaignStatsModalProps {
    open: boolean;
    onClose: () => void;
    campaign: Campaign | null;
}

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number | string, icon: any, color: string }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
        }}
    >
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}15`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Icon size={24} />
        </Box>
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
                {value}
            </Typography>
        </Box>
    </Paper>
);

const ViewCampaignStatsModal = ({ open, onClose, campaign }: ViewCampaignStatsModalProps) => {
    const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(campaign);
    const [tableState, setTableState] = useState({
        pageIndex: 0,
        pageSize: 10,
        globalFilter: "",
    });

    // Fetch campaign detail with refetch capability
    const { data: campaignData, refetch, isRefetching } = useCampaignDetail(campaign?.id || '');

    // Fetch campaign subscribers (Broadcast Status)
    const { data: subscribersData, isLoading: isLoadingSubscribers, refetch: refetchSubscribers } = useCampaignSubscribers(
        campaign?.id || '',
        tableState.pageIndex + 1,
        tableState.pageSize,
        tableState.globalFilter
    );

    // Update current campaign when data changes
    useEffect(() => {
        if (campaignData?.data) {
            setCurrentCampaign(campaignData.data);
        } else if (campaign) {
            setCurrentCampaign(campaign);
        }
    }, [campaignData, campaign]);

    const columns = useMemo<MRT_ColumnDef<CampaignSubscriber>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Name',
            Cell: ({ cell }) => cell.getValue<string>() || '-',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            Cell: ({ cell }) => {
                const val = cell.getValue<string>()?.toLowerCase();
                let color: "primary" | "info" | "success" | "error" | "default" | "warning" = "default";

                switch (val) {
                    case 'pending': color = "warning"; break;
                    case 'sent': color = "primary"; break;
                    case 'delivered': color = "info"; break;
                    case 'opened':
                    case 'clicked': color = "success"; break;
                    case 'bounced':
                    case 'failed': color = "error"; break;
                    default: color = "default";
                }

                return <Chip label={val || 'unknown'} color={color as any} size="small" variant="outlined" />;
            },
        },
        {
            accessorKey: 'error_message',
            header: 'Error Message',
            Cell: ({ row, cell }) => {
                const val = cell.getValue<string>();
                const status = row.original.status?.toLowerCase();
                if ((status === 'failed' || status === 'bounced') && val) {
                    return <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>{val}</Typography>;
                }
                return val || '-';
            }
        },
    ], []);

    if (!currentCampaign) return null;

    const stats = currentCampaign.stats || {
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0
    };

    const handleRefresh = () => {
        refetch();
        refetchSubscribers();
    };

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Campaign Statistics
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {currentCampaign.subject}
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh statistics">
                        <IconButton
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            sx={{
                                ml: 2,
                                '&:hover': { bgcolor: '#F3F4F6' }
                            }}
                        >
                            <RefreshCcw
                                size={20}
                                style={{
                                    animation: isRefetching ? 'spin 1s linear infinite' : 'none'
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    <Grid container sx={{ height: '70vh' }}>
                        {/* Left Column: Stats */}
                        <Grid item xs={12} md={6} sx={{ p: 3, borderRight: '1px solid #E5E7EB', overflowY: 'auto', height: '100%' }}>
                            <Stack spacing={3}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        bgcolor: '#F3F4F6',
                                        borderRadius: 2
                                    }}
                                >
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Status
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                            {currentCampaign.status.replace('_', ' ')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Sent Date
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {currentCampaign.sent_at ? format(new Date(currentCampaign.sent_at), 'dd MMM yyyy, HH:mm') : 'Not sent yet'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Total Target
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {currentCampaign.total_target.toLocaleString()} recipients
                                        </Typography>
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Delivered"
                                            value={stats.delivered.toLocaleString()}
                                            icon={Mail}
                                            color="#0ea5e9"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Opened"
                                            value={stats.opened.toLocaleString()}
                                            icon={Activity}
                                            color="#10b981"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Clicked"
                                            value={stats.clicked.toLocaleString()}
                                            icon={MousePointerClick}
                                            color="#8b5cf6"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Bounced"
                                            value={stats.bounced.toLocaleString()}
                                            icon={RefreshCcw}
                                            color="#ef4444"
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Grid>

                        {/* Right Column: Preview */}
                        <Grid item xs={12} md={6} sx={{ height: '100%', bgcolor: '#F9FAFB' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB', bgcolor: 'white' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Message Preview
                                </Typography>
                            </Box>
                            <Box sx={{ height: 'calc(100% - 49px)', p: 2 }}>
                                {currentCampaign.html_content ? (
                                    <iframe
                                        srcDoc={currentCampaign.html_content}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            backgroundColor: '#fff'
                                        }}
                                        title="Campaign Preview"
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', border: '1px dashed #D1D5DB', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No preview available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Bottom Section: Subscribers Status Table */}
                    <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #E5E7EB' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Subscribers Status
                        </Typography>
                        <Box className="super-table-container-mini">
                            <SuperTable<CampaignSubscriber>
                                tableId="campaign-subscribers-table"
                                data={subscribersData?.data?.contacts || []}
                                columns={columns}
                                rowCount={subscribersData?.data?.total || 0}
                                isLoading={isLoadingSubscribers}
                                manualPagination={true}
                                onStateChange={(state) => {
                                    setTableState({
                                        pageIndex: state.pagination.pageIndex,
                                        pageSize: state.pagination.pageSize,
                                        globalFilter: state.globalFilter || "",
                                    });
                                }}
                                features={{
                                    pagination: true,
                                    globalFilter: true,
                                    densityToggle: false,
                                    columnVisibility: false,
                                    fullScreenToggle: false,
                                }}
                                initialState={{
                                    pagination: { pageIndex: 0, pageSize: 10 }
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <AppButton onClick={onClose} variantStyle="outline">
                        Close
                    </AppButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ViewCampaignStatsModal;
