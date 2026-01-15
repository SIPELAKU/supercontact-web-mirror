// src/components/apps/campaigns/modal/EditCampaignModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Box, Typography,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';
import RichTextEditor from 'src/components/forms/RichTextEditor';
import { Campaign, RecipientDetail } from 'src/types/apps/campaigns';
import { IconUser, IconUsers, IconCircleCheck, IconAlertCircle, IconHelpCircle } from '@tabler/icons-react';
import { MailServer } from 'src/types/apps/mailServer';

type MailServerOption = Pick<MailServer, 'id' | 'name' | 'x_studio_last_test_status'>;

interface EditCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaignData: Campaign | null;
}

const EditCampaignModal = ({ open, onClose, onSuccess, campaignData }: EditCampaignModalProps) => {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [mailServerId, setMailServerId] = useState<number | string>('');
  const [mailServerOptions, setMailServerOptions] = useState<MailServerOption[]>([]);
  const [campaignState, setCampaignState] = useState<Campaign['state'] | null>(null);
  const [recipients, setRecipients] = useState<RecipientDetail[]>([]);
  const [recipientType, setRecipientType] = useState<'Kontak' | 'Mailing List' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'send'>('save');
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (open && campaignData) {
      const fetchInitialData = async () => {
        setIsLoadingData(true);
        setError('');
        try {
          const [campaignDetailRes, serversRes] = await Promise.all([
            axios.get(`/marketing/${campaignData.id}`),
            axios.get('/mail-servers/for-selection')
          ]);

          const details = campaignDetailRes.data;
          const servers = serversRes.data;
          
          setSubject(details.subject || '');
          setBodyHtml(details.body_html || '');
          setCampaignState(details.state);
          setMailServerOptions(servers);

          if (details.contact_list_ids && details.contact_list_ids.length > 0) {
            setRecipientType('Mailing List');
            setRecipients(details.contact_list_ids);
          } else if (details.mailing_domain_contacts && details.mailing_domain_contacts.length > 0) {
            setRecipientType('Kontak');
            setRecipients(details.mailing_domain_contacts);
          } else {
            setRecipientType(null);
            setRecipients([]);
          }

          const currentServerId = details.mail_server_id ? details.mail_server_id[0] : null;
          const firstSuccessfulServer = servers.find((s: MailServerOption) => s.x_studio_last_test_status === 'success');
          if (currentServerId) {
            setMailServerId(currentServerId);
          } else if (firstSuccessfulServer) {
            setMailServerId(firstSuccessfulServer.id);
          } else if (servers.length > 0) {
            setMailServerId(servers[0].id);
          }

        } catch (err) {
          toast.error("Gagal memuat data kampanye.");
          onClose();
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchInitialData();
    }
  }, [campaignData, open, onClose]);

  const handleSaveChanges = async () => {
    if (!campaignData) return false;
    if (!subject.trim() || !bodyHtml.trim()) {
        setError("Subjek dan isi email tidak boleh kosong.");
        return false;
    }
    setIsSubmitting(true);
    setSubmitAction('save');
    setError('');
    try {
      const payload = { 
        subject: subject,
        body_html: bodyHtml,
        mail_server_id: mailServerId ? Number(mailServerId) : null,
      };
      await axios.put(`/marketing/${campaignData.id}`, payload);
      toast.success('Perubahan berhasil disimpan.');
      onSuccess();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal memperbarui kampanye.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendDraft = async () => {
      if (!campaignData) return;
      
      const selectedServer = mailServerOptions.find(s => s.id === mailServerId);
      if (selectedServer && selectedServer.x_studio_last_test_status !== 'success') {
          setError("Server email yang dipilih belum teruji berhasil. Silakan uji koneksi atau pilih server lain.");
          return;
      }
      
      const saveSuccess = await handleSaveChanges();
      if (!saveSuccess) {
          toast.error("Gagal menyimpan perubahan sebelum mengirim.");
          return;
      }
      
      setIsSubmitting(true);
      setSubmitAction('send');
      setError('');
      try {
          const response = await axios.post(`/marketing/${campaignData.id}/send`);
          toast.success(response.data.msg);
          onSuccess();
          onClose();
      } catch (err: any) {
          const errorMessage = err.response?.data?.detail || 'Gagal mengirim kampanye.';
          setError(errorMessage);
          toast.error(errorMessage);
      } finally {
          setIsSubmitting(false);
      }
  };


  const selectedServer = mailServerOptions.find(s => s.id === mailServerId);
  const isFormInvalid = !subject.trim() || !bodyHtml.trim();
  const isSendButtonInvalid = isFormInvalid || (selectedServer && selectedServer.x_studio_last_test_status !== 'success') || recipients.length === 0;
  const isDraft = campaignState === 'draft';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Kampanye Email</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {isLoadingData ? ( <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box> ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}><TextField label="Subjek Email" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth required error={Boolean(error && !subject.trim())} /></Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Penerima</Typography>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: 150, overflowY: 'auto' }}>
                {recipients.length > 0 ? (
                  <List dense disablePadding>
                    {recipients.map(recipient => (
                      <ListItem key={recipient.id} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {recipientType === 'Kontak' ? <IconUser size="1rem" /> : <IconUsers size="1rem" />}
                        </ListItemIcon>
                        <ListItemText primary={recipient.name} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Kampanye ini tidak memiliki penerima. Silakan buat ulang.
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="mail-server-select-label">Server Email</InputLabel>
                <Select labelId="mail-server-select-label" value={mailServerId} label="Server Email" onChange={(e) => setMailServerId(e.target.value)}>
                    {mailServerOptions.length === 0 && <MenuItem value=""><em>Tidak ada server tersedia</em></MenuItem>}
                    {mailServerOptions.map((server) => (
                      <MenuItem key={server.id} value={server.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {server.x_studio_last_test_status === 'success' && <IconCircleCheck size="1rem" color="green" />}
                          {server.x_studio_last_test_status === 'failed' && <IconAlertCircle size="1rem" color="red" />}
                          {(server.x_studio_last_test_status === 'none' || !server.x_studio_last_test_status) && <IconHelpCircle size="1rem" color="gray" />}
                          {server.name}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><RichTextEditor content={bodyHtml} onUpdate={setBodyHtml} label="Isi Email" hasError={Boolean(error && !bodyHtml.trim())} /></Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="secondary">Batal</Button>
        <Box>
            <Button onClick={handleSaveChanges} variant={isDraft ? "outlined" : "contained"} disabled={isLoadingData || isSubmitting || isFormInvalid} sx={{ mr: 1 }}>{isSubmitting && submitAction === 'save' ? <CircularProgress size={24} color="inherit" /> : 'Simpan Perubahan'}</Button>
            {isDraft && ( <Button onClick={handleSendDraft} variant="contained" disabled={isLoadingData || isSubmitting || isSendButtonInvalid}>{isSubmitting && submitAction === 'send' ? <CircularProgress size={24} color="inherit" /> : 'Kirim Sekarang'}</Button> )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditCampaignModal;