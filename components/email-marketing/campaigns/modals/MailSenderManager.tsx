// components/email-marketing/campaigns/modals/MailSenderManager.tsx
"use client";

import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography
} from '@mui/material';
import { Edit2, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import { useUpdateMailSender, useDeleteMailSender } from '@/lib/hooks/useMailSenders';
import { notify } from '@/lib/notifications';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';

interface MailSenderManagerProps {
  mailSenderId: string;
  mailSenderName: string;
  mailSenderEmail: string;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const MailSenderManager = ({ 
  mailSenderId, 
  mailSenderName, 
  mailSenderEmail,
  onUpdate,
  onDelete 
}: MailSenderManagerProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newName, setNewName] = useState(mailSenderName);

  const updateMutation = useUpdateMailSender();
  const deleteMutation = useDeleteMailSender();

  const handleEditClick = () => {
    setNewName(mailSenderName);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!newName.trim()) {
      notify.error('Name is required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        mailSenderId,
        data: { name: newName.trim() }
      });
      notify.success('Mail sender updated successfully');
      setEditDialogOpen(false);
      onUpdate?.();
    } catch (error: any) {
      notify.error(error.message || 'Failed to update mail sender');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(mailSenderId);
      notify.success('Mail sender deleted successfully');
      setDeleteConfirmOpen(false);
      onDelete?.();
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete mail sender');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <AppButton
          onClick={handleEditClick}
          variantStyle="outline"
          color="primary"
          size="small"
          startIcon={<Edit2 size={16} />}
        >
          Edit
        </AppButton>
        <AppButton
          onClick={handleDeleteClick}
          variantStyle="outline"
          color="danger"
          size="small"
          startIcon={<Trash2 size={16} />}
        >
          Delete
        </AppButton>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Mail Sender Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Email: {mailSenderEmail}
            </Typography>
            <TextField
              fullWidth
              label="Sender Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter sender name"
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AppButton
            onClick={() => setEditDialogOpen(false)}
            variantStyle="outline"
            color="gray"
            disabled={updateMutation.isPending}
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={handleUpdateSubmit}
            variantStyle="primary"
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </AppButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationPopup
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Mail Sender?"
        description={`Are you sure you want to delete "${mailSenderName}" (${mailSenderEmail})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default MailSenderManager;
