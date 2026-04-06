// components/whatsapp-marketing/templates/create/TemplateFormContent.tsx
"use client";

import { Card, CardContent, Typography, Box, Stack, IconButton, Divider, Tooltip } from '@mui/material';
import { Plus, Trash2, Info } from 'lucide-react';
import { AppInput } from '@/components/ui/app-input';
import { AppTextarea } from '@/components/ui/app-textarea';
import { AppSelect } from '@/components/ui/app-select';
import { AppButton } from '@/components/ui/app-button';
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';

interface TemplateFormContentProps {
  type: BroadcastTemplateType;
  formData: any;
  onChange: (data: any) => void;
  variables?: Record<string, string>;
  onVariablesChange?: (variables: Record<string, string>) => void;
  isReadOnly?: boolean;
}

interface AddVariableButtonProps {
  onAdd: () => void;
  isReadOnly?: boolean;
}

const AddVariableButton = ({ onAdd, isReadOnly }: AddVariableButtonProps) => {
  if (isReadOnly) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography
          variant="caption"
          sx={{
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={onAdd}
        >
          + Add Variable
        </Typography>
        <Tooltip
          arrow
          title={
            <Box sx={{ p: 0.5 }}>
              <Typography variant="caption" display="block" fontWeight="bold">
                Click here to add content variables to this field.
              </Typography>
              <Typography variant="caption" display="block">
                Variables allow you to personalize messages. With variables, you can customize a URL or input a customer's name at time of send.
              </Typography>
            </Box>
          }
        >
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            <Info size={14} color="#6B7280" />
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

interface RenderVariableSamplesProps {
  text: string;
  variables?: Record<string, string>;
  onVariablesChange?: (variables: Record<string, string>) => void;
  isReadOnly?: boolean;
}

const RenderVariableSamples = ({ text, variables, onVariablesChange, isReadOnly }: RenderVariableSamplesProps) => {
  if (!variables) return null;
  const matches = (text || '').match(/{{(\d+)}}/g);
  if (!matches) return null;

  const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));

  return (
    <Stack spacing={2} sx={{ mt: isReadOnly ? 1 : 2, mb: 1 }}>
      {uniqueVars.map(v => (
        <Box key={v}>
          <Typography 
            variant="caption" 
            fontWeight={isReadOnly ? "medium" : "bold"} 
            display="block" 
            mb={0.5} 
            color="text.primary"
          >
            Sample content for variable &#123;&#123;{v}&#125;&#125;
          </Typography>
          <AppInput 
            isBgWhite
            placeholder={`Enter sample for {{${v}}}`}
            value={variables[v] || ''}
            onChange={(e) => {
              if (onVariablesChange) {
                onVariablesChange({ ...variables, [v]: e.target.value });
              }
            }}
            disabled={isReadOnly || !onVariablesChange}
            size="small"
          />
        </Box>
      ))}
    </Stack>
  );
};

export default function TemplateFormContent({
  type,
  formData,
  onChange,
  variables,
  onVariablesChange,
  isReadOnly = false,
}: TemplateFormContentProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleAddVariable = (currentValue: string, field: string, setter?: (val: any) => void) => {
    const matches = (currentValue || '').match(/{{(\d+)}}/g) || [];
    const nextNum = matches.length > 0
      ? Math.max(...matches.map((m: string) => parseInt(m.replace(/[{}]/g, '')))) + 1
      : 1;
    const newValue = (currentValue || '') + `{{${nextNum}}}`;
    if (setter) {
      setter(newValue);
    } else {
      updateField(field, newValue);
    }
  };

  const renderTextForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {isReadOnly && (
        <Typography variant="body2" fontWeight="medium" mb={0.5}>Body</Typography>
      )}
      <Box sx={{ position: 'relative' }}>
        <AppTextarea
          isBgWhite
          label={isReadOnly ? undefined : "Body"}
          placeholder="Hi {{1}}, how can I help you today?"
          required
          minRows={4}
          value={formData.body || ''}
          onChange={(e) => updateField('body', e.target.value)}
          disabled={isReadOnly}
        />
        {isReadOnly && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              right: 12, 
              top: 12, 
              color: 'text.secondary',
              pointerEvents: 'none'
            }}
          >
            {(formData.body || '').length}/1600
          </Typography>
        )}
      </Box>
      <AddVariableButton onAdd={() => handleAddVariable(formData.body, 'body')} isReadOnly={isReadOnly} />
      <RenderVariableSamples text={formData.body} variables={variables} onVariablesChange={onVariablesChange} isReadOnly={isReadOnly} />
    </Box>
  );

  const renderMediaForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        {isReadOnly && (
          <Typography variant="body2" fontWeight="medium" mb={0.5}>Media URL</Typography>
        )}
        <AppInput
          isBgWhite
          label={isReadOnly ? undefined : "Media URL"}
          placeholder="https://example.com/image.png"
          required
          value={formData.media?.[0] || ''}
          onChange={(e) => updateField('media', [e.target.value])}
          disabled={isReadOnly}
        />
        <AddVariableButton onAdd={() => handleAddVariable(formData.media?.[0], 'media', (val) => updateField('media', [val]))} isReadOnly={isReadOnly} />
        <RenderVariableSamples text={formData.media?.[0]} variables={variables} onVariablesChange={onVariablesChange} isReadOnly={isReadOnly} />
      </Box>
      <Box sx={{ position: 'relative' }}>
        {isReadOnly && (
          <Typography variant="body2" fontWeight="medium" mb={0.5}>Body</Typography>
        )}
        <Box sx={{ position: 'relative' }}>
          <AppTextarea
            isBgWhite
            label={isReadOnly ? undefined : "Body"}
            placeholder="Thank you for your order {{1}}"
            required
            minRows={4}
            value={formData.body || ''}
            onChange={(e) => updateField('body', e.target.value)}
            disabled={isReadOnly}
          />
          {isReadOnly && (
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                right: 12, 
                top: 12, 
                color: 'text.secondary',
                pointerEvents: 'none'
              }}
            >
              {(formData.body || '').length}/1600
            </Typography>
          )}
        </Box>
        <AddVariableButton onAdd={() => handleAddVariable(formData.body, 'body')} isReadOnly={isReadOnly} />
        <RenderVariableSamples text={formData.body} variables={variables} onVariablesChange={onVariablesChange} isReadOnly={isReadOnly} />
      </Box>
    </Box>
  );

  const renderCTAForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ position: 'relative' }}>
        {isReadOnly && (
          <Typography variant="body2" fontWeight="medium" mb={0.5}>Body</Typography>
        )}
        <Box sx={{ position: 'relative' }}>
          <AppTextarea
            isBgWhite
            label={isReadOnly ? undefined : "Body"}
            placeholder="Flight {{1}} to {{2}} departs at {{3}}"
            required
            minRows={4}
            value={formData.body || ''}
            onChange={(e) => updateField('body', e.target.value)}
            disabled={isReadOnly}
          />
          {isReadOnly && (
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                right: 12, 
                top: 12, 
                color: 'text.secondary',
                pointerEvents: 'none'
              }}
            >
              {(formData.body || '').length}/1600
            </Typography>
          )}
        </Box>
        <AddVariableButton onAdd={() => handleAddVariable(formData.body, 'body')} />
        <RenderVariableSamples text={formData.body} />
      </Box>

      <Typography variant="subtitle2" fontWeight="bold">Actions</Typography>
      {(formData.actions || []).map((action: any, index: number) => (
        <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: isReadOnly ? 'transparent' : 'action.hover' }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight="bold">Action {index + 1}</Typography>
              {!isReadOnly && (
                <IconButton size="small" color="error" onClick={() => {
                  const newActions = [...formData.actions];
                  newActions.splice(index, 1);
                  updateField('actions', newActions);
                }}>
                  <Trash2 size={16} />
                </IconButton>
              )}
            </Stack>

            <Box>
              {isReadOnly && (
                <Typography variant="caption" fontWeight="medium" mb={0.5} display="block" color="text.secondary">Type</Typography>
              )}
              <AppSelect
                label={isReadOnly ? undefined : "Type"}
                size="small"
                isBgWhite
                options={[
                  { label: 'URL', value: 'URL' },
                  { label: 'Phone Number', value: 'PHONE_NUMBER' },
                ]}
                value={action.type || 'URL'}
                onChange={(e) => {
                  const newActions = [...formData.actions];
                  newActions[index] = { ...newActions[index], type: e.target.value };
                  updateField('actions', newActions);
                }}
                disabled={isReadOnly}
              />
            </Box>

            <Box>
              {isReadOnly && (
                <Typography variant="caption" fontWeight="medium" mb={0.5} display="block" color="text.secondary">Title</Typography>
              )}
              <AppInput
                label={isReadOnly ? undefined : "Title"}
                size="small"
                isBgWhite
                value={action.title || ''}
                onChange={(e) => {
                  const newActions = [...formData.actions];
                  newActions[index] = { ...newActions[index], title: e.target.value };
                  updateField('actions', newActions);
                }}
                disabled={isReadOnly}
              />
              <AddVariableButton onAdd={() => {
                const newActions = [...formData.actions];
                const matches = (action.title || '').match(/{{(\d+)}}/g) || [];
                const nextNum = matches.length > 0 ? Math.max(...matches.map((m: string) => parseInt(m.replace(/[{}]/g, '')))) + 1 : 1;
                newActions[index] = { ...newActions[index], title: (action.title || '') + `{{${nextNum}}}` };
                updateField('actions', newActions);
              }} isReadOnly={isReadOnly} />
            </Box>

            {action.type === 'URL' ? (
              <Box>
                {isReadOnly && (
                  <Typography variant="caption" fontWeight="medium" mb={0.5} display="block" color="text.secondary">URL</Typography>
                )}
                <AppInput
                  label={isReadOnly ? undefined : "URL"}
                  size="small"
                  isBgWhite
                  value={action.url || ''}
                  onChange={(e) => {
                    const newActions = [...formData.actions];
                    newActions[index] = { ...newActions[index], url: e.target.value };
                    updateField('actions', newActions);
                  }}
                  disabled={isReadOnly}
                />
                <AddVariableButton onAdd={() => {
                  const newActions = [...formData.actions];
                  const matches = (action.url || '').match(/{{(\d+)}}/g) || [];
                  const nextNum = matches.length > 0 ? Math.max(...matches.map((m: string) => parseInt(m.replace(/[{}]/g, '')))) + 1 : 1;
                  newActions[index] = { ...newActions[index], url: (action.url || '') + `{{${nextNum}}}` };
                  updateField('actions', newActions);
                }} isReadOnly={isReadOnly} />
              </Box>
            ) : (
              <Box>
                {isReadOnly && (
                  <Typography variant="caption" fontWeight="medium" mb={0.5} display="block" color="text.secondary">Phone Number</Typography>
                )}
                <AppInput
                  label={isReadOnly ? undefined : "Phone Number"}
                  size="small"
                  isBgWhite
                  value={action.phone || ''}
                  onChange={(e) => {
                    const newActions = [...formData.actions];
                    newActions[index] = { ...newActions[index], phone: e.target.value };
                    updateField('actions', newActions);
                  }}
                  disabled={isReadOnly}
                />
              </Box>
            )}
          </Stack>
        </Card>
      ))}

      {!isReadOnly && (
        <AppButton
          variantStyle="outline"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            const newActions = [...(formData.actions || []), { type: 'URL', title: '', url: '' }];
            updateField('actions', newActions);
          }}
        >
          Add Action
        </AppButton>
      )}
    </Box>
  );

  const renderContentForm = () => {
    switch (type) {
      case 'twilio/text':
        return renderTextForm();
      case 'twilio/media':
        return renderMediaForm();
      case 'twilio/call-to-action':
        return renderCTAForm();
      // Add more types as needed...
      default:
        return (
          <Typography color="text.secondary">
            Form for {type} is coming soon.
          </Typography>
        );
    }
  };

  const needsFallback = ['twilio/list-picker', 'twilio/quick-reply', 'twilio/call-to-action', 'twilio/card', 'twilio/carousel'].includes(type);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Content Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Customize your template content for {type}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderContentForm()}

          {needsFallback && (
            <>
              <Divider sx={{ my: 1 }} />
              {isReadOnly && (
                <Typography variant="body2" fontWeight="bold" mb={-2}>Fallback Text (Best Practice)</Typography>
              )}
              <AppTextarea
                isBgWhite
                label={isReadOnly ? undefined : "Text Fallback"}
                placeholder="Message summary for non-supporting devices"
                minRows={3}
                value={formData.fallback_text || ''}
                onChange={(e) => updateField('fallback_text', e.target.value)}
                disabled={isReadOnly}
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
