// components/email-marketing/mailing-lists/modals/AddMailingListModal.tsx
"use client";

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
        <Button onClick={handleClose} color="secondary" disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Create List'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMailingListModal;
