// components/email-marketing/campaigns/modals/AddCampaignModal.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { useCreateCampaign } from '@/lib/hooks/useCampaigns';
import { useMailingLists } from '@/lib/hooks/useMailingLists';
import { useSubscribers } from '@/lib/hooks/useSubscribers';
import { useMailServers } from '@/lib/hooks/useMailServers';
import RecipientSourceSelector from './RecipientSourceSelector';
import { CAMPAIGN_ERROR_MESSAGES } from '@/lib/constants/campaign';
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
  Typography,
  InputAdornment,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import { useState, useRef, useMemo } from 'react';
import { Search, Users, User, CheckCircle2, Maximize2, Minimize2, X } from 'lucide-react';
import { notify } from '@/lib/notifications';
import { ApiErrorDisplay } from '@/components/ui/api-error-display';
import EmailTabbedEditor, { EmailTabbedEditorRef } from '../EmailTabbedEditor';
import { IconButton } from '@mui/material';

interface AddCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCampaignModal = ({ open, onClose, onSuccess }: AddCampaignModalProps) => {
  const editorRef = useRef<EmailTabbedEditorRef>(null);
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [recipientSource, setRecipientSource] = useState<'mailing_list' | 'subscriber'>('mailing_list');
  const [selectedMailingLists, setSelectedMailingLists] = useState<string[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [selectedSmtp, setSelectedSmtp] = useState<string>('');
  const [error, setError] = useState<string | any[] | null>(null);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberLimit] = useState(10);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [mailingListSearch, setMailingListSearch] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const createMutation = useCreateCampaign();
  const { data: mailingListsData } = useMailingLists();
  const { data: subscribersData, isLoading: isLoadingSubscribers } = useSubscribers(subscriberPage, subscriberLimit, subscriberSearch);
  const { data: mailServersData, isLoading: isLoadingMailServers } = useMailServers(1, 100);

  const mailingLists = mailingListsData?.data?.mailing_lists || [];
  const subscribers = subscribersData?.data?.contacts || []; // API returns contacts field
  const mailServers = mailServersData?.data?.mail_servers || [];
  const totalSubscribers = subscribersData?.data?.total || 0;
  const totalSubscriberPages = Math.ceil(totalSubscribers / subscriberLimit);

