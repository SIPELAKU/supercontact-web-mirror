// components/whatsapp-marketing/templates/create/GeneralInfoCard.tsx
"use client";

import { Card, CardContent, Typography, Box } from '@mui/material';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';

interface GeneralInfoCardProps {
  name: string;
  language: string;
  onNameChange: (val: string) => void;
  onLanguageChange: (val: string) => void;
}

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Indonesian', value: 'id' },
];

export default function GeneralInfoCard({
  name,
  language,
  onNameChange,
  onLanguageChange,
}: GeneralInfoCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          General Information
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Give your template unique name and language
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Template Name
            </Typography>
            <AppInput
              placeholder="Type template name"
              required
              isBgWhite
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                // Automatically convert spaces to underscores and filter out invalid characters
                const sanitized = val.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
                onNameChange(sanitized);
              }}
              helperText="Template name can only contain lowercase alphanumeric characters and underscores. No other characters are allowed."
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Template Language
            </Typography>
            <AppSelect
              placeholder="Select template language"
              required
              isBgWhite
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as string)}
              options={LANGUAGES}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
