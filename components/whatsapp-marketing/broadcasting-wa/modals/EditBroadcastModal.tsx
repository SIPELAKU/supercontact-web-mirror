"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Alert,
  Divider,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { AppAutocomplete } from '@/components/ui/app-autocomplete';
import { useUpdateBroadcast } from '@/lib/hooks/useBroadcasts';
import { useBroadcastTemplates, useBroadcastTemplateDetail } from '@/lib/hooks/useBroadcastTemplates';
import { useWaRecipients } from '@/lib/hooks/useWaRecipients';
import { useGroupBroadcasts } from '@/lib/hooks/useGroupBroadcasts';
import { useAccounts } from '@/lib/hooks/useOmnichannel';
import { notify } from '@/lib/notifications';
import { BroadcastCampaign, WaRecipient, GroupBroadcast, BroadcastTemplateType, UpdateBroadcastData } from '@/lib/types/whatsapp-marketing';
import MessagePreview from '../../templates/create/MessagePreview';
import AccountSelect from '@/components/omnichannel/AccountSelect';

interface EditBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  broadcast: BroadcastCampaign | null;
}

export default function EditBroadcastModal({ open, onClose, broadcast }: EditBroadcastModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [recipientSource, setRecipientSource] = useState<'recipient' | 'broadcast_group'>('recipient');
  const [selectedContacts, setSelectedContacts] = useState<WaRecipient[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<GroupBroadcast[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, any>>({});

  // API Hooks
  const updateMutation = useUpdateBroadcast();
  const { data: waAccounts } = useAccounts('whatsapp');
  const accounts = waAccounts || [];
  // Templates belong to a specific WhatsApp account - wait for a resolved
  // account before fetching so companies with 2+ accounts don't hit the
  // backend's "specify account_id" 400 with an empty picker still showing.
  const { data: templatesData, isLoading: isLoadingTemplates } = useBroadcastTemplates(
    { page: 1, limit: 100, account_id: accountId || undefined },
    { enabled: !!accountId }
  );
  const { data: templateDetailData, isLoading: isLoadingTemplateDetail } = useBroadcastTemplateDetail(templateId);
  const { data: recipientsData, isLoading: isLoadingRecipients } = useWaRecipients({ recipient_type: 'whatsapp', page: 1, limit: 1000 });
  const { data: groupsData, isLoading: isLoadingGroups } = useGroupBroadcasts({ page: 1, limit: 1000 });

  const templates = templatesData?.data?.templates || [];
  const allContacts = recipientsData?.data?.recipients || [];
  const allGroups = groupsData?.data?.broadcast_groups || [];
  const selectedTemplate = templateDetailData?.data;

  // Initialize form with broadcast data
  useEffect(() => {
    if (open && broadcast) {
      setName(broadcast.name || '');
      setAccountId(broadcast.account_id || '');
      setTemplateId(broadcast.template_id || '');
      setRecipientSource(broadcast.recipient_source || 'recipient');
      setVariables(broadcast.variables || {});
      
      // Map IDs to full objects once data is loaded
      if (allContacts.length > 0 && broadcast.contact_ids) {
        const matched = allContacts.filter(c => broadcast.contact_ids?.includes(c.id));
        setSelectedContacts(matched);
      }
      
      if (allGroups.length > 0 && broadcast.broadcast_group_ids) {
        const matched = allGroups.filter(g => broadcast.broadcast_group_ids?.includes(g.id));
        setSelectedGroups(matched);
      }
    }
  }, [open, broadcast, allContacts, allGroups]);

  // Identify variables from template content
  const templateVariables = useMemo(() => {
    if (!selectedTemplate) return [];
    const bodyStr = JSON.stringify(selectedTemplate.types);
    const matches = bodyStr.match(/{{(\d+)}}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.replace(/[{}]/g, '')))).sort((a, b) => parseInt(a) - parseInt(b));
  }, [selectedTemplate]);

  // Sync variables state with template requirements
  useEffect(() => {
    if (templateVariables.length > 0) {
      setVariables(prev => {
        const nextVars = { ...prev };
        templateVariables.forEach(v => {
          if (nextVars[v] === undefined) {
            nextVars[v] = '';
          }
        });
        return nextVars;
      });
    }
  }, [templateVariables]);

  const handleClose = () => {
    setError(null);
    setValidationErrors({});
    onClose();
  };

  const validateForm = (action: 'send' | 'draft') => {
    if (!name.trim()) return 'Broadcast name is required';
    if (accounts.length > 1 && !accountId) return 'Choose which WhatsApp account this broadcast sends from';
    if (recipientSource === 'recipient' && selectedContacts.length === 0) return 'At least one contact must be selected';
    if (recipientSource === 'broadcast_group' && selectedGroups.length === 0) return 'At least one broadcast group must be selected';

    if (action === 'send') {
      if (!templateId) return 'Template is required for sending';
      if (selectedTemplate && selectedTemplate.whatsapp_approval_status !== 'Approved') {
        return `This template's WhatsApp approval status is '${selectedTemplate.whatsapp_approval_status}', not 'Approved' - it cannot be sent yet.`;
      }
      for (const v of templateVariables) {
        if (!variables[v]?.trim()) {
          return `Variable {{${v}}} is required`;
        }
        if (variables[v].includes('{{') && !variables[v].includes('||')) {
          return `Variable {{${v}}} contains a placeholder but is missing a default value (e.g. ||Guest)`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (action: 'send' | 'draft') => {
    if (!broadcast) return;

    const errorMsg = validateForm(action);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setError(null);
    setValidationErrors({});

    const payload: UpdateBroadcastData = {
      name: name.trim(),
      account_id: accountId || undefined,
      template_id: templateId || null,
      action,
      recipient_source: recipientSource,
      contact_ids: recipientSource === 'recipient' ? selectedContacts.map(c => c.id) : [],
      broadcast_group_ids: recipientSource === 'broadcast_group' ? selectedGroups.map(g => g.id) : [],
      variables: variables,
    };

    try {
      await updateMutation.mutateAsync({ id: broadcast.id, data: payload });
      notify.success(`Broadcast "${name}" updated successfully.`);
      handleClose();
    } catch (err: any) {
      if (err.data?.error?.code === 'TEMPLATE_VARIABLES_INVALID') {
        setValidationErrors(err.data.error.details || {});
        setError('Some template variables are invalid. Please check the fields below.');
      } else {
        setError(err.message || 'Failed to update broadcast');
      }
    }
  };

  const activeType = selectedTemplate ? (Object.keys(selectedTemplate.types)[0] as BroadcastTemplateType) : null;
  const activeTemplateData = selectedTemplate && activeType ? selectedTemplate.types[activeType] : null;

  const previewData = useMemo(() => {
    if (!activeTemplateData) return null;
    const data = JSON.parse(JSON.stringify(activeTemplateData));

    const replaceVars = (text: string) => {
      if (!text || typeof text !== 'string') return text;
      let result = text;
      templateVariables.forEach(v => {
        const val = variables[v]?.trim();
        if (val) {
          result = result.split(`{{${v}}}`).join(val);
        }
      });
      return result;
    };

    if (data.body) data.body = replaceVars(data.body);
    if (data.media && data.media[0]) data.media[0] = replaceVars(data.media[0]);
    if (data.actions) {
      data.actions = data.actions.map((act: any) => ({
        ...act,
        title: replaceVars(act.title),
        url: replaceVars(act.url)
      }));
    }
    if (data.fallback_text) data.fallback_text = replaceVars(data.fallback_text);

    return data;
  }, [activeTemplateData, variables, templateVariables]);

  if (!broadcast) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit WhatsApp Broadcast</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4} sx={{ mt: 0 }}>
          <Grid item xs={12} lg={selectedTemplate ? 7 : 12}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <AppInput
                    label="Broadcast Name"
                    required
                    isBgWhite
                    fullWidth
                    placeholder="e.g. Ramadan Promotion 2024"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                {accounts.length > 1 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Send From <span className="text-red-500">*</span>
                    </Typography>
                    <AccountSelect
                      accounts={accounts}
                      value={accountId}
                      onChange={(id) => {
                        setAccountId(id);
                        setTemplateId('');
                      }}
                      placeholder="Choose a WhatsApp account"
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Select Template {isLoadingTemplateDetail && <CircularProgress size={16} sx={{ ml: 1 }} />}
                  </Typography>
                  <AppSelect
                    isBgWhite
                    fullWidth
                    value={templateId}
                    onChange={(e) => {
                      setTemplateId(e.target.value as string);
                      setValidationErrors({});
                    }}
                    options={templates.map(t => ({
                      value: t.id,
                      label: t.whatsapp_approval_status === 'Approved'
                        ? `${t.friendly_name} (${t.language})`
                        : `${t.friendly_name} (${t.language}) — ${t.whatsapp_approval_status}`,
                      disabled: t.whatsapp_approval_status !== 'Approved',
                    }))}
                    placeholder={
                      !accountId
                        ? "Choose an account first"
                        : isLoadingTemplates ? "Loading templates..." : "Choose a template"
                    }
                    disabled={isLoadingTemplates || !accountId}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                  Audience Selection <span className="text-red-500">*</span>
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <AppButton
                    variantStyle={recipientSource === 'recipient' ? 'primary' : 'outline'}
                    onClick={() => setRecipientSource('recipient')}
                    size="small"
                  >
                    Individual Contacts
                  </AppButton>
                  <AppButton
                    variantStyle={recipientSource === 'broadcast_group' ? 'primary' : 'outline'}
                    onClick={() => setRecipientSource('broadcast_group')}
                    size="small"
                  >
                    Broadcast Groups
                  </AppButton>
                </Stack>

                {recipientSource === 'recipient' ? (
                  <AppAutocomplete
                    multiple
                    options={allContacts}
                    getOptionLabel={(option: string | WaRecipient) => typeof option === 'string' ? option : `${option.name} (${option.phone_number})`}
                    value={selectedContacts}
                    onChange={(_, newValue) => setSelectedContacts(newValue as WaRecipient[])}
                    placeholder={isLoadingRecipients ? "Loading contacts..." : "Search and select contacts..."}
                    isBgWhite
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={typeof option === 'string' ? option : (option as WaRecipient).name}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                ) : (
                  <AppAutocomplete
                    multiple
                    options={allGroups}
                    getOptionLabel={(option: string | GroupBroadcast) => typeof option === 'string' ? option : `${option.name} (${option.recipient_count} recipients)`}
                    value={selectedGroups}
                    onChange={(_, newValue) => setSelectedGroups(newValue as GroupBroadcast[])}
                    placeholder={isLoadingGroups ? "Loading groups..." : "Search and select groups..."}
                    isBgWhite
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={typeof option === 'string' ? option : (option as GroupBroadcast).name}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                )}
              </Box>

              {(templateId && templateVariables.length > 0) && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                      Template Variables Mapping
                    </Typography>
                    {isLoadingTemplateDetail ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="caption">Fetching variable requirements...</Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {templateVariables.map(v => (
                          <Grid item xs={12} key={v}>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                              Variable &#123;&#123;{v}&#125;&#125;
                            </Typography>
                            <AppInput
                              fullWidth
                              size="small"
                              placeholder="Static text or {{contact.name||Guest}}"
                              value={variables[v] || ''}
                              onChange={(e) => setVariables({ ...variables, [v]: e.target.value })}
                              error={!!validationErrors[v]}
                              helperText={validationErrors[v]?.message}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          </Grid>

          {selectedTemplate && activeType && previewData && (
            <Grid
              item
              xs={12}
              lg={5}
              sx={{
                borderLeft: { lg: '1px solid #E5E7EB' },
                pl: { lg: 4 }
              }}
            >
              <Box sx={{ position: 'sticky', top: 0 }}>
                <MessagePreview
                  type={activeType}
                  formData={previewData}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <AppButton variantStyle="outline" onClick={handleClose}>
          Cancel
        </AppButton>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <AppButton
            variantStyle="outline"
            onClick={() => handleSubmit('draft')}
            isLoading={updateMutation.isPending}
          >
            Update Draft
          </AppButton>
          <AppButton
            variantStyle="primary"
            onClick={() => handleSubmit('send')}
            isLoading={updateMutation.isPending}
            disabled={!templateId}
          >
            Update & Send
          </AppButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
