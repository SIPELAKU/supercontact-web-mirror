// components/whatsapp-marketing/templates/detail/GeneralInfoDetail.tsx
"use client";

import { Card, CardContent, Typography, Grid, Stack, Box } from '@mui/material';
import { Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { AppButton } from '@/components/ui/app-button';
import { BroadcastTemplate } from '@/lib/types/whatsapp-marketing';

interface GeneralInfoDetailProps {
  template: BroadcastTemplate;
  onEdit: () => void;
}

export default function GeneralInfoDetail({
  template,
  onEdit,
}: GeneralInfoDetailProps) {
  const infoItems = [
    { label: 'Template name', value: template.friendly_name },
    { label: 'Content template SID', value: template.provider_content_sid },
    { label: 'Template language', value: template.language === 'en' ? 'English' : template.language },
    { label: 'Content type', value: Object.keys(template.types)[0] || '-' },
    { 
      label: 'Last Updated at', 
      value: template.updated_at ? format(new Date(template.updated_at), 'MMMM d, yyyy HH:mm') : '-' 
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
          <AppButton
            variantStyle="soft"
            startIcon={<Edit3 size={16} />}
            onClick={onEdit}
          >
            Edit
          </AppButton>
        </Stack>

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
