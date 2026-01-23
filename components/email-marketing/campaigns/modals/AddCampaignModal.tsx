// components/email-marketing/campaigns/modals/AddCampaignModal.tsx
"use client";

import { useCreateCampaign } from '@/lib/hooks/useCampaigns';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { useSubscribers } from '@/lib/hooks/useSubscribers';
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
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AddCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCampaignModal = ({ open, onClose, onSuccess }: AddCampaignModalProps) => {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [recipientSource, setRecipientSource] = useState<'mailing_list' | 'subscriber'>('mailing_list');
  const [selectedMailingLists, setSelectedMailingLists] = useState<string[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const createMutation = useCreateCampaign();
  const { data: mailingListsData } = useMailingLists();
  const { data: subscribersData, isLoading: isLoadingSubscribers } = useSubscribers();
  const mailingLists = mailingListsData?.data?.mailing_lists || [];
  const subscribers = subscribersData?.data?.contacts || []; // API returns contacts field
  
  // Debug log to see what we're getting
  console.log('Subscribers data:', subscribersData);
  console.log('Subscribers array:', subscribers);

  const handleClose = () => {
    setSubject('');
    setHtmlContent('');
    setRecipientSource('mailing_list');
    setSelectedMailingLists([]);
    setSelectedSubscribers([]);
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

  const handleSubscriberToggle = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId) 
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSubmit = async (action: 'send' | 'draft') => {
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
    if (recipientSource === 'subscriber' && selectedSubscribers.length === 0) {
      setError("Please select at least one subscriber.");
      return;
    }

    setError('');
    
    try {
      await createMutation.mutateAsync({
        recipient_source: recipientSource,
        subject: subject.trim(),
        html_content: htmlContent.trim(),
        action,
        mailing_list_ids: recipientSource === 'mailing_list' ? selectedMailingLists : undefined,
        contact_ids: recipientSource === 'subscriber' ? selectedSubscribers : undefined,
      });
      
      toast.success(action === 'draft' ? 'Campaign saved as draft.' : 'Campaign created and sent!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create campaign.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Campaign</DialogTitle>
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
              onChange={(e) => {
                setRecipientSource(e.target.value as 'mailing_list' | 'subscriber');
                // Clear selections when switching
                setSelectedMailingLists([]);
                setSelectedSubscribers([]);
              }}
            >
              <FormControlLabel value="mailing_list" control={<Radio />} label="Mailing List" />
              <FormControlLabel value="subscriber" control={<Radio />} label="Contact (Subscribers)" />
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

          {recipientSource === 'subscriber' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Subscribers *
              </Typography>
              {isLoadingSubscribers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : subscribers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No subscribers available. Please add subscribers first.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                  {subscribers.map((subscriber) => (
                    <FormControlLabel
                      key={subscriber.id}
                      control={
                        <Checkbox
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onChange={() => handleSubscriberToggle(subscriber.id)}
                        />
                      }
                      label={`${subscriber.email} ${subscriber.name ? `(${subscriber.name})` : ''}`}
                    />
                  ))}
                </Box>
              )}
              {error && selectedSubscribers.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Please select at least one subscriber
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="secondary" disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={() => handleSubmit('draft')} 
            variant="outlined" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <CircularProgress size={24} /> : 'Save as Draft'}
          </Button>
          <Button 
            onClick={() => handleSubmit('send')} 
            variant="contained" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <CircularProgress size={24} /> : 'Create & Send'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddCampaignModal;
