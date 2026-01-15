// src/components/apps/campaigns/modal/ViewCampaignModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, Grid, Typography, Box,
  CircularProgress, Alert, Paper, Stack, Divider, Chip
} from '@mui/material';
import axios from 'src/api/axios';
import { CampaignDetail } from 'src/types/apps/campaigns';
import toast from 'react-hot-toast';
import { IconTemplate } from '@tabler/icons-react'; // Import ikon template

const StatCard = ({ title, value, color = 'text.primary' }: { title: string, value: string | number, color?: string }) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="caption" color="text.secondary">{title}</Typography>
    <Typography variant="h5" fontWeight={600} color={color}>{value}</Typography>
  </Paper>
);

interface ViewCampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: number | null;
}

const ViewCampaignModal = ({ open, onClose, campaignId }: ViewCampaignModalProps) => {
  const [details, setDetails] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Hanya fetch jika modal terbuka DAN ada campaignId
    if (open && campaignId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setDetails(null); // Reset detail sebelum fetch baru
        try {
          const response = await axios.get(`/marketing/${campaignId}`);
          setDetails(response.data);
        } catch (err: any) {
          const errorMessage = err.response?.data?.detail || 'Gagal mengambil detail kampanye.';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else if (!open) {
      // Reset state saat modal benar-benar ditutup
      setDetails(null);
      setIsLoading(false);
      setError('');
    }
    // Tambahkan onClose sebagai dependency jika ingin reset saat onClose dipanggil,
    // tapi biasanya cukup dengan `open`
  }, [campaignId, open]); // useEffect bergantung pada campaignId dan open

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: '30px' }}>
        {/* Tampilkan Loading jika sedang fetch */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {/* Tampilkan Error jika ada */}
        {error && !isLoading && (
          <Alert severity="error">{error}</Alert>
        )}
        {/* Tampilkan Detail jika sudah ada dan tidak loading */}
        {details && !isLoading && (
          <>
            <Typography variant="h4" gutterBottom>{details.subject}</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
              <Chip label={`Status: ${details.state}`} color="primary" size="small" />
              {/* Pastikan x_studio_owner_id adalah array sebelum akses index [1] */}
              <Chip label={`Owner: ${details.x_studio_owner_id && Array.isArray(details.x_studio_owner_id) ? details.x_studio_owner_id[1] : 'N/A'}`} size="small" />
              {/* Tampilkan Info Template */}
              {details.mail_template_id && Array.isArray(details.mail_template_id) && (
                <Chip
                  icon={<IconTemplate size="1rem" />}
                  label={`Template: ${details.mail_template_id[1]}`} // <-- GUNAKAN INI
                  variant="outlined"
                  size="small"
                  color="info"
                />
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Statistik Pengiriman</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}><StatCard title="Total Target" value={details.total ?? 0} /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="Terkirim" value={details.sent ?? 0} color="success.main" /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="Gagal" value={details.failed ?? 0} color="error.main" /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="% Diterima" value={`${details.received_ratio ?? 0}%`} /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="Dibuka" value={details.opened ?? 0} color="info.main" /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="% Dibuka" value={`${details.opened_ratio ?? 0}%`} /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="Diklik" value={details.clicked ?? 0} /></Grid>
              <Grid item xs={6} sm={3}><StatCard title="Ditolak (Bounced)" value={details.bounced ?? 0} /></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Pratinjau Isi Email</Typography>
            {/* Tambahkan Keterangan untuk Body HTML */}
            {details.mail_template_id && Array.isArray(details.mail_template_id) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                (Konten di bawah ini mungkin merupakan snapshot saat kampanye dibuat/diupdate. Email yang dikirim akan dirender dari template '{details.mail_template_id[1]}'.) {/* <-- GUNAKAN INI */}
              </Typography>
            )}
            {/* Tampilkan body_html jika ada dan berupa string */}
            <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflowY: 'auto' }}>
              <Box dangerouslySetInnerHTML={{ __html: typeof details.body_html === 'string' ? details.body_html : '<em>Tidak ada konten preview.</em>' }} />
            </Paper>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} variant="contained">Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCampaignModal;