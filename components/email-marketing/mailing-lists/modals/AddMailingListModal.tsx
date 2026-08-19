// components/email-marketing/mailing-lists/modals/AddMailingListModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useCreateMailingList } from '@/lib/hooks/useMailingLists';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import { notify } from '@/lib/notifications';

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
      notify.success('Mailing list created successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create mailing list.';
      setError(errorMessage);
      notify.error(errorMessage);
    }
  };

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  return (
    <Dialog open={open} onClose={() => setShowCloseConfirmation(true)} maxWidth="sm" fullWidth>
      <DialogTitle>Add Mailing List</DialogTitle>
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
        <AppButton
          onClick={() => {
            setName('');
            setError('');
            onClose();
          }}
          color="gray"
          variantStyle='outline'
          disabled={createMutation.isPending}
        >
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Create List'}
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
        variant="discard"
      />
    </Dialog>
  );
};

export default AddMailingListModal;
