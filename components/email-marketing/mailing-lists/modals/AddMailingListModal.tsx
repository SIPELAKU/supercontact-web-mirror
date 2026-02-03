// components/email-marketing/mailing-lists/modals/AddMailingListModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { useCreateMailingList } from '@/lib/hooks/useMailingLists';
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
  const [error, setError] = useState('');

  const createMutation = useCreateMailingList();

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

    setError('');

    try {
      await createMutation.mutateAsync({ name: name.trim() });
      toast.success('Mailing list created successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create mailing list.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Mailing List</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <label htmlFor="name">Name</label>
        <AppInput
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          isBgWhite
          required
          autoFocus
          placeholder='Enter list name'
          error={Boolean(error && !name.trim())}
          helperText={error && !name.trim() ? "List name is required" : ""}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <AppButton onClick={handleClose} color="gray" variantStyle='outline' disabled={createMutation.isPending}>
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Create List'}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddMailingListModal;
