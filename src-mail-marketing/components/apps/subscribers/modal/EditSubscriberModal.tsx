// src/components/apps/subscribers/modal/EditSubscriberModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
  CircularProgress, Alert, Autocomplete
} from '@mui/material';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import { Subscriber } from 'src/types/apps/subscribers';
import { MailingList } from 'src/types/apps/campaigns';

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
          const listsRes = await axios.get('/marketing/mailing-lists');

          const availableLists: MailingList[] = listsRes.data?.lists || [];
          if (!listsRes.data || !Array.isArray(availableLists)) {
            console.error("Struktur data mailing list tidak sesuai:", listsRes.data);
            throw new Error("Format data mailing list tidak valid dari API.");
          }
          setListOptions(availableLists);
          const currentSubscriberListIds = subscriberData.list_ids || [];
          const currentLists = availableLists.filter((list: MailingList) =>
            currentSubscriberListIds.includes(list.id)
          );
          setSelectedLists(currentLists);

        } catch (err: any) {
          // Tangkap error dari axios atau error yang dilempar manual
          const message = err.message || "Gagal memuat data mailing list.";
          console.error("Error fetching mailing lists:", err);
          toast.error(message);
          // set error state di sini jika perlu ditampilkan di modal
          setError(message);
        }
      };
      fetchLists();
    }
  }, [open, subscriberData]);

  const handleClose = () => {
    // Reset state dasar saat ditutup (opsional, tergantung behavior yg diinginkan)
    setEmail(''); setName(''); setCompanyName(''); setSelectedLists([]); setListOptions([]);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!subscriberData) return;

    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        email: email,
        name: name || null,
        company_name: companyName || null,
        list_ids: selectedLists.map(list => list.id)
      };

      await axios.put(`/subscribers/${subscriberData.id}`, payload);
      toast.success('Subscriber berhasil diupdate.');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal mengupdate subscriber.';
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
        <DialogContent dividers><Alert severity="warning">Data subscriber tidak ditemukan.</Alert></DialogContent>
        <DialogActions><Button onClick={handleClose}>Tutup</Button></DialogActions>
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
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required disabled sx={{ backgroundColor: '#f5f5f5' }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Nama (Opsional)" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Nama Perusahaan (Opsional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={listOptions}
              getOptionLabel={(option) => `${option.name} (${option.contact_count})`}
              value={selectedLists} // Gunakan state selectedLists
              onChange={(_, newValue) => setSelectedLists(newValue)}
              renderInput={(params) => <TextField {...params} label="Keanggotaan Mailing List" />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>Batal</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Simpan Perubahan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubscriberModal;