"use client";

import { AppButton } from '@/components/ui/app-button';
import { BroadcastCampaign } from '@/lib/types/whatsapp-marketing';
import {
    Box,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import { Activity, CheckCircle2, Mail, RefreshCcw, Smartphone, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ViewBroadcastCampaignStatsModalProps {
    open: boolean;
    onClose: () => void;
    campaign: BroadcastCampaign | null;
    onRefresh?: () => void;
    isRefreshing?: boolean;
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

const ViewBroadcastCampaignStatsModal = ({
    open,
    onClose,
    campaign,
    onRefresh,
    isRefreshing = false
}: ViewBroadcastCampaignStatsModalProps) => {
    if (!campaign) return null;

    const stats = campaign.stats || {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0
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
                            Broadcast Campaign Statistics
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {campaign.name}
                        </Typography>
                    </Box>
                    {onRefresh && (
                        <Tooltip title="Refresh statistics">
                            <IconButton
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                sx={{
                                    ml: 2,
                                    '&:hover': { bgcolor: '#F3F4F6' }
                                }}
                            >
                                <RefreshCcw
                                    size={20}
                                    style={{
                                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    )}
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    <Grid container sx={{ minHeight: '400px' }}>
                        {/* Left Column: Stats */}
                        <Grid item xs={12} md={6} sx={{ p: 3, borderRight: '1px solid #E5E7EB', overflowY: 'auto' }}>
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
                                            title="Sent"
                                            value={stats.sent.toLocaleString()}
                                            icon={Smartphone}
                                            color="#6366f1"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Delivered"
                                            value={stats.delivered.toLocaleString()}
                                            icon={CheckCircle2}
                                            color="#10b981"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Read"
                                            value={stats.read.toLocaleString()}
                                            icon={Mail}
                                            color="#0ea5e9"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <StatCard
                                            title="Failed"
                                            value={stats.failed.toLocaleString()}
                                            icon={XCircle}
                                            color="#ef4444"
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Grid>

                        {/* Right Column: Campaign Details */}
                        <Grid item xs={12} md={6} sx={{ p: 3, bgcolor: '#F9FAFB' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                Campaign Details
                            </Typography>
                            <Stack spacing={2}>
                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Account (Device) ID
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {campaign.account_id}
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Template ID
                                    </Typography>
                                    <Typography variant="body2">
                                        {campaign.template_id}
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Recipient Source
                                    </Typography>
                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                        {campaign.recipient_source.replace('_', ' ')}
                                    </Typography>
                                </Paper>

                                {campaign.variables && Object.keys(campaign.variables).length > 0 && (
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Variables
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {Object.entries(campaign.variables).map(([key, value]) => (
                                                <Chip
                                                    key={key}
                                                    label={`${key}: ${value}`}
                                                    size="small"
                                                    sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB' }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
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

export default ViewBroadcastCampaignStatsModal;
