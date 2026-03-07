// components/email-marketing/campaigns/modals/EditCampaignModal.tsx
"use client";

import { useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { useSubscribers } from '@/lib/hooks/useSubscribers';
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
  Pagination,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useEffect, useState, useRef } from 'react';
import { notify } from '@/lib/notifications';
import EmailTabbedEditor, { EmailTabbedEditorRef } from '../EmailTabbedEditor';
import { useMailSenders } from '@/lib/hooks/useMailSenders';
import AddMailSenderDialog from './AddMailSenderDialog';
import MailSenderManager from './MailSenderManager';

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
  const [selectedMailSender, setSelectedMailSender] = useState<string>('');
  const [error, setError] = useState('');
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberLimit] = useState(10);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  const updateMutation = useUpdateCampaign();
  const { data: mailingListsData } = useMailingLists();
  const { data: subscribersData, isLoading: isLoadingSubscribers } = useSubscribers(subscriberPage, subscriberLimit, subscriberSearch);
  const { data: mailSendersData, isLoading: isLoadingMailSenders } = useMailSenders();

  const mailingLists = mailingListsData?.data?.mailing_lists || [];
  const subscribers = subscribersData?.data?.contacts || [];
  const mailSenders = mailSendersData?.data?.mail_senders || [];
  const totalSubscribers = subscribersData?.data?.total || 0;
  const totalSubscriberPages = Math.ceil(totalSubscribers / subscriberLimit);

  const [isAddMailSenderOpen, setIsAddMailSenderOpen] = useState(false);

  useEffect(() => {
    if (open && campaign) {
      setSubject(campaign.subject || '');
      setHtmlContent(campaign.html_content || '');
      setRecipientSource(campaign.recipient_source as 'mailing_list' | 'subscriber' || 'mailing_list');
      setSelectedMailSender(campaign.mail_sender_id || '');
      setSelectedMailingLists(campaign.mailing_list_ids || []);
      setSelectedSubscribers(campaign.contact_ids || []);
      setError('');
    }
  }, [open, campaign]);

  const handleClose = () => {
    setSubject('');
    setHtmlContent('');
    setRecipientSource('mailing_list');
    setSelectedMailingLists([]);
    setSelectedSubscribers([]);
    setSelectedMailSender('');
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
    let finalHtmlContent = htmlContent;
    if (editorRef.current) {
      const result = await editorRef.current.exportContent();
      if (result && result.html) {
        finalHtmlContent = result.html;
      }
    }

    const currentEditorType = editorRef.current?.getEditorType() || 'simple_editor';

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (action === 'send') {
      if (!selectedMailSender) {
        setError("Please select a Mail Sender.");
        return;
      }
      if (!finalHtmlContent.trim()) {
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
    }

    setError('');

    try {
      await updateMutation.mutateAsync({
        campaignId: campaign.id,
        data: {
          recipient_source: action === 'send' ? recipientSource : (recipientSource || undefined),
          editor_type: currentEditorType,
          subject: subject.trim(),
          html_content: action === 'send' ? finalHtmlContent.trim() : (finalHtmlContent?.trim() || undefined),
          action,
          mailing_list_ids: recipientSource === 'mailing_list' && selectedMailingLists.length > 0 ? selectedMailingLists : undefined,
          contact_ids: recipientSource === 'subscriber' && selectedSubscribers.length > 0 ? selectedSubscribers : undefined,
          mail_sender_id: selectedMailSender || undefined,
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                Mail Sender
              </Typography>
              <AppButton
                size="small"
                onClick={() => setIsAddMailSenderOpen(true)}
                variantStyle="text"
                color="primary"
              >
                + Add New Mail Sender
              </AppButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <AppSelect
                  placeholder={isLoadingMailSenders ? "Loading mail senders..." : "Select Mail Sender"}
                  value={selectedMailSender}
                  onChange={(e) => setSelectedMailSender(e.target.value as string)}
                  options={mailSenders.map(sender => ({
                    value: sender.id,
                    label: `${sender.name} (${sender.email})`
                  }))}
                  isBgWhite
                  error={Boolean(error && error.includes("Mail Sender") && !selectedMailSender)}
                  helperText={error && error.includes("Mail Sender") && !selectedMailSender ? "Mail sender is required" : ""}
                />
              </Box>
              {selectedMailSender && mailSenders.find(s => s.id === selectedMailSender) && (
                <MailSenderManager
                  mailSenderId={selectedMailSender}
                  mailSenderName={mailSenders.find(s => s.id === selectedMailSender)!.name}
                  mailSenderEmail={mailSenders.find(s => s.id === selectedMailSender)!.email}
                  onDelete={() => setSelectedMailSender('')}
                />
              )}
            </Box>
          </Box>

          <Box>
            <label htmlFor="email-subject">Email Subject</label>
            <AppInput
              isBgWhite
              placeholder='Enter email subject'
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              error={Boolean(error && error.includes("Subject") && !subject.trim())}
              helperText={error && error.includes("Subject") && !subject.trim() ? "Subject is required" : ""}
            />
          </Box>

          <Box>
            <EmailTabbedEditor
              ref={editorRef}
              defaultEditorType={campaign?.editor_type as 'simple_editor' | 'visual_builder' | undefined}
              value={htmlContent}
              onChange={(html) => setHtmlContent(html)}
              isLoading={updateMutation.isPending}
            />
            {error && error.includes("Email content") && !htmlContent.trim() && (
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
                Select Mailing Lists
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
              {error && error.toLowerCase().includes("mailing list") && selectedMailingLists.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Please select at least one mailing list
                </Typography>
              )}
            </Box>
          )}

          {recipientSource === 'subscriber' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Subscribers
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search subscribers by email or name..."
                value={subscriberSearch}
                onChange={(e) => {
                  setSubscriberSearch(e.target.value);
                  setSubscriberPage(1); // Reset to first page on search
                }}
                sx={{ mb: 2 }}
              />
              {isLoadingSubscribers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : subscribers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {subscriberSearch ? 'No subscribers found matching your search.' : 'No subscribers available. Please add subscribers first.'}
                </Typography>
              ) : (
                <>
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
                  {totalSubscriberPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Pagination
                        count={totalSubscriberPages}
                        page={subscriberPage}
                        onChange={(e, page) => setSubscriberPage(page)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  )}
                </>
              )}
              {error && error.toLowerCase().includes("subscriber") && selectedSubscribers.length === 0 && (
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
            setSelectedMailSender('');
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
      <AddMailSenderDialog
        open={isAddMailSenderOpen}
        onClose={() => setIsAddMailSenderOpen(false)}
        onSuccess={(sender) => {
          setSelectedMailSender(sender.id);
        }}
      />
    </Dialog>
  );
};

export default EditCampaignModal;
