// components/email-marketing/campaigns/modals/EditCampaignModal.tsx
"use client";

import { useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { useSubscribers } from '@/lib/hooks/useSubscribers';
import { Campaign } from '@/lib/types/email-marketing';
import {
  Alert,
  Box,
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
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useEffect, useState, useRef } from 'react';
import { notify } from '@/lib/notifications';
import EmailTabbedEditor, { EmailTabbedEditorRef } from '../EmailTabbedEditor';

interface EditCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign: Campaign | null;
}

const EditCampaignModal = ({ open, onClose, onSuccess, campaign }: EditCampaignModalProps) => {
  const editorRef = useRef<EmailTabbedEditorRef>(null);
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [recipientSource, setRecipientSource] = useState<'mailing_list' | 'subscriber'>('mailing_list');
  const [selectedMailingLists, setSelectedMailingLists] = useState<string[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const updateMutation = useUpdateCampaign();
  const { data: mailingListsData } = useMailingLists();
  const { data: subscribersData, isLoading: isLoadingSubscribers } = useSubscribers();
  const mailingLists = mailingListsData?.data?.mailing_lists || [];
  const subscribers = subscribersData?.data?.contacts || [];

  useEffect(() => {
    if (open && campaign) {
      setSubject(campaign.subject || '');
      setHtmlContent(campaign.html_content || '');
      setRecipientSource(campaign.recipient_source as 'mailing_list' | 'subscriber' || 'mailing_list');
      setSelectedMailingLists([]);
      setSelectedSubscribers([]);
      setError('');
    }
  }, [open, campaign]);

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
    if (!campaign) return;

    // Export content from Visual Builder before submission
    if (editorRef.current) {
      await editorRef.current.exportContent();
    }

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
      await updateMutation.mutateAsync({
        campaignId: campaign.id,
        data: {
          recipient_source: recipientSource,
          subject: subject.trim(),
          html_content: htmlContent.trim(),
          action,
          mailing_list_ids: recipientSource === 'mailing_list' ? selectedMailingLists : undefined,
          contact_ids: recipientSource === 'subscriber' ? selectedSubscribers : undefined,
        }
      });

      notify.success(action === 'draft' ? 'Campaign updated and saved as draft.' : 'Campaign updated and sent!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update campaign.';
      setError(errorMessage);
      notify.error(errorMessage);
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
          <AppButton onClick={handleClose} variantStyle="outline" color="gray">Close</AppButton>
        </DialogActions>
      </Dialog>
    );
  }

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  return (
    <Dialog open={open} onClose={() => setShowCloseConfirmation(true)} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Campaign</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <label htmlFor="email-subject">Email Subject</label>
            <AppInput
              isBgWhite
              placeholder='Enter email subject'
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              required
              error={Boolean(error && !subject.trim())}
              helperText={error && !subject.trim() ? "Subject is required" : ""}
            />
          </Box>

          <Box>
            <EmailTabbedEditor
              ref={editorRef}
              value={htmlContent}
              onChange={(html) => setHtmlContent(html)}
              isLoading={updateMutation.isPending}
            />
            {error && !htmlContent.trim() && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Content is required
              </Typography>
            )}
          </Box>

          <FormControl component="fieldset">
            <FormLabel component="legend">Recipient Source</FormLabel>
            <RadioGroup
              value={recipientSource}
              onChange={(e) => {
                setRecipientSource(e.target.value as 'mailing_list' | 'subscriber');
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
        <AppButton
          onClick={() => {
            setSubject('');
            setHtmlContent('');
            setRecipientSource('mailing_list');
            setSelectedMailingLists([]);
            setSelectedSubscribers([]);
            setError('');
            onClose();
          }}
          color="gray"
          variantStyle="outline"
          disabled={updateMutation.isPending}
        >
          Cancel
        </AppButton>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <AppButton
            onClick={() => handleSubmit('draft')}
            variantStyle="outline"
            isLoading={updateMutation.isPending}
          >
            Save as Draft
          </AppButton>
          <AppButton
            onClick={() => handleSubmit('send')}
            variantStyle="primary"
            isLoading={updateMutation.isPending}
          >
            Update & Send
          </AppButton>
        </Box>
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
        variant="danger"
      />
    </Dialog>
  );
};

export default EditCampaignModal;
