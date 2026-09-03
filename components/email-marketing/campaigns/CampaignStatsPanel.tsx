"use client";

// components/email-marketing/campaigns/CampaignStatsPanel.tsx
//
// The read view of a campaign, lifted out of ViewCampaignStatsModal's Dialog
// so the same content can be a real page at /email-marketing/campaigns/[id].
// Campaign statistics deserve a URL you can paste to a colleague; a Dialog
// has none. The modal is now a thin wrapper around this.

import {
    Alert,
    Box,
    Chip,
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
import { Activity, AlertTriangle, Ban, FlaskConical, Mail, MousePointerClick, Percent, RefreshCcw, ShieldAlert, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

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

export interface CampaignStatsPanelProps {
    /** Seeds the panel so a modal opened from a list row paints instantly. */
    campaign: Campaign | null;
    /** Height of the two-column area. '70vh' in a dialog, 'auto' on a page. */
    height?: string;
    /** Rendered next to the heading - the page puts its actions here. */
    headerActions?: React.ReactNode;
    /** Hide the internal heading when the page already has a PageHeader. */
    showHeading?: boolean;
}

export function CampaignStatsPanel({
    campaign,
    height = '70vh',
    headerActions,
    showHeading = true,
}: CampaignStatsPanelProps) {
    const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(campaign);
    const [tableState, setTableState] = useState({
        pageIndex: 0,
        pageSize: 25,
        globalFilter: "",
    });

    const { data: campaignData, refetch, isRefetching } = useCampaignDetail(campaign?.id || '');

    const { data: subscribersData, isLoading: isLoadingSubscribers, refetch: refetchSubscribers } = useCampaignSubscribers(
        campaign?.id || '',
        tableState.pageIndex + 1,
        tableState.pageSize,
        tableState.globalFilter
    );

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
                    case 'dropped':
                    case 'complained':
                    case 'failed': color = "error"; break;
                    case 'simulated': color = "default"; break;
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
        bounced: 0,
        simulated: 0
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

            {/* Always rendered: it carries the refresh control, which a page
                needs just as much as a dialog even when the heading is off. */}
            {(
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                    {showHeading && (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Campaign Statistics
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {currentCampaign.subject}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                        {headerActions}
                        <Tooltip title="Refresh statistics">
                            <IconButton onClick={handleRefresh} disabled={isRefetching} aria-label="Refresh statistics">
                                <RefreshCcw
                                    size={20}
                                    style={{ animation: isRefetching ? 'spin 1s linear infinite' : 'none' }}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            )}

            <Grid container sx={{ height }}>
                {/* Left Column: Stats */}
                <Grid item xs={12} md={6} sx={{ p: 3, borderRight: '1px solid #E5E7EB', overflowY: 'auto', minHeight: 0 }}>
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

                        {currentCampaign.status.toLowerCase() === 'failed' && currentCampaign.failure_reason && (
                            <Alert severity="error" variant="outlined">
                                {currentCampaign.failure_reason}
                            </Alert>
                        )}

                        {stats.simulated > 0 && (
                            <Alert severity="info" variant="outlined" icon={<FlaskConical size={18} />}>
                                {stats.simulated.toLocaleString()} email{stats.simulated === 1 ? '' : 's'} simulated in this environment&apos;s sandbox mode - no real email was sent, and delivered/opened/clicked stats won&apos;t update for {stats.simulated === 1 ? 'it' : 'them'}.
                            </Alert>
                        )}

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
                            <Grid item xs={12} sm={6}>
                                <StatCard
                                    title="Bounce Rate"
                                    value={`${(stats.bounce_rate * 100).toFixed(1)}%`}
                                    icon={Percent}
                                    // Industry reference points, not this
                                    // campaign's own history - see the
                                    // deliverability monitoring plan.
                                    color={stats.bounce_rate > 0.05 ? '#ef4444' : '#0ea5e9'}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <StatCard
                                    title="Complaint Rate"
                                    value={`${(stats.complaint_rate * 100).toFixed(2)}%`}
                                    icon={ShieldAlert}
                                    color={stats.complaint_rate > 0.001 ? '#ef4444' : '#0ea5e9'}
                                />
                            </Grid>
                            {stats.dropped > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <StatCard
                                        title="Dropped"
                                        value={stats.dropped.toLocaleString()}
                                        icon={Ban}
                                        color="#f97316"
                                    />
                                </Grid>
                            )}
                            {stats.complained > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <StatCard
                                        title="Marked as Spam"
                                        value={stats.complained.toLocaleString()}
                                        icon={AlertTriangle}
                                        color="#ef4444"
                                    />
                                </Grid>
                            )}
                            {stats.simulated > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <StatCard
                                        title="Simulated (sandbox)"
                                        value={stats.simulated.toLocaleString()}
                                        icon={FlaskConical}
                                        color="#6b7280"
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Stack>
                </Grid>

                {/* Right Column: Preview */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        bgcolor: '#F9FAFB',
                        display: 'flex',
                        flexDirection: 'column',
                        // Stretching to the Status column beside it is what makes
                        // the two panels line up; minHeight only matters when a
                        // campaign has so little to report that the left column is
                        // shorter than a readable preview.
                        minHeight: 320,
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB', bgcolor: 'white', flexShrink: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Message Preview
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, p: 2, display: 'flex' }}>
                        {currentCampaign.html_content ? (
                            <iframe
                                srcDoc={currentCampaign.html_content}
                                // A bare srcDoc inherits this page's origin, so a
                                // <script> in a pasted template would run here with
                                // access to a non-httpOnly access_token. Nothing needs
                                // to reach into a read-only preview, so it gets the
                                // strongest sandbox there is: opaque origin, no
                                // scripts. Images and CSS still load.
                                sandbox=""
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    minHeight: 0,
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff'
                                }}
                                title="Campaign Preview"
                            />
                        ) : (
                            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', border: '1px dashed #D1D5DB', borderRadius: 2 }}>
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
                        entityLabel="penerima"
                        searchPlaceholder="Cari email penerima"
                        tableId="campaign-subscribers-table"
                        data={subscribersData?.data?.contacts || []}
                        columns={columns}
                        rowCount={subscribersData?.data?.total || 0}
                        isLoading={isLoadingSubscribers}
                        onRetry={() => refetchSubscribers()}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={Users}
                                title="No subscribers"
                                description="No subscribers match this campaign yet."
                            />
                        )}
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
        </>
    );
}

export default CampaignStatsPanel;