  const handleClose = () => {
    setSubject('');
    setHtmlContent('');
    setRecipientSource('mailing_list');
    setSelectedMailingLists([]);
    setSelectedSubscribers([]);
    setSelectedSmtp('');
    setError('');
    setMailingListSearch('');
    setSubscriberSearch('');
    setIsFullScreen(false);
    setIsFocusMode(false);
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

  const filteredMailingLists = useMemo(() => {
    if (!mailingListSearch.trim()) return mailingLists;
    return mailingLists.filter(list =>
      list.name.toLowerCase().includes(mailingListSearch.toLowerCase())
    );
  }, [mailingLists, mailingListSearch]);

  const handleSelectAllMailingLists = () => {
    if (selectedMailingLists.length === filteredMailingLists.length && filteredMailingLists.length > 0) {
      setSelectedMailingLists([]);
    } else {
      setSelectedMailingLists(filteredMailingLists.map(l => l.id));
    }
  };

  const handleSelectAllSubscribers = () => {
    if (selectedSubscribers.length === subscribers.length && subscribers.length > 0) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s.id));
    }
  };

  const handleSubmit = async (action: 'send' | 'draft') => {
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
      setError(CAMPAIGN_ERROR_MESSAGES.SUBJECT_REQUIRED);
      return;
    }

    if (action === 'send') {
      if (!selectedSmtp) {
        setError(CAMPAIGN_ERROR_MESSAGES.SENDER_REQUIRED);
        return;
      }
      if (!finalHtmlContent.trim()) {
        setError(CAMPAIGN_ERROR_MESSAGES.CONTENT_REQUIRED);
        return;
      }
      if (recipientSource === 'mailing_list' && selectedMailingLists.length === 0) {
        setError(CAMPAIGN_ERROR_MESSAGES.MAILING_LIST_REQUIRED);
        return;
      }
      if (recipientSource === 'subscriber' && selectedSubscribers.length === 0) {
        setError(CAMPAIGN_ERROR_MESSAGES.SUBSCRIBER_REQUIRED);
        return;
      }
    }

    setError('');

    try {
      await createMutation.mutateAsync({
        recipient_source: action === 'send' ? recipientSource : (recipientSource || undefined),
        editor_type: currentEditorType,
        subject: subject.trim(),
        html_content: action === 'send' ? finalHtmlContent.trim() : (finalHtmlContent?.trim() || undefined),
        action,
        mailing_list_ids: recipientSource === 'mailing_list' && selectedMailingLists.length > 0 ? selectedMailingLists : undefined,
        contact_ids: recipientSource === 'subscriber' && selectedSubscribers.length > 0 ? selectedSubscribers : undefined,
        mail_server_id: selectedSmtp || undefined,
      });

      notify.success(action === 'draft' ? 'Campaign saved as draft.' : 'Campaign created and sent!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        setError(err.details);
        notify.error('Validation failed', {
          description: <ApiErrorDisplay errors={err.details} />
        });
      } else {
        const errorMessage = typeof err.message === 'string' ? err.message.replace(/_/g, " ") : (err.message || 'Failed to create campaign.');
        setError(errorMessage);
        notify.error(errorMessage);
      }
    }
  };

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={() => setShowCloseConfirmation(true)}
      maxWidth="lg"
      fullWidth
      fullScreen={isFullScreen}
      sx={{
        '& .MuiDialog-paper': isFocusMode ? {
          margin: 0,
          maxHeight: '100vh',
          height: '100vh',
          borderRadius: 0
        } : {}
      }}
    >
      {!isFocusMode && (
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Create New Campaigns
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              aria-label="fullscreen"
              onClick={() => setIsFullScreen(!isFullScreen)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </IconButton>
            <IconButton
              aria-label="close"
              onClick={() => setShowCloseConfirmation(true)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      <DialogContent dividers={!isFocusMode} sx={{ 
        p: isFocusMode ? 0 : 3, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: isFocusMode ? 'hidden' : 'auto',
        bgcolor: isFocusMode ? '#f8fafc' : 'background.paper',
        flex: 1
      }}>
        {!isFocusMode && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? (
              error
            ) : (
              <div className="text-black">
                <p className="font-bold">Please fix the following errors:</p>
                <ApiErrorDisplay errors={error} maxHeight="150px" />
              </div>
            )}
          </Alert>
        )}
        <Stack spacing={isFocusMode ? 0 : 3} sx={{ mt: 0, flex: 1, minHeight: 0 }}>
          {!isFocusMode && (
            <>
            <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              SMTP
            </Typography>
            <AppSelect
              placeholder={isLoadingMailServers ? "Loading mail servers..." : "Select SMTP"}
              value={selectedSmtp}
              onChange={(e) => setSelectedSmtp(e.target.value as string)}
              options={mailServers.map(server => ({
                value: server.id,
                label: `${server.name} (${server.from_email})`
              }))}
              isBgWhite
              error={Boolean(typeof error === 'string' && error.includes("SMTP") && !selectedSmtp)}
              helperText={typeof error === 'string' && error.includes("SMTP") && !selectedSmtp ? "SMTP server is required" : ""}
            />
            <Alert severity="info" sx={{ mt: 1.5, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
              Advanced tracking features such as delivery confirmation, open rates, click-through tracking, and bounce reporting are not available.
            </Alert>
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
              error={Boolean(typeof error === 'string' && error.includes("Subject") && !subject.trim())}
              helperText={typeof error === 'string' && error.includes("Subject") && !subject.trim() ? "Subject is required" : ""}
            />
          </Box>
            </>
          )}

          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: isFocusMode ? 'auto' : 600,
            height: isFocusMode ? '100%' : 'auto',
            overflow: isFocusMode ? 'hidden' : 'visible'
          }}>
            {isFocusMode ? (
              <Box sx={{ 
                p: 1.5, 
                px: 3,
                bgcolor: 'white', 
                borderBottom: '1px solid #e5e7eb', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                   <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: -0.5 }}>
                        CAMPAIGN SUBJECT
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {subject || '(No Subject)'}
                      </Typography>
                   </Box>
                   <Box sx={{ width: '1px', height: 32, bgcolor: '#e5e7eb' }} />
                   <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: -0.5 }}>
                        SMTP SERVER
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {mailServers.find(s => s.id === selectedSmtp)?.name || 'Not selected'}
                      </Typography>
                   </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                   <AppButton size="small" variantStyle="outline" onClick={() => handleSubmit('draft')} isLoading={createMutation.isPending}>
                      Save as Draft
                   </AppButton>
                   <AppButton size="small" variantStyle="primary" onClick={() => handleSubmit('send')} isLoading={createMutation.isPending}>
                      Create & Send
                   </AppButton>
                   <Box sx={{ width: '1px', height: 24, bgcolor: '#e5e7eb', mx: 0.5 }} />
                   <IconButton 
                    size="small" 
                    onClick={() => setIsFocusMode(false)}
                    sx={{ color: 'text.secondary', border: '1px solid #e5e7eb' }}
                   >
                      <Minimize2 size={18}/>
                   </IconButton>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                  Email Content
                </Typography>
                <Tooltip title="Focus Mode hides other fields to give you more room for editing">
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => {
                      setIsFocusMode(true);
                      setIsFullScreen(true);
                    }}
                    startIcon={<Maximize2 size={14}/>}
                    sx={{ textTransform: 'none', borderRadius: '6px' }}
                  >
                    Focus Mode
                  </Button>
                </Tooltip>
              </Box>
            )}
            <EmailTabbedEditor
              ref={editorRef}
              value={htmlContent}
              onChange={(html) => setHtmlContent(html)}
              isLoading={createMutation.isPending}
              height={isFocusMode ? "100%" : "600px"}
            />
            {!isFocusMode && typeof error === 'string' && error.includes("Email content") && !htmlContent.trim() && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Content is required
              </Typography>
            )}
          </Box>

          {!isFocusMode && (
            <>
          <RecipientSourceSelector
            value={recipientSource}
            onChange={(value) => {
              setRecipientSource(value);
              setSelectedMailingLists([]);
              setSelectedSubscribers([]);
            }}
          />

          {recipientSource === 'mailing_list' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Select Mailing Lists
                </Typography>
                {mailingLists.length > 0 && (
                  <Button
                    size="small"
                    onClick={handleSelectAllMailingLists}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {selectedMailingLists.length === filteredMailingLists.length && filteredMailingLists.length > 0 ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </Box>

              {mailingLists.length > 0 && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search mailing lists..."
                  value={mailingListSearch}
                  onChange={(e) => setMailingListSearch(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="w-4 h-4 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {mailingLists.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb', borderStyle: 'dashed' }}>
                  <Typography variant="body2" color="text.secondary">
                    No mailing lists available. Please create one first.
                  </Typography>
                </Paper>
              ) : filteredMailingLists.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No mailing lists found matching "{mailingListSearch}"
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                  <Grid container spacing={1.5}>
                    {filteredMailingLists.map((list) => {
                      const isSelected = selectedMailingLists.includes(list.id);
                      return (
                        <Grid item xs={12} sm={6} key={list.id}>
                          <Paper
                            variant="outlined"
                            onClick={() => handleMailingListToggle(list.id)}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              transition: 'all 0.2s',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected ? 'primary.50' : 'background.paper',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: isSelected ? 'primary.50' : '#f8fafc',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                              }
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              sx={{ p: 0 }}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => handleMailingListToggle(list.id)}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                                {list.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                <Users className="w-3 h-3 text-gray-400" />
                                <Typography variant="caption" color="text.secondary">
                                  {list.subscriber_count.toLocaleString()} subscribers
                                </Typography>
                              </Box>
                            </Box>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
              {typeof error === 'string' && error.toLowerCase().includes("mailing list") && selectedMailingLists.length === 0 && (
                <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                  Please select at least one mailing list
                </Alert>
              )}
            </Box>
          )}

          {recipientSource === 'subscriber' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Select Subscribers
                </Typography>
                {subscribers.length > 0 && (
                  <Button
                    size="small"
                    onClick={handleSelectAllSubscribers}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {selectedSubscribers.length === subscribers.length && subscribers.length > 0 ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </Box>

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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="w-4 h-4 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
              {isLoadingSubscribers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : subscribers.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb', borderStyle: 'dashed' }}>
                  <Typography variant="body2" color="text.secondary">
                    {subscriberSearch ? `No subscribers found matching "${subscriberSearch}"` : 'No subscribers available. Please add subscribers first.'}
                  </Typography>
                </Paper>
              ) : (
                <>
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                    <Grid container spacing={1.5}>
                      {subscribers.map((subscriber) => {
                        const isSelected = selectedSubscribers.includes(subscriber.id);
                        return (
                          <Grid item xs={12} sm={6} key={subscriber.id}>
                            <Paper
                              variant="outlined"
                              onClick={() => handleSubscriberToggle(subscriber.id)}
                              sx={{
                                p: 1.5,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                transition: 'all 0.2s',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                bgcolor: isSelected ? 'primary.50' : 'background.paper',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: isSelected ? 'primary.50' : '#f8fafc',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                sx={{ p: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => handleSubscriberToggle(subscriber.id)}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                                  {subscriber.email}
                                </Typography>
                                {subscriber.name && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                    <User className="w-3 h-3 text-gray-400" />
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {subscriber.name}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
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
              {typeof error === 'string' && error.toLowerCase().includes("subscriber") && selectedSubscribers.length === 0 && (
                <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                  Please select at least one subscriber
                </Alert>
              )}
            </Box>
          )}
        </>
      )}
        </Stack>
      </DialogContent>
      {!isFocusMode && (
        <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
          <AppButton
            onClick={() => {
              setSubject('');
              setHtmlContent('');
              setRecipientSource('mailing_list');
              setSelectedMailingLists([]);
              setSelectedSubscribers([]);
              setSelectedSmtp('');
              setError('');
              onClose();
            }}
            color="gray"
            variantStyle="outline"
            isLoading={createMutation.isPending}
          >
            Cancel
          </AppButton>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <AppButton
              onClick={() => handleSubmit('draft')}
              variantStyle="outline"
              isLoading={createMutation.isPending}
            >
              Save as Draft
            </AppButton>
            <AppButton
              onClick={() => handleSubmit('send')}
              variantStyle="primary"
              isLoading={createMutation.isPending}
            >
              Create & Send
            </AppButton>
          </Box>
        </DialogActions>
      )}

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

export default AddCampaignModal;
