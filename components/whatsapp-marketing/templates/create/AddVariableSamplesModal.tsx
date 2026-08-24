// components/whatsapp-marketing/templates/create/AddVariableSamplesModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { X, ChevronDown, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AppInput } from '@/components/ui/app-input';
import { AppButton } from '@/components/ui/app-button';

interface AddVariableSamplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onSave: (variables: Record<string, string>) => void;
  onSaveWithoutSamples: () => void;
  initialSamples?: Record<string, string>;
  isSaving?: boolean;
}

export default function AddVariableSamplesModal({
  open,
  onOpenChange,
  formData,
  onSave,
  onSaveWithoutSamples,
  initialSamples = {},
  isSaving = false
}: AddVariableSamplesModalProps) {
  const [samples, setSamples] = useState<Record<string, string>>({});

  // Detect sections with variables
  const sections = React.useMemo(() => {
    const found: { title: string, content: string, vars: string[] }[] = [];

    const scan = (obj: any, label: string) => {
      if (typeof obj === 'string') {
        const matches = obj.match(/{{(\d+)}}/g);
        if (matches) {
          const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));
          found.push({ title: label, content: obj, vars: uniqueVars });
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => scan(item, `${label} ${i + 1}`));
      } else if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, val]) => {
          const niceKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          scan(val, niceKey);
        });
      }
    };

    scan(formData, 'Content');
    return found;
  }, [formData]);

  // All unique variables across all sections
  const allVars = React.useMemo(() => {
    const vars = new Set<string>();
    sections.forEach(s => s.vars.forEach(v => vars.add(v)));
    return Array.from(vars).sort((a, b) => parseInt(a) - parseInt(b));
  }, [sections]);

  useEffect(() => {
    if (open) {
      // Initialize samples state with initial samples or existing local state
      const initial: Record<string, string> = {};
      allVars.forEach(v => {
        initial[v] = initialSamples[v] || samples[v] || '';
      });
      setSamples(initial);
    }
  }, [open, allVars, initialSamples]);

  const handleSampleChange = (varNum: string, value: string) => {
    setSamples(prev => ({ ...prev, [varNum]: value }));
  };

  const handleSaveWithSamples = () => {
    // Mapping format: {"1": "Sample Value"}
    onSave(samples);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <Box sx={{ p: 1, position: 'relative' }}>
        <IconButton
          onClick={() => onOpenChange(false)}
          sx={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}
        >
          <X size={20} />
        </IconButton>

        <DialogTitle sx={{ p: 3, pb: 0 }}>
          Add sample to variable
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={3} sx={{ mb: 4, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                flexShrink: 0,
                bgcolor: 'primary.light',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                color: 'primary.main'
              }}
            >
              <ShieldCheck size={64} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                To ensure that this template can be used across multiple channels, we recommend that you provide a sample value for all variables. Please note that WhatsApp has a requirement that you submit a sample of the content that you plan to send for each variable in order to obtain approval. If you do not provide these samples at this stage, you will be unable to submit your template for WhatsApp approval at a later time.
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={2}>
            {sections.map((section, idx) => (
              <Accordion
                key={idx}
                defaultExpanded={idx === 0}
                variant="outlined"
                sx={{
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'action.hover', p: 2 }}>
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5, py: 0.5 }}>
                    {section.title}: {section.content}
                  </Typography>

                  <Stack spacing={2}>
                    {section.vars.map(v => (
                      <Box key={v}>
                        <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                          Sample for: &#123;&#123;{v}&#125;&#125;
                        </Typography>
                        <AppInput
                          placeholder="Enter Sample data"
                          value={samples[v] || ''}
                          onChange={(e) => handleSampleChange(v, e.target.value)}
                          isBgWhite
                          size="small"
                        />
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </DialogContent>

        <DialogFooter sx={{ p: 3, pt: 1 }}>
          <Stack direction="row" spacing={2} width="100%" justifyContent="space-between">
            <AppButton variantStyle="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </AppButton>
            <Stack direction="row" spacing={2}>
              <AppButton variantStyle="outline" onClick={onSaveWithoutSamples} disabled={isSaving}>
                Save without samples
              </AppButton>
              <AppButton variantStyle="primary" onClick={handleSaveWithSamples} disabled={isSaving} isLoading={isSaving}>
                Save with samples
              </AppButton>
            </Stack>
          </Stack>
        </DialogFooter>
      </Box>
    </Dialog>
  );
}
