// components/whatsapp-marketing/group-broadcasting/modals/EditGroupBroadcastModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useUpdateGroupBroadcast } from '@/lib/hooks/useGroupBroadcasts';
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { useState, useEffect } from 'react';
import { notify } from '@/lib/notifications';
import { GroupBroadcast } from '@/lib/types/whatsapp-marketing';

interface EditGroupBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  broadcast: GroupBroadcast | null;
}

const EditGroupBroadcastModal = ({ open, onClose, onSuccess, broadcast }: EditGroupBroadcastModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const updateMutation = useUpdateGroupBroadcast();

  useEffect(() => {
    if (broadcast) {
      setName(broadcast.name);
    }
  }, [broadcast, open]);

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!broadcast) return;
    
    if (!name.trim()) {
      setError("Broadcast group name is required.");
      return;
    }

    setError('');

    try {
      await updateMutation.mutateAsync({ id: broadcast.id, name: name.trim() });
      notify.success('Broadcast group updated successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update broadcast group.';
      setError(errorMessage);
      notify.error(errorMessage);
    }
  };

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const isChanged = broadcast && name.trim() !== broadcast.name;

  const handleAttemptClose = () => {
    if (isChanged) {
      setShowCloseConfirmation(true);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleAttemptClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Group Broadcast</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <label htmlFor="edit-name" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          Broadcast Group Name
        </label>
        <AppInput
          id="edit-name"
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
          disabled={updateMutation.isPending}
        >
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" disabled={updateMutation.isPending || !isChanged}>
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
        description="This will discard your current changes."
        confirmText="Discard changes"
        cancelText="Cancel"
        variant="danger"
      />
    </Dialog>
  );
};

export default EditGroupBroadcastModal;
