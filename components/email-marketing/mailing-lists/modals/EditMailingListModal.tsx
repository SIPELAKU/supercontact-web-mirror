// components/email-marketing/mailing-lists/modals/EditMailingListModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
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
import { notify } from '@/lib/notifications';

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

      notify.success('Mailing list updated successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update mailing list.';
      setError(errorMessage);
      notify.error(errorMessage);
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

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  return (
    <Dialog open={open} onClose={() => setShowCloseConfirmation(true)} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Mailing List</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={1} sx={{ mt: 1 }}>
          <label htmlFor="name">Mailing List Name</label>
          <AppInput
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            isBgWhite
            required
            autoFocus
            placeholder="e.g., Newsletter Subscribers, VIP Customers"
            error={Boolean(error && !name.trim())}
            helperText={error && !name.trim() ? "Mailing list name is required" : ""}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <AppButton
          onClick={() => {
            setName('');
            setError('');
            onClose();
          }}
          color="gray"
          variantStyle='outline'
          disabled={updateMutation.isPending}
        >
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </AppButton>
      </DialogActions>

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => {
          setShowCloseConfirmation(false);
          handleClose();
        }}
        title="Are you sure?"
        description="This will discard your current record."
        confirmText="Discard record"
        cancelText="Cancel"
        variant="danger"
      />
    </Dialog>
  );
};

export default EditMailingListModal;
