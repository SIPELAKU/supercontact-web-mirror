// components/email-marketing/mailing-lists/modals/EditMailingListModal.tsx
"use client";

import { useUpdateMailingList } from '@/lib/hooks/useMailingLists';
import { MailingList } from '@/lib/types/email-marketing';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface EditMailingListModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mailingList: MailingList | null;
}

const EditMailingListModal = ({ open, onClose, onSuccess, mailingList }: EditMailingListModalProps) => {
  const updateMutation = useUpdateMailingList();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && mailingList) {
      setName(mailingList.name || '');
      setError('');
    }
  }, [open, mailingList]);

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!mailingList) return;

    if (!name.trim()) {
      setError("Mailing list name is required.");
      return;
    }

    setError('');
    try {
      await updateMutation.mutateAsync({
        mailingListId: mailingList.id,
        data: { name: name.trim() }
      });
      
      toast.success('Mailing list updated successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update mailing list.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (open && !mailingList) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Mailing List</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning">Mailing list data not found.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Mailing List</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField 
            label="Mailing List Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            fullWidth 
            required
            error={Boolean(error && !name.trim())} 
            helperText={error && !name.trim() ? "Name is required" : ""}
            placeholder="e.g., Newsletter Subscribers, VIP Customers"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="secondary" disabled={updateMutation.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMailingListModal;
