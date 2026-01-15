// components/email-marketing/subscribers/modals/EditSubscriberModal.tsx
"use client";

import { MailingList, Subscriber } from '@/lib/types/email-marketing';
import {
    Alert, Autocomplete,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid, TextField
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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedLists, setSelectedLists] = useState<MailingList[]>([]);
  const [listOptions, setListOptions] = useState<MailingList[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && subscriberData) {
      setEmail(subscriberData.email);
      setName(subscriberData.name || '');
      setCompanyName(subscriberData.company_name || '');
      setError('');
      setIsSubmitting(false);

      const fetchLists = async () => {
        try {
          // TODO: Replace with real API call when backend is ready
          // const listsRes = await axiosClient.get('/marketing/mailing-lists');
          // const availableLists: MailingList[] = listsRes.data?.lists || [];
          
          // MOCK DATA - Remove this when backend is ready
          const { mockMailingLists, simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
          await simulateApiDelay(300);
          const availableLists = mockMailingLists;
          
          setListOptions(availableLists);
          const currentSubscriberListIds = subscriberData.list_ids || [];
          const currentLists = availableLists.filter((list: MailingList) =>
            currentSubscriberListIds.includes(list.id)
          );
          setSelectedLists(currentLists);

        } catch (err: any) {
          const message = err.message || "Failed to load mailing lists.";
          console.error("Error fetching mailing lists:", err);
          toast.error(message);
          setError(message);
        }
      };
      fetchLists();
    }
  }, [open, subscriberData]);

  const handleClose = () => {
    setEmail(''); setName(''); setCompanyName(''); setSelectedLists([]); setListOptions([]);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!subscriberData) return;

    setIsSubmitting(true);
    setError('');
    try {
      // TODO: Replace with real API call when backend is ready
      // const payload = {
      //   email: email,
      //   name: name || null,
      //   company_name: companyName || null,
      //   list_ids: selectedLists.map(list => list.id)
      // };
      // await axiosClient.put(`/subscribers/${subscriberData.id}`, payload);
      
      // MOCK - Simulate success
      const { simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
      await simulateApiDelay(500);
      
      toast.success('Subscriber updated successfully.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update subscriber.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
              required 
              disabled 
              sx={{ backgroundColor: '#f5f5f5' }} 
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Name (Optional)" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              fullWidth 
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Company Name (Optional)" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              fullWidth 
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={listOptions}
              getOptionLabel={(option) => `${option.name} (${option.contact_count})`}
              value={selectedLists}
              onChange={(_, newValue) => setSelectedLists(newValue)}
              renderInput={(params) => <TextField {...params} label="Mailing List Membership" />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubscriberModal;
