// components/whatsapp-marketing/templates/detail/GeneralInfoDetail.tsx
"use client";

import { Card, CardContent, Typography, Grid, Stack, Box, Alert } from '@mui/material';
import { Edit3, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { AppButton } from '@/components/ui/app-button';
import { notify } from '@/lib/notifications';
import { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';
import { useSyncTemplateApprovalStatus } from '@/lib/hooks/useBroadcastTemplates';
import { TemplateApprovalStatusBadge, TemplateCategoryBadge } from '../TemplateApprovalBadge';

interface GeneralInfoDetailProps {
  template: BroadcastTemplate;
  onEdit: () => void;
  onSynced: () => void;
}

export default function GeneralInfoDetail({
  template,
  onEdit,
  onSynced,
}: GeneralInfoDetailProps) {
  const syncMutation = useSyncTemplateApprovalStatus();

  const handleRefreshStatus = async () => {
    try {
      await syncMutation.mutateAsync(template.id);
      notify.success('Approval status refreshed');
      onSynced();
    } catch (err: any) {
      notify.error(err.message || 'Failed to refresh approval status');
    }
  };

  const infoItems = [
    { label: 'Template name', value: template.friendly_name },
    { label: 'Content template SID', value: template.provider_content_sid },
    { label: 'Template language', value: template.language === 'en' ? 'English' : template.language },
    { label: 'Content type', value: Object.keys(template.types)[0] || '-' },
    {
      label: 'Last Updated at',
      value: template.updated_at ? format(new Date(template.updated_at), 'MMMM d, yyyy HH:mm') : '-'
    },
    {
      label: 'Channel eligibility',
      value: template.channel_eligibility?.length ? template.channel_eligibility.join(', ') : '-',
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              General Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and manage your template metadata
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <AppButton
              variantStyle="soft"
              startIcon={<RefreshCw size={16} className={syncMutation.isPending ? 'animate-spin' : ''} />}
              onClick={handleRefreshStatus}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? 'Refreshing...' : 'Refresh Status'}
            </AppButton>
            <AppButton
              variantStyle="soft"
              startIcon={<Edit3 size={16} />}
              onClick={onEdit}
            >
              Edit
            </AppButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mb={3}>
          <TemplateApprovalStatusBadge status={template.whatsapp_approval_status} />
          <TemplateCategoryBadge category={template.whatsapp_category} />
        </Stack>

        {template.whatsapp_approval_status === 'Rejected' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium">
              WhatsApp rejected this template
            </Typography>
            <Typography variant="body2">
              {template.whatsapp_rejection_reason || 'No reason was provided by WhatsApp.'}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} rowSpacing={4}>
          {infoItems.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.label}>
              <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                {item.label}
              </Typography>
              <Typography
                variant="body1"
                fontWeight="semibold"
                sx={{
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                  color: 'text.primary'
                }}
              >
                {item.value || '-'}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
