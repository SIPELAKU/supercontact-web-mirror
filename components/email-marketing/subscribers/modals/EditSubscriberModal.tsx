// components/email-marketing/subscribers/modals/EditSubscriberModal.tsx
"use client";

import { useUpdateSubscriber } from '@/lib/hooks/useSubscribers';
import { Subscriber } from '@/lib/types/email-marketing';
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
          <TextField 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            fullWidth 
            required 
            disabled 
            sx={{ backgroundColor: '#f5f5f5' }}
            error={Boolean(error && !email.trim())} 
            helperText="Email cannot be changed"
          />
          <TextField 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            fullWidth 
            required
            error={Boolean(error && !name.trim())} 
            helperText={error && !name.trim() ? "Name is required" : ""}
          />
          <TextField 
            label="Phone Number" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            fullWidth 
            required
            error={Boolean(error && !phoneNumber.trim())} 
            helperText={error && !phoneNumber.trim() ? "Phone number is required" : ""}
          />
          <TextField 
            label="Position" 
            value={position} 
            onChange={(e) => setPosition(e.target.value)} 
            fullWidth 
            required
            error={Boolean(error && !position.trim())} 
            helperText={error && !position.trim() ? "Position is required" : ""}
          />
          <TextField 
            label="Company" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            fullWidth 
          />
          <TextField 
            label="Address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            fullWidth 
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="secondary" disabled={updateMutation.isPending}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubscriberModal;
