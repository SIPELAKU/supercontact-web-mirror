// components/email-marketing/mailing-lists/modals/AddMailingListModal.tsx
"use client";

import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AddMailingListModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMailingListModal = ({ open, onClose, onSuccess }: AddMailingListModalProps) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("List name is required.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // MOCK - Simulate success
      const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(500);
      
      toast.success('Mailing list created successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create mailing list.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Mailing List</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="List Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          autoFocus
          error={Boolean(error && !name.trim())}
          helperText={error && !name.trim() ? "List name is required" : ""}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create List'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMailingListModal;
