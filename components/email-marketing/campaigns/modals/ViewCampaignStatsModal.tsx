"use client";

import { AppButton } from '@/components/ui/app-button';
import { Campaign } from '@/lib/types/email-marketing';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Stack,
    Typography
} from '@mui/material';
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
    if (!campaign) return null;

    const stats = campaign.stats || {
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Campaign Statistics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {campaign.subject}
                </Typography>
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
                                        {campaign.status.replace('_', ' ')}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Sent Date
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {campaign.sent_at ? format(new Date(campaign.sent_at), 'dd MMM yyyy, HH:mm') : 'Not sent yet'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Total Target
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {campaign.total_target.toLocaleString()} recipients
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
                            {campaign.html_content ? (
                                <iframe
                                    srcDoc={campaign.html_content}
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
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <AppButton onClick={onClose} variantStyle="outline">
                    Close
                </AppButton>
            </DialogActions>
        </Dialog>
    );
};

export default ViewCampaignStatsModal;
