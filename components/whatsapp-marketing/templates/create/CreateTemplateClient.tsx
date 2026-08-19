// components/whatsapp-marketing/templates/create/CreateTemplateClient.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, Grid, Box, Typography } from '@mui/material';
import PageHeader from '@/components/ui/page-header';
import { AppButton } from '@/components/ui/app-button';
import { notify } from '@/lib/notifications';
import { useCreateBroadcastTemplate } from '@/lib/hooks/useBroadcastTemplates';
import { useAccounts } from '@/lib/hooks/useOmnichannel';
import GeneralInfoCard from './GeneralInfoCard';
import ContentTypeSelector from './ContentTypeSelector';
import TemplateFormContent from './TemplateFormContent';
import MessagePreview from './MessagePreview';
import AddVariableSamplesModal from './AddVariableSamplesModal';
import AccountSelect from '@/components/omnichannel/AccountSelect';
import { BroadcastTemplateType, CreateBroadcastTemplateData } from '@/lib/types/whatsapp-marketing';

export default function CreateTemplateClient() {
  const router = useRouter();
  const mutation = useCreateBroadcastTemplate();
  const { data: waAccounts } = useAccounts('whatsapp');
  const accounts = waAccounts || [];

  // Basic info state
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [accountId, setAccountId] = useState('');
  const [selectedType, setSelectedType] = useState<BroadcastTemplateType>('twilio/text');

  // Auto-pick when there's exactly one WhatsApp account.
  useEffect(() => {
    if (accounts.length === 1 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Dynamic form state
  const [typeData, setTypeData] = useState<Record<BroadcastTemplateType, any>>({
    'twilio/text': { body: '' },
    'twilio/media': { body: '', media: [] },
    'twilio/call-to-action': { body: '', actions: [] },
  } as any);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeFormData = useMemo(() => {
    return typeData[selectedType] || {};
  }, [typeData, selectedType]);

  const hasVariables = useMemo(() => {
    const bodyStr = JSON.stringify(activeFormData);
    return /{{(\d+)}}/.test(bodyStr);
  }, [activeFormData]);

  const handleFormDataChange = (newData: any) => {
    setTypeData({
      ...typeData,
      [selectedType]: newData
    });
  };

  const handleCreate = async (samples?: Record<string, string>) => {
    if (!name) {
      notify.error('Template name is required');
      return;
    }
    if (!accountId) {
      notify.error('Choose which WhatsApp account this template belongs to');
      return;
    }

    // Capture standard variables if no samples provided
    const finalVariables: Record<string, string> = { ...variables };
    const bodyStr = JSON.stringify(activeFormData);
    const matches = bodyStr.match(/{{(\d+)}}/g);
    if (matches) {
      matches.forEach(match => {
        const num = match.replace(/[{}]/g, '');
        finalVariables[num] = samples?.[num] || finalVariables[num] || `Variable ${num}`;
      });
    }

    const payload: CreateBroadcastTemplateData = {
      account_id: accountId,
      friendly_name: name,
      language: language,
      variables: finalVariables,
      types: {
        [selectedType]: activeFormData
      }
    };

    try {
      await mutation.mutateAsync(payload);
      notify.success('Template created successfully');
      router.push('/whatsapp-marketing/template-broadcasting');
    } catch (err: any) {
      notify.error(err.message || 'Failed to create template');
    }
  };

  const onPreCreate = () => {
    if (!name) {
      notify.error('Template name is required');
      return;
    }
    if (!accountId) {
      notify.error('Choose which WhatsApp account this template belongs to');
      return;
    }
    if (hasVariables) {
      setIsModalOpen(true);
    } else {
      handleCreate();
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-20 space-y-6">
      <PageHeader
        title="Add Template"
        breadcrumbs={[
          { label: 'Whatsapp Marketing' },
          { label: 'Template Broadcasting', href: '/whatsapp-marketing/template-broadcasting' },
          { label: 'Create Template' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Left Column - Forms */}
        <Grid item xs={12} md={7} lg={8}>
          <Stack spacing={3}>
            {accounts.length > 1 && (
              <Box sx={{ maxWidth: 360 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  WhatsApp Account <span style={{ color: 'red' }}>*</span>
                </Typography>
                <AccountSelect
                  accounts={accounts}
                  value={accountId}
                  onChange={setAccountId}
                  placeholder="Choose a WhatsApp account"
                />
              </Box>
            )}
            <GeneralInfoCard
              name={name}
              language={language}
              onNameChange={setName}
              onLanguageChange={setLanguage}
            />

            <ContentTypeSelector
              selectedType={selectedType}
              onChange={setSelectedType}
            />

            <TemplateFormContent
              type={selectedType}
              formData={activeFormData}
              onChange={handleFormDataChange}
              variables={variables}
              onVariablesChange={setVariables}
            />

            <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
              <AppButton
                variantStyle="primary"
                onClick={onPreCreate}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Creating...' : 'Create'}
              </AppButton>
              <AppButton
                variantStyle="outline"
                onClick={() => router.push('/whatsapp-marketing/template-broadcasting')}
              >
                Cancel
              </AppButton>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column - Preview */}
        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <MessagePreview
              type={selectedType}
              formData={activeFormData}
            />
          </Box>
        </Grid>
      </Grid>

      <AddVariableSamplesModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={activeFormData}
        initialSamples={variables}
        isSaving={mutation.isPending}
        onSave={async (samples: Record<string, string>) => {
          await handleCreate(samples);
          setIsModalOpen(false);
        }}
        onSaveWithoutSamples={async () => {
          await handleCreate();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
