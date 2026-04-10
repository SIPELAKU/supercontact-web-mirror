// components/whatsapp-marketing/templates/create/ContentTypeSelector.tsx
"use client";

import { Card, CardContent, Typography, Grid, Radio, Box, Stack } from '@mui/material';
import {
  Type,
  Image,
  List,
  MousePointer2,
  Reply,
  Square,
  LayoutGrid,
  CreditCard,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';

interface ContentTypeOption {
  id: BroadcastTemplateType;
  label: string;
  icon: React.ReactNode;
}

const OPTIONS: ContentTypeOption[] = [
  { id: 'twilio/text', label: 'Text', icon: <Type size={20} /> },
  { id: 'twilio/media', label: 'Media', icon: <Image size={20} /> },
  { id: 'twilio/list-picker', label: 'List Picker', icon: <List size={20} /> },
  { id: 'twilio/call-to-action', label: 'Call to Action', icon: <MousePointer2 size={20} /> },
  { id: 'twilio/quick-reply', label: 'Quick Reply', icon: <Reply size={20} /> },
  { id: 'twilio/card', label: 'Card', icon: <Square size={20} /> },
  { id: 'twilio/catalog', label: 'Catalog', icon: <ShoppingBag size={20} /> },
  { id: 'twilio/carousel', label: 'Carousel', icon: <Layers size={20} /> },
  { id: 'whatsapp/card', label: 'Whatsapp Card', icon: <Square size={20} /> },
  { id: 'whatsapp/authentication', label: 'Authentication', icon: <ShieldCheck size={20} /> },
  { id: 'twilio/flows', label: 'Flows (Twilio)', icon: <Zap size={20} /> },
  { id: 'whatsapp/flows', label: 'Flows (WhatsApp)', icon: <Zap size={20} /> },
];

interface ContentTypeSelectorProps {
  selectedType: BroadcastTemplateType;
  onChange: (type: BroadcastTemplateType) => void;
}

export default function ContentTypeSelector({
  selectedType,
  onChange,
}: ContentTypeSelectorProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Content Type
        </Typography>

        <Grid container spacing={2}>
          {OPTIONS.map((option) => (
            <Grid item xs={12} sm={6} key={option.id}>
              <Card
                variant="outlined"
                onClick={() => onChange(option.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  borderColor: selectedType === option.id ? 'primary.main' : 'divider',
                  bgcolor: selectedType === option.id ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Radio
                      checked={selectedType === option.id}
                      onChange={() => onChange(option.id)}
                      value={option.id}
                      size="small"
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedType === option.id ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={selectedType === option.id ? 'bold' : 'medium'}
                      color={selectedType === option.id ? 'primary.main' : 'text.primary'}
                    >
                      {option.label}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
