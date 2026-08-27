"use client";

// components/email-marketing/campaigns/modals/ViewCampaignStatsModal.tsx
//
// Now a thin Dialog around CampaignStatsPanel. The body used to live here,
// which is why campaign statistics had no URL of their own — see
// /email-marketing/campaigns/[id], which renders the same panel as a page.

import { AppButton } from '@/components/ui/app-button';
import { Box, Dialog, DialogActions, DialogContent } from '@mui/material';
import { Campaign } from '@/lib/types/email-marketing';
import { CampaignStatsPanel } from '../CampaignStatsPanel';

interface ViewCampaignStatsModalProps {
    open: boolean;
    onClose: () => void;
    campaign: Campaign | null;
    onResend?: (campaign: Campaign) => void;
    isResending?: boolean;
}

const ViewCampaignStatsModal = ({ open, onClose, campaign, onResend, isResending }: ViewCampaignStatsModalProps) => {
    if (!campaign) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth aria-label="Campaign statistics">
            {/* No DialogTitle: the panel already carries the heading, the
                subject and the refresh control, and printing the title twice
                is exactly the duplication this refactor is removing. */}
            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ px: 3, pt: 2 }}>
                    <CampaignStatsPanel campaign={campaign} height="70vh" />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                {campaign.status.toLowerCase() === 'failed' && onResend && (
                    <AppButton
                        onClick={() => onResend(campaign)}
                        disabled={isResending}
                        variantStyle="primary"
                    >
                        {isResending ? 'Resending…' : 'Resend Campaign'}
                    </AppButton>
                )}
                <AppButton onClick={onClose} variantStyle="outline">
                    Close
                </AppButton>
            </DialogActions>
        </Dialog>
    );
};

export default ViewCampaignStatsModal;
