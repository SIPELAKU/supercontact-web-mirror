// components/email-marketing/campaigns/modals/EditCampaignModal.tsx
"use client";

import { useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { Campaign } from '@/lib/types/email-marketing';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface EditCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign: Campaign | null;
}

const EditCampaignModal = ({ open, onClose, onSuccess, campaign }: EditCampaignModalProps) => {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [recipientSource, setRecipientSource] = useState<'mailing_list' | 'contact'>('mailing_list');
  const [selectedMailingLists, setSelectedMailingLists] = useState<string[]>([]);
  const [error, setError] = useState('');

  const updateMutation = useUpdateCampaign();
  const { data: mailingListsData } = useMailingLists();
  const mailingLists = mailingListsData?.data?.mailing_lists || [];

  useEffect(() => {
    if (open && campaign) {
      setSubject(campaign.subject || '');
      setHtmlContent(campaign.html_content || '');
      setRecipientSource('mailing_list');
      setSelectedMailingLists([]);
      setError('');
    }
  }, [open, campaign]);

  const handleClose = () => {
    setSubject('');
    setHtmlContent('');
    setRecipientSource('mailing_list');
    setSelectedMailingLists([]);
    setError('');
    onClose();
  };

  const handleMailingListToggle = (listId: string) => {
    setSelectedMailingLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleSubmit = async (action: 'send' | 'draft') => {
    if (!campaign) return;

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!htmlContent.trim()) {
      setError("Email content is required.");
      return;
    }
    if (recipientSource === 'mailing_list' && selectedMailingLists.length === 0) {
      setError("Please select at least one mailing list.");
      return;
    }

    setError('');
    
    try {
      await updateMutation.mutateAsync({
        campaignId: campaign.id,
        data: {
          recipient_source: recipientSource,
          subject: subject.trim(),
          html_content: htmlContent.trim(),
          action,
          mailing_list_ids: recipientSource === 'mailing_list' ? selectedMailingLists : undefined,
          contact_ids: recipientSource === 'contact' ? [] : undefined,
        }
      });
      
      toast.success(action === 'draft' ? 'Campaign updated and saved as draft.' : 'Campaign updated and sent!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update campaign.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (open && !campaign) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Campaign</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning">Campaign data not found.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Campaign</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
            error={Boolean(error && !subject.trim())}
            helperText={error && !subject.trim() ? "Subject is required" : ""}
          />
          
          <TextField
            label="Email Content (HTML)"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            fullWidth
            required
            multiline
            rows={10}
            error={Boolean(error && !htmlContent.trim())}
            helperText={error && !htmlContent.trim() ? "Content is required" : "You can use HTML tags"}
            placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">Recipient Source</FormLabel>
            <RadioGroup
              value={recipientSource}
              onChange={(e) => setRecipientSource(e.target.value as 'mailing_list' | 'contact')}
            >
              <FormControlLabel value="mailing_list" control={<Radio />} label="Mailing List" />
              <FormControlLabel value="contact" control={<Radio />} label="Contact" disabled />
            </RadioGroup>
          </FormControl>

          {recipientSource === 'mailing_list' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Mailing Lists *
              </Typography>
              {mailingLists.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No mailing lists available. Please create one first.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                  {mailingLists.map((list) => (
                    <FormControlLabel
                      key={list.id}
                      control={
                        <Checkbox
                          checked={selectedMailingLists.includes(list.id)}
                          onChange={() => handleMailingListToggle(list.id)}
                        />
                      }
                      label={`${list.name} (${list.subscriber_count} subscribers)`}
                    />
                  ))}
                </Box>
              )}
              {error && selectedMailingLists.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Please select at least one mailing list
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="secondary" disabled={updateMutation.isPending}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={() => handleSubmit('draft')} 
            variant="outlined" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Save as Draft'}
          </Button>
          <Button 
            onClick={() => handleSubmit('send')} 
            variant="contained" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Update & Send'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditCampaignModal;
