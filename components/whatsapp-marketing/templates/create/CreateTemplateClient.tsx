// components/whatsapp-marketing/templates/create/CreateTemplateClient.tsx
"use client";

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, Grid, Box } from '@mui/material';
import PageHeader from '@/components/ui/page-header';
import { AppButton } from '@/components/ui/app-button';
import { notify } from '@/lib/notifications';
import { useCreateBroadcastTemplate } from '@/lib/hooks/useBroadcastTemplates';
import GeneralInfoCard from './GeneralInfoCard';
import ContentTypeSelector from './ContentTypeSelector';
import TemplateFormContent from './TemplateFormContent';
import MessagePreview from './MessagePreview';
import AddVariableSamplesModal from './AddVariableSamplesModal';
import { BroadcastTemplateType, CreateBroadcastTemplateData } from '@/lib/types/whatsapp-marketing';

export default function CreateTemplateClient() {
  const router = useRouter();
  const mutation = useCreateBroadcastTemplate();

  // Basic info state
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [selectedType, setSelectedType] = useState<BroadcastTemplateType>('twilio/text');

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
    if (hasVariables) {
      setIsModalOpen(true);
    } else {
      handleCreate();
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-20 space-y-6">
      <PageHeader
        title="Create Template"
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
        onSave={(samples: Record<string, string>) => {
          setIsModalOpen(false);
          handleCreate(samples);
        }}
        onSaveWithoutSamples={() => {
          setIsModalOpen(false);
          handleCreate();
        }}
      />
    </div>
  );
}
