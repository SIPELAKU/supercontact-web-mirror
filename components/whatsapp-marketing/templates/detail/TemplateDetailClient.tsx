// components/whatsapp-marketing/templates/detail/TemplateDetailClient.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Grid, Stack, Box, CircularProgress, Typography } from '@mui/material';

import PageHeader from '@/components/ui/page-header';
import { AppButton } from '@/components/ui/app-button';
import { notify } from '@/lib/notifications';
import {
  useBroadcastTemplateDetail,
  useUpdateBroadcastTemplate
} from '@/lib/hooks/useBroadcastTemplates';
import GeneralInfoDetail from './GeneralInfoDetail';
import GeneralInfoCard from '../create/GeneralInfoCard';
import TemplateFormContent from '../create/TemplateFormContent';
import MessagePreview from '../create/MessagePreview';
import AddVariableSamplesModal from '../create/AddVariableSamplesModal';
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';
import { ArrowLeft } from 'lucide-react';

export default function TemplateDetailClient() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useBroadcastTemplateDetail(id);
  const updateMutation = useUpdateBroadcastTemplate();

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editTypeData, setEditTypeData] = useState<any>({});
  const [editVariables, setEditVariables] = useState<Record<string, string>>({});

  const template = data?.data;
  const activeType = template ? (Object.keys(template.types)[0] as BroadcastTemplateType) : undefined;

  const activeFormData = useMemo(() => {
    if (!activeType) return {};
    return editTypeData[activeType] || {};
  }, [editTypeData, activeType]);

  const hasVariables = useMemo(() => {
    const bodyStr = JSON.stringify(activeFormData);
    return /{{(\d+)}}/.test(bodyStr);
  }, [activeFormData]);

  useEffect(() => {
    if (template) {
      setEditName(template.friendly_name);
      setEditLanguage(template.language);
      setEditTypeData(template.types);
      setEditVariables(template.variables || {});
    }
  }, [template]);

  const handleFormDataChange = (newData: any) => {
    if (!activeType) return;
    setEditTypeData({
      ...editTypeData,
      [activeType]: newData
    });
  };

  const handleSave = async (samples?: Record<string, string>) => {
    try {
      // Capture variables/samples
      const finalVariables: Record<string, string> = {
        ...(samples || editVariables)
      };

      const bodyStr = JSON.stringify(editTypeData);
      const matches = bodyStr.match(/{{(\d+)}}/g);
      if (matches) {
        matches.forEach(match => {
          const num = match.replace(/[{}]/g, '');
          if (!finalVariables[num]) {
            finalVariables[num] = `Variable ${num}`;
          }
        });
      }

      await updateMutation.mutateAsync({
        id,
        data: {
          friendly_name: editName,
          language: editLanguage,
          variables: finalVariables,
          types: editTypeData,
        }
      });
      notify.success('Template updated successfully');
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to update template');
    }
  };

  const onPreSave = () => {
    if (hasVariables) {
      setIsModalOpen(true);
    } else {
      handleSave();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !template) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Failed to load template details.</Typography>
        <AppButton onClick={() => router.back()} sx={{ mt: 2 }}>Go Back</AppButton>
      </Box>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-20 space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Template' : 'Template Details'}
        breadcrumbs={[
          { label: 'Whatsapp Marketing' },
          { label: 'Template Broadcasting', href: '/whatsapp-marketing/template-broadcasting' },
          { label: template.friendly_name },
        ]}
      />

      <AppButton onClick={() => router.back()} sx={{ my: 2 }} variantStyle='text' startIcon={<ArrowLeft />}>Back</AppButton>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7} lg={8}>
          <Stack spacing={3}>
            {isEditing ? (
              <>
                <GeneralInfoCard
                  name={editName}
                  language={editLanguage}
                  onNameChange={setEditName}
                  onLanguageChange={setEditLanguage}
                  isEdit={true}
                />

                {activeType && (
                  <TemplateFormContent
                    type={activeType}
                    formData={activeFormData}
                    onChange={handleFormDataChange}
                    variables={editVariables}
                    onVariablesChange={setEditVariables}
                  />
                )}

                <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                  <AppButton
                    variantStyle="primary"
                    onClick={onPreSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save and Submit'}
                  </AppButton>
                  <AppButton
                    variantStyle="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </AppButton>
                </Box>
              </>
            ) : (
              <GeneralInfoDetail
                template={template}
                onEdit={() => setIsEditing(true)}
              />
            )}

            {/* Show content detail even in read-only mode if not editing */}
            {!isEditing && activeType && (
              <TemplateFormContent
                type={activeType}
                formData={template.types[activeType]}
                onChange={() => { }} // Read-only
                variables={template.variables}
                isReadOnly={true}
              />
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <MessagePreview
              type={activeType!}
              formData={isEditing ? activeFormData : template.types[activeType!]}
            />
          </Box>
        </Grid>
      </Grid>

      <AddVariableSamplesModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={activeFormData}
        initialSamples={editVariables}
        onSave={(samples: Record<string, string>) => {
          setIsModalOpen(false);
          handleSave(samples);
        }}
        onSaveWithoutSamples={() => {
          setIsModalOpen(false);
          handleSave();
        }}
      />
    </div>
  );
}
