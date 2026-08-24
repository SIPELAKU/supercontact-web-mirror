// components/email-marketing/subscribers/modals/EditSubscriberModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppTextarea } from '@/components/ui/app-textarea';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useUpdateSubscriber } from '@/lib/hooks/useSubscribers';
import { notify } from '@/lib/notifications';
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
  IconButton,
  Stack
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [newFieldKey, setNewFieldKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && subscriberData) {
      setEmail(subscriberData.email || '');
      setName(subscriberData.name || '');
      setPhoneNumber(subscriberData.phone_number || '');
      setPosition(subscriberData.position || '');
      setCompany(subscriberData.company || '');
      setAddress(subscriberData.address || '');
      setCustomFields(subscriberData.custom_fields ?? {});
      setNewFieldKey('');
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
    setCustomFields({});
    setNewFieldKey('');
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

    setError('');
    try {
      await updateMutation.mutateAsync({
        subscriberId: subscriberData.id,
        data: {
          name: name.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim() || '',
          position: position.trim() || '',
          company: company.trim() || '',
          address: address.trim() || '',
          custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
        }
      });

      notify.success('Subscriber updated successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update subscriber.';
      setError(errorMessage);
      notify.error(errorMessage);
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

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  return (
    <Dialog open={open} onClose={() => setShowCloseConfirmation(true)} maxWidth="sm" fullWidth>
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
              type="text"
              inputMode='numeric'
              value={phoneNumber}
              isBgWhite
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 15) {
                  setPhoneNumber(val);
                }
              }}
              fullWidth
            />
          </Box>
          <Box>
            <label>Position</label>
            <AppInput
              value={position}
              isBgWhite
              onChange={(e) => setPosition(e.target.value)}
              fullWidth
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

          {/* Custom Fields */}
          {Object.keys(customFields).length > 0 && (
            <Box>
              <label className="font-semibold text-gray-700">Custom Fields</label>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {Object.entries(customFields).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <label className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</label>
                      <AppInput
                        value={value}
                        isBgWhite
                        onChange={(e) => setCustomFields(prev => ({ ...prev, [key]: e.target.value }))}
                        fullWidth
                        placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const updated = { ...customFields };
                        delete updated[key];
                        setCustomFields(updated);
                      }}
                      sx={{ color: '#EF4444', mb: 0.5 }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Add Custom Field */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <label className="text-sm text-gray-600">Add Custom Field</label>
              <AppInput
                value={newFieldKey}
                isBgWhite
                onChange={(e) => setNewFieldKey(e.target.value)}
                fullWidth
                placeholder="Field name (e.g. occupation)"
              />
            </Box>
            <AppButton
              variantStyle="outline"
              color="primary"
              onClick={() => {
                const key = newFieldKey.trim().toLowerCase().replace(/\s+/g, '_');
                if (key && !customFields[key]) {
                  setCustomFields(prev => ({ ...prev, [key]: '' }));
                  setNewFieldKey('');
                }
              }}
              disabled={!newFieldKey.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <Plus size={16} className="mr-1" /> Add
            </AppButton>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <AppButton
          variantStyle='outline'
          onClick={() => {
            setEmail('');
            setName('');
            setPhoneNumber('');
            setPosition('');
            setCompany('');
            setAddress('');
            setCustomFields({});
            setNewFieldKey('');
            setError('');
            onClose();
          }}
          color="gray"
          disabled={updateMutation.isPending}
        >
          Cancel
        </AppButton>
        <AppButton onClick={handleSubmit} variantStyle="primary" color='primary' disabled={updateMutation.isPending}>
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
        variant="discard"
      />
    </Dialog>
  );
};

export default EditSubscriberModal;
