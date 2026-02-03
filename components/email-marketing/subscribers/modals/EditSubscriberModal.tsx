// components/email-marketing/subscribers/modals/EditSubscriberModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppTextarea } from '@/components/ui/app-textarea';
import { useUpdateSubscriber } from '@/lib/hooks/useSubscribers';
import { Subscriber } from '@/lib/types/email-marketing';
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
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface EditSubscriberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriberData: Subscriber;
}

const EditSubscriberModal = ({ open, onClose, onSuccess, subscriberData }: EditSubscriberModalProps) => {
  const updateMutation = useUpdateSubscriber();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && subscriberData) {
      setEmail(subscriberData.email || '');
      setName(subscriberData.name || '');
      setPhoneNumber(subscriberData.phone_number || '');
      setPosition(subscriberData.position || '');
      setCompany(subscriberData.company || '');
      setAddress(subscriberData.address || '');
      setError('');
    }
  }, [open, subscriberData]);

  const handleClose = () => {
    setEmail('');
    setName('');
    setPhoneNumber('');
    setPosition('');
    setCompany('');
    setAddress('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!subscriberData) return;

    // Validate required fields
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!position.trim()) {
      setError("Position is required.");
      return;
    }

    setError('');
    try {
      await updateMutation.mutateAsync({
        subscriberId: subscriberData.id,
        data: {
          name: name.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          position: position.trim(),
          company: company.trim(),
          address: address.trim()
        }
      });

      toast.success('Subscriber updated successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update subscriber.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (open && !subscriberData) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Subscriber</DialogTitle>
        <DialogContent dividers><Alert severity="warning">Subscriber data not found.</Alert></DialogContent>
        <DialogActions><Button onClick={handleClose}>Close</Button></DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Subscriber</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <label>Email</label>
            <AppInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled
              isBgWhite
              error={Boolean(error && !email.trim())}
              helperText="Email cannot be changed"
            />
          </Box>
          <Box>
            <label>Name</label>
            <AppInput
              value={name}
              isBgWhite
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              error={Boolean(error && !name.trim())}
              helperText={error && !name.trim() ? "Name is required" : ""}
            />
          </Box>
          <Box>
            <label>Phone Number</label>
            <AppInput
              type="tel"
              value={phoneNumber}
              isBgWhite
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              required
              error={Boolean(error && !phoneNumber.trim())}
              helperText={error && !phoneNumber.trim() ? "Phone number is required" : ""}
            />
          </Box>
          <Box>
            <label>Position</label>
            <AppInput
              value={position}
              isBgWhite
              onChange={(e) => setPosition(e.target.value)}
              fullWidth
              required
              error={Boolean(error && !position.trim())}
              helperText={error && !position.trim() ? "Position is required" : ""}
            />
          </Box>
          <Box>
            <label>Company</label>
            <AppInput
              value={company}
              isBgWhite
              onChange={(e) => setCompany(e.target.value)}
              fullWidth
            />
          </Box>
          <Box>
            <label>Address</label>
            <AppTextarea
              value={address}
              isBgWhite
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <AppButton variantStyle='outline' onClick={handleClose} color="gray" disabled={updateMutation.isPending}>Cancel</AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" color='primary' disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubscriberModal;
