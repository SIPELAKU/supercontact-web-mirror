"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Alert
} from '@mui/material';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { useUpdateBroadcast } from '@/lib/hooks/useBroadcasts';
import { BroadcastCampaign } from '@/lib/types/whatsapp-marketing';
import { notify } from '@/lib/notifications';

interface EditBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  broadcast: BroadcastCampaign | null;
}

export default function EditBroadcastModal({ open, onClose, broadcast }: EditBroadcastModalProps) {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState('');
  
  const updateMutation = useUpdateBroadcast();

  useEffect(() => {
    if (broadcast && open) {
      setName(broadcast.name);
      setTemplateId(broadcast.template_id);
    }
  }, [broadcast, open]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (action: 'send' | 'draft') => {
    if (!name.trim()) {
      setError('Broadcast name is required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: broadcast!.id,
        data: {
          name: name.trim(),
          template_id: templateId,
          action,
          status: action === 'send' ? 'Sending' : 'Draft'
        }
      });
      
      notify.success(`Broadcast "${name}" updated successfully.`);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update broadcast');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit WhatsApp Broadcast</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Broadcast Name
            </Typography>
            <AppInput
              fullWidth
              placeholder="e.g. Ramadhan Promotion 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Select Template
            </Typography>
            <AppSelect
              fullWidth
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as string)}
              options={[
                { value: 'template-1', label: 'Welcome Message' },
                { value: 'template-2', label: 'Promo Discount' },
                { value: 'template-3', label: 'Flash Sale' },
              ]}
              placeholder="Choose a template"
            />
          </Box>
          
          <Alert severity="info">
            This is a placeholder form for editing. Full implementation will be available once the corresponding APIs are ready.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <AppButton variantStyle="outline" onClick={handleClose}>
          Cancel
        </AppButton>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <AppButton 
            variantStyle="outline" 
            onClick={() => handleSubmit('draft')}
            isLoading={updateMutation.isPending}
          >
            Update Draft
          </AppButton>
          <AppButton 
            variantStyle="primary" 
            onClick={() => handleSubmit('send')}
            isLoading={updateMutation.isPending}
          >
            Send Now
          </AppButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
