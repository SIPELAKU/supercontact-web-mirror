"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  Divider,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { AppButton } from '@/components/ui/app-button';
import { BroadcastCampaign } from '@/lib/types/whatsapp-marketing';
import { format } from 'date-fns';

interface ViewBroadcastStatsModalProps {
  open: boolean;
  onClose: () => void;
  broadcast: BroadcastCampaign | null;
}

export default function ViewBroadcastStatsModal({ open, onClose, broadcast }: ViewBroadcastStatsModalProps) {
  if (!broadcast) return null;

  const stats = broadcast.stats || { sent: 0, delivered: 0, read: 0, failed: 0 };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Broadcast Statistics</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>{broadcast.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Created: {format(new Date(broadcast.created_at), "dd MMM yyyy, HH:mm")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {broadcast.status}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Sent" value={stats.sent} color="primary.main" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Delivered" value={stats.delivered} color="info.main" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Read" value={stats.read} color="success.main" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Failed" value={stats.failed} color="error.main" />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Details</Typography>
          <Stack spacing={1}>
            <DetailItem label="Total Target" value={broadcast.total_target} />
            <DetailItem label="Recipient Source" value={broadcast.recipient_source} />
            <DetailItem label="Template ID" value={broadcast.template_id} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <AppButton variantStyle="primary" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', borderColor: color }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
