// components/whatsapp-marketing/group-broadcasting/modals/AddGroupBroadcastModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useCreateGroupBroadcast } from '@/lib/hooks/useGroupBroadcasts';
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { useState } from 'react';
import { notify } from '@/lib/notifications';

interface AddGroupBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGroupBroadcastModal = ({ open, onClose, onSuccess }: AddGroupBroadcastModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateGroupBroadcast();

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Broadcast group name is required.");
      return;
    }

    setError('');

    try {
      await createMutation.mutateAsync({ name: name.trim() });
      notify.success('Broadcast group created successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create broadcast group.';
      setError(errorMessage);
      notify.error(errorMessage);
    }
  };

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  return (
    <Dialog open={open} onClose={() => setShowCloseConfirmation(true)} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group Broadcast</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          Broadcast Group Name
        </label>
        <AppInput
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          isBgWhite
          required
          autoFocus
          placeholder='Enter broadcast group name'
          error={Boolean(error && !name.trim())}
          helperText={error && !name.trim() ? "Broadcast group name is required" : ""}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <AppButton
          onClick={handleClose}
          color="gray"
          variantStyle='outline'
          disabled={createMutation.isPending}
        >
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Create Group'}
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
        description="This will discard your current entry."
        confirmText="Discard entry"
        cancelText="Cancel"
        variant="danger"
      />
    </Dialog>
  );
};

export default AddGroupBroadcastModal;
