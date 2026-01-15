// components/email-marketing/campaigns/modals/AddCampaignModal.tsx
"use client";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AddCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCampaignModal = ({ open, onClose, onSuccess }: AddCampaignModalProps) => {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setSubject('');
    setBodyHtml('');
    setError('');
    onClose();
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!bodyHtml.trim()) {
      setError("Email content is required.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // MOCK - Simulate success
      const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(500);
      
      toast.success(saveAsDraft ? 'Campaign saved as draft.' : 'Campaign created and sent!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create campaign.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Campaign</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
            error={Boolean(error && !subject.trim())}
            helperText={error && !subject.trim() ? "Subject is required" : ""}
          />
          
          <TextField
            label="Email Content (HTML)"
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            fullWidth
            required
            multiline
            rows={10}
            error={Boolean(error && !bodyHtml.trim())}
            helperText={error && !bodyHtml.trim() ? "Content is required" : "You can use HTML tags"}
            placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={() => handleSubmit(true)} 
            variant="outlined" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save as Draft'}
          </Button>
          <Button 
            onClick={() => handleSubmit(false)} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create & Send'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddCampaignModal;
