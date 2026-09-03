// components/whatsapp-marketing/templates/create/TemplateFormContent.tsx
"use client";

import { Card, CardContent, Typography, Box, Stack, IconButton, Divider, Tooltip, Switch, FormControlLabel } from '@mui/material';
import { Plus, Trash2, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { AppInput } from '@/components/ui/app-input';
import { AppTextarea } from '@/components/ui/app-textarea';
import { AppSelect } from '@/components/ui/app-select';
import { AppButton } from '@/components/ui/app-button';
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';
import MediaUploadField from './MediaUploadField';
import {
  ACTION_ID_MAX,
  CARD_MAX_ACTIONS,
  CARD_TITLE_MAX,
  CARD_SUBTITLE_MAX,
  CAROUSEL_CARD_TITLE_BODY_COMBINED_MAX,
  CAROUSEL_MAX_CARDS,
  CAROUSEL_MAX_CARD_ACTIONS,
  CAROUSEL_MIN_CARDS,
  CTA_BODY_MAX,
  LIST_PICKER_BODY_MAX,
  LIST_PICKER_DESCRIPTION_MAX,
  LIST_PICKER_ITEM_MAX,
  LIST_PICKER_MAX_ITEMS,
  QUICK_REPLY_BODY_MAX,
  QUICK_REPLY_MAX_ACTIONS,
  buttonTextMax,
} from '@/lib/constants/whatsapp-limits';

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


type ActionKind = 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';

interface ActionsEditorProps {
  actions: any[];
  onChange: (actions: any[]) => void;
  allowedTypes: ActionKind[];
  max: number;
  isReadOnly?: boolean;
  label?: string;
  /** Shown under the header - used to explain the carousel's uniformity rule. */
  hint?: string;
}

const ACTION_TYPE_LABEL: Record<ActionKind, string> = {
  URL: 'URL',
  PHONE_NUMBER: 'Phone Number',
  QUICK_REPLY: 'Quick Reply',
};

/**
 * One repeater for every type that carries buttons: call-to-action, card,
 * quick reply, and each card of a carousel.
 *
 * Built once because the character budget for a button title depends on the
 * button's TYPE - 25 for URL and phone, 20 for a quick reply - and a counter
 * per card rather than per row would be wrong in one direction or the other.
 */
const ActionsEditor = ({
  actions,
  onChange,
  allowedTypes,
  max,
  isReadOnly,
  label = 'Actions',
  hint,
}: ActionsEditorProps) => {
  const list = actions || [];
  const atMax = list.length >= max;

  const update = (index: number, patch: any) => {
    const next = [...list];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {list.length}/{max}
          </Typography>
        </Stack>
        {hint ? (
          <Typography variant="caption" color="text.secondary" display="block">
            {hint}
          </Typography>
        ) : null}
      </Box>

      {list.map((action: any, index: number) => {
        const titleMax = buttonTextMax(action.type);
        const overTitle = (action.title || '').length > titleMax;
        return (
          <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: isReadOnly ? 'transparent' : 'action.hover' }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="bold">
                  {label.replace(/s$/, '')} {index + 1}
                </Typography>
                {!isReadOnly && (
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Hapus ${label} ${index + 1}`}
                    onClick={() => onChange(list.filter((_: any, i: number) => i !== index))}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Stack>

              {allowedTypes.length > 1 && (
                <Box>
                  {isReadOnly && (
                    <Typography variant="caption" fontWeight="medium" mb={0.5} display="block" color="text.secondary">Type</Typography>
                  )}
                  <AppSelect
                    label={isReadOnly ? undefined : 'Type'}
                    size="small"
                    isBgWhite
                    options={allowedTypes.map((t) => ({ label: ACTION_TYPE_LABEL[t], value: t }))}
                    value={action.type || allowedTypes[0]}
                    onChange={(e) => update(index, { type: e.target.value })}
                    disabled={isReadOnly}
                  />
                </Box>
              )}

              <Box>
                {isReadOnly && (
                  <Typography variant="caption" fontWeight="medium" mb={0.5} display="block" color="text.secondary">Title</Typography>
                )}
                <AppInput
                  label={isReadOnly ? undefined : 'Title'}
                  size="small"
                  isBgWhite
                  value={action.title || ''}
                  onChange={(e) => update(index, { title: e.target.value })}
                  disabled={isReadOnly}
                />
                <Typography
                  variant="caption"
                  color={overTitle ? 'error' : 'text.secondary'}
                  display="block"
                  textAlign="right"
                >
                  {(action.title || '').length}/{titleMax}
                </Typography>
              </Box>

              {(action.type || allowedTypes[0]) === 'URL' && (
                <AppInput
                  label={isReadOnly ? undefined : 'URL'}
                  size="small"
                  isBgWhite
                  placeholder="https://example.com/{{1}}"
                  value={action.url || ''}
                  onChange={(e) => update(index, { url: e.target.value })}
                  disabled={isReadOnly}
                />
              )}
              {(action.type || allowedTypes[0]) === 'PHONE_NUMBER' && (
                <AppInput
                  label={isReadOnly ? undefined : 'Phone Number'}
                  size="small"
                  isBgWhite
                  value={action.phone || ''}
                  onChange={(e) => update(index, { phone: e.target.value })}
                  disabled={isReadOnly}
                />
              )}
              {(action.type || allowedTypes[0]) === 'QUICK_REPLY' && (
                <AppInput
                  label={isReadOnly ? undefined : 'ID (dikirim balik saat ditekan)'}
                  size="small"
                  isBgWhite
                  value={action.id || ''}
                  onChange={(e) => update(index, { id: e.target.value.slice(0, ACTION_ID_MAX) })}
                  disabled={isReadOnly}
                />
              )}
            </Stack>
          </Card>
        );
      })}

      {!isReadOnly && (
        <Box>
          <AppButton
            variantStyle="outline"
            size="small"
            startIcon={<Plus size={16} />}
            disabled={atMax}
            onClick={() =>
              onChange([...list, { type: allowedTypes[0], title: '' }])
            }
          >
            Add {label.replace(/s$/, '')}
          </AppButton>
          {atMax && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Batas WhatsApp {max} tercapai.
            </Typography>
          )}
        </Box>
      )}
    </Box>
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
        <MediaUploadField
          label="Media"
          value={formData.media?.[0] || ''}
          onChange={(url) => updateField('media', [url])}
          isReadOnly={isReadOnly}
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


  // A body field with the variable controls the other forms already use.
  const bodyField = (
    placeholder: string,
    max: number,
    field: string = 'body'
  ) => (
    <Box>
      {isReadOnly && (
        <Typography variant="body2" fontWeight="medium" mb={0.5}>Body</Typography>
      )}
      <AppTextarea
        isBgWhite
        label={isReadOnly ? undefined : 'Body'}
        placeholder={placeholder}
        required
        minRows={4}
        value={formData[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        disabled={isReadOnly}
      />
      <Typography
        variant="caption"
        display="block"
        textAlign="right"
        color={(formData[field] || '').length > max ? 'error' : 'text.secondary'}
      >
        {(formData[field] || '').length}/{max}
      </Typography>
      <AddVariableButton onAdd={() => handleAddVariable(formData[field], field)} isReadOnly={isReadOnly} />
      <RenderVariableSamples text={formData[field]} variables={variables} onVariablesChange={onVariablesChange} isReadOnly={isReadOnly} />
    </Box>
  );

  const renderQuickReplyForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {bodyField('Halo {{1}}, apakah pesanan Anda sudah diterima?', QUICK_REPLY_BODY_MAX)}
      <ActionsEditor
        actions={formData.actions || []}
        onChange={(a) => updateField('actions', a)}
        allowedTypes={['QUICK_REPLY']}
        max={QUICK_REPLY_MAX_ACTIONS}
        isReadOnly={isReadOnly}
        label="Reply Buttons"
        hint={`Sampai ${QUICK_REPLY_MAX_ACTIONS} tombol pada template. (Batas 3 hanya berlaku untuk pesan dalam sesi tanpa approval.)`}
      />
    </Box>
  );

  const renderListPickerForm = () => {
    const items = formData.items || [];
    const atMax = items.length >= LIST_PICKER_MAX_ITEMS;
    const updateItem = (index: number, patch: any) => {
      const next = [...items];
      next[index] = { ...next[index], ...patch };
      updateField('items', next);
    };
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {bodyField('Pilih layanan yang Anda butuhkan', LIST_PICKER_BODY_MAX)}
        <AppInput
          isBgWhite
          label={isReadOnly ? undefined : 'Button Text'}
          placeholder="Lihat pilihan"
          value={formData.button || ''}
          onChange={(e) => updateField('button', e.target.value)}
          disabled={isReadOnly}
        />
        <Box>
          <Stack direction="row" alignItems="baseline" spacing={1} mb={1}>
            <Typography variant="subtitle2" fontWeight="bold">Items</Typography>
            <Typography variant="caption" color="text.secondary">
              {items.length}/{LIST_PICKER_MAX_ITEMS}
            </Typography>
          </Stack>
          <Stack spacing={2}>
            {items.map((item: any, index: number) => (
              <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: isReadOnly ? 'transparent' : 'action.hover' }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="bold">Item {index + 1}</Typography>
                    {!isReadOnly && (
                      <IconButton size="small" color="error" aria-label={`Hapus item ${index + 1}`}
                        onClick={() => updateField('items', items.filter((_: any, i: number) => i !== index))}>
                        <Trash2 size={16} />
                      </IconButton>
                    )}
                  </Stack>
                  <Box>
                    <AppInput
                      label={isReadOnly ? undefined : 'Item'}
                      size="small"
                      isBgWhite
                      value={item.item || ''}
                      onChange={(e) => updateItem(index, { item: e.target.value })}
                      disabled={isReadOnly}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      textAlign="right"
                      color={(item.item || '').length > LIST_PICKER_ITEM_MAX ? 'error' : 'text.secondary'}
                    >
                      {(item.item || '').length}/{LIST_PICKER_ITEM_MAX}
                    </Typography>
                  </Box>
                  <Box>
                    <AppInput
                      label={isReadOnly ? undefined : 'Description'}
                      size="small"
                      isBgWhite
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      disabled={isReadOnly}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      textAlign="right"
                      color={(item.description || '').length > LIST_PICKER_DESCRIPTION_MAX ? 'error' : 'text.secondary'}
                    >
                      {(item.description || '').length}/{LIST_PICKER_DESCRIPTION_MAX}
                    </Typography>
                  </Box>
                  <AppInput
                    label={isReadOnly ? undefined : 'ID (dikirim balik saat dipilih)'}
                    size="small"
                    isBgWhite
                    value={item.id || ''}
                    onChange={(e) => updateItem(index, { id: e.target.value.slice(0, ACTION_ID_MAX) })}
                    disabled={isReadOnly}
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
          {!isReadOnly && (
            <Box mt={2}>
              <AppButton
                variantStyle="outline"
                size="small"
                startIcon={<Plus size={16} />}
                disabled={atMax}
                onClick={() => updateField('items', [...items, { item: '', description: '', id: '' }])}
              >
                Add Item
              </AppButton>
              {atMax && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Batas WhatsApp {LIST_PICKER_MAX_ITEMS} tercapai.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderCardForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppInput
        isBgWhite
        label={isReadOnly ? undefined : 'Title'}
        placeholder="Promo akhir bulan"
        value={formData.title || ''}
        onChange={(e) => updateField('title', e.target.value)}
        disabled={isReadOnly}
      />
      <Box>
        <AppInput
          isBgWhite
          label={isReadOnly ? undefined : 'Subtitle'}
          value={formData.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          disabled={isReadOnly}
        />
        <Typography
          variant="caption"
          display="block"
          textAlign="right"
          color={(formData.subtitle || '').length > CARD_SUBTITLE_MAX ? 'error' : 'text.secondary'}
        >
          {(formData.subtitle || '').length}/{CARD_SUBTITLE_MAX}
        </Typography>
      </Box>
      <MediaUploadField
        label="Media"
        value={formData.media?.[0] || ''}
        onChange={(url) => updateField('media', url ? [url] : [])}
        isReadOnly={isReadOnly}
      />
      {bodyField('Rincian penawaran {{1}}', CARD_TITLE_MAX)}
      <ActionsEditor
        actions={formData.actions || []}
        onChange={(a) => updateField('actions', a)}
        allowedTypes={['URL', 'PHONE_NUMBER', 'QUICK_REPLY']}
        max={CARD_MAX_ACTIONS}
        isReadOnly={isReadOnly}
      />
    </Box>
  );

  const renderCarouselForm = () => {
    const cards = formData.cards || [];
    // The button LAYOUT is edited once for the whole carousel, and every card
    // inherits it. WhatsApp requires the button types to appear in the same
    // order on every card, so making the layout a carousel-level property
    // makes a mismatch impossible to build rather than something we detect
    // afterwards - by which time it is a rejection days later, naming no card.
    const layout: string[] = formData.__buttonLayout || ['URL'];

    const setLayout = (next: string[]) => {
      const trimmed = next.slice(0, CAROUSEL_MAX_CARD_ACTIONS);
      updateField('__buttonLayout', trimmed);
      onChange({
        ...formData,
        __buttonLayout: trimmed,
        cards: cards.map((c: any) => ({
          ...c,
          actions: trimmed.map((t, i) => ({ ...(c.actions?.[i] || {}), type: t })),
        })),
      });
    };

    const updateCard = (index: number, patch: any) => {
      const next = [...cards];
      next[index] = { ...next[index], ...patch };
      updateField('cards', next);
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {bodyField('Lihat pilihan kami minggu ini', QUICK_REPLY_BODY_MAX)}

        <Card variant="outlined" sx={{ p: 2, bgcolor: isReadOnly ? 'transparent' : 'action.hover' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Button layout
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Berlaku untuk SEMUA kartu. WhatsApp menolak carousel yang kartunya
            punya tipe tombol berbeda atau urutannya tidak sama, jadi tata
            letaknya diatur sekali di sini.
          </Typography>
          <Stack spacing={1.5}>
            {layout.map((t, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <Box sx={{ flexGrow: 1 }}>
                  <AppSelect
                    size="small"
                    isBgWhite
                    options={[
                      { label: 'URL', value: 'URL' },
                      { label: 'Phone Number', value: 'PHONE_NUMBER' },
                      { label: 'Quick Reply', value: 'QUICK_REPLY' },
                    ]}
                    value={t}
                    onChange={(e) => setLayout(layout.map((x, j) => (j === i ? String(e.target.value) : x)))}
                    disabled={isReadOnly}
                  />
                </Box>
                {!isReadOnly && layout.length > 1 && (
                  <IconButton size="small" color="error" aria-label={`Hapus tombol ${i + 1}`}
                    onClick={() => setLayout(layout.filter((_, j) => j !== i))}>
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
          {!isReadOnly && layout.length < CAROUSEL_MAX_CARD_ACTIONS && (
            <Box mt={1.5}>
              <AppButton variantStyle="outline" size="small" startIcon={<Plus size={16} />}
                onClick={() => setLayout([...layout, 'URL'])}>
                Add Button
              </AppButton>
            </Box>
          )}
        </Card>

        <Box>
          <Stack direction="row" alignItems="baseline" spacing={1} mb={1}>
            <Typography variant="subtitle2" fontWeight="bold">Cards</Typography>
            <Typography variant="caption" color={cards.length < CAROUSEL_MIN_CARDS ? 'error' : 'text.secondary'}>
              {cards.length}/{CAROUSEL_MAX_CARDS}
              {cards.length < CAROUSEL_MIN_CARDS ? ` — minimal ${CAROUSEL_MIN_CARDS}` : ''}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Jumlah kartu dikunci saat approval: template yang disetujui akan
            selalu mengirim sebanyak kartu yang diajukan.
          </Typography>

          <Stack spacing={2}>
            {cards.map((card: any, index: number) => {
              const combined = (card.title || '').length + (card.body || '').length;
              return (
                <Card key={index} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="bold">Card {index + 1}</Typography>
                      {!isReadOnly && (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" disabled={index === 0} aria-label="Naikkan kartu"
                            onClick={() => {
                              const next = [...cards];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              updateField('cards', next);
                            }}>
                            <ArrowUp size={16} />
                          </IconButton>
                          <IconButton size="small" disabled={index === cards.length - 1} aria-label="Turunkan kartu"
                            onClick={() => {
                              const next = [...cards];
                              [next[index + 1], next[index]] = [next[index], next[index + 1]];
                              updateField('cards', next);
                            }}>
                            <ArrowDown size={16} />
                          </IconButton>
                          <IconButton size="small" color="error" aria-label={`Hapus kartu ${index + 1}`}
                            onClick={() => updateField('cards', cards.filter((_: any, i: number) => i !== index))}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    <MediaUploadField
                      label="Card media"
                      value={card.media?.[0] || ''}
                      onChange={(url) => updateCard(index, { media: url ? [url] : [] })}
                      isReadOnly={isReadOnly}
                    />
                    <AppInput
                      label={isReadOnly ? undefined : 'Card title'}
                      size="small"
                      isBgWhite
                      value={card.title || ''}
                      onChange={(e) => updateCard(index, { title: e.target.value })}
                      disabled={isReadOnly}
                    />
                    <Box>
                      <AppTextarea
                        label={isReadOnly ? undefined : 'Card body'}
                        isBgWhite
                        minRows={2}
                        value={card.body || ''}
                        onChange={(e) => updateCard(index, { body: e.target.value })}
                        disabled={isReadOnly}
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        textAlign="right"
                        color={combined > CAROUSEL_CARD_TITLE_BODY_COMBINED_MAX ? 'error' : 'text.secondary'}
                      >
                        title + body {combined}/{CAROUSEL_CARD_TITLE_BODY_COMBINED_MAX}
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        Buttons (tipe mengikuti layout di atas)
                      </Typography>
                      {layout.map((t, i) => (
                        <Stack key={i} spacing={1}>
                          <AppInput
                            label={isReadOnly ? undefined : `${t} — title`}
                            size="small"
                            isBgWhite
                            value={card.actions?.[i]?.title || ''}
                            onChange={(e) => {
                              const actions = layout.map((tt, j) => ({
                                ...(card.actions?.[j] || {}),
                                type: tt,
                              }));
                              actions[i] = { ...actions[i], title: e.target.value };
                              updateCard(index, { actions });
                            }}
                            disabled={isReadOnly}
                          />
                          {t === 'URL' && (
                            <AppInput
                              label={isReadOnly ? undefined : 'URL'}
                              size="small"
                              isBgWhite
                              value={card.actions?.[i]?.url || ''}
                              onChange={(e) => {
                                const actions = layout.map((tt, j) => ({
                                  ...(card.actions?.[j] || {}),
                                  type: tt,
                                }));
                                actions[i] = { ...actions[i], url: e.target.value };
                                updateCard(index, { actions });
                              }}
                              disabled={isReadOnly}
                            />
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          {!isReadOnly && (
            <Box mt={2}>
              <AppButton
                variantStyle="outline"
                size="small"
                startIcon={<Plus size={16} />}
                disabled={cards.length >= CAROUSEL_MAX_CARDS}
                onClick={() =>
                  updateField('cards', [
                    ...cards,
                    { media: [], title: '', body: '', actions: layout.map((t) => ({ type: t, title: '' })) },
                  ])
                }
              >
                Add Card
              </AppButton>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderWhatsAppCardForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        {isReadOnly && (
          <Typography variant="body2" fontWeight="medium" mb={0.5}>Header text</Typography>
        )}
        <AppInput
          isBgWhite
          label={isReadOnly ? undefined : 'Header text'}
          placeholder="Kode promo Anda"
          value={formData.header_text || ''}
          onChange={(e) => updateField('header_text', e.target.value)}
          disabled={isReadOnly}
        />
        <AddVariableButton onAdd={() => handleAddVariable(formData.header_text, 'header_text')} isReadOnly={isReadOnly} />
        <RenderVariableSamples text={formData.header_text} variables={variables} onVariablesChange={onVariablesChange} isReadOnly={isReadOnly} />
      </Box>
      {bodyField('Gunakan {{1}} sebelum akhir bulan', CARD_TITLE_MAX)}
    </Box>
  );

  const renderAuthForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          WhatsApp menulis sendiri isi pesan untuk template autentikasi — tidak
          ada kolom Body di sini, dan menambahkannya akan ditolak saat review.
          Yang bisa diatur hanya masa berlaku kode, catatan keamanan, dan label
          tombol salin.
        </Typography>
      </Box>

      <AppInput
        isBgWhite
        type="number"
        label={isReadOnly ? undefined : 'Kode berlaku (menit)'}
        value={formData.code_expiration_minutes || ''}
        onChange={(e) => updateField('code_expiration_minutes', e.target.value)}
        disabled={isReadOnly}
      />

      <FormControlLabel
        control={
          <Switch
            checked={!!formData.add_security_recommendation}
            onChange={(e) => updateField('add_security_recommendation', e.target.checked)}
            disabled={isReadOnly}
          />
        }
        label={
          <Typography variant="body2">
            Tampilkan anjuran keamanan (&ldquo;jangan bagikan kode ini&rdquo;)
          </Typography>
        }
      />

      <AppInput
        isBgWhite
        label={isReadOnly ? undefined : 'Label tombol salin'}
        placeholder="Salin kode verifikasi"
        value={formData.actions?.[0]?.copy_code_text || ''}
        onChange={(e) =>
          updateField('actions', [{ type: 'COPY_CODE', copy_code_text: e.target.value }])
        }
        disabled={isReadOnly}
      />
    </Box>
  );

  const renderWhatsAppFlowsForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {bodyField('Isi survei singkat kami', QUICK_REPLY_BODY_MAX)}
      <AppInput
        isBgWhite
        label={isReadOnly ? undefined : 'Button text'}
        placeholder="Mulai"
        value={formData.button_text || ''}
        onChange={(e) => updateField('button_text', e.target.value)}
        disabled={isReadOnly}
      />
      <Box>
        <AppInput
          isBgWhite
          label={isReadOnly ? undefined : 'Flow ID'}
          placeholder="1232445823264765"
          required
          value={formData.flow_id || ''}
          onChange={(e) => updateField('flow_id', e.target.value)}
          disabled={isReadOnly}
        />
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          ID Flow yang sudah dipublikasikan di Meta Business Manager. Tipe ini
          merujuk Flow yang sudah ada — bukan membuatnya di sini.
        </Typography>
      </Box>
      <Box>
        <AppInput
          isBgWhite
          label={isReadOnly ? undefined : 'Flow token'}
          placeholder="{{1}}"
          value={formData.flow_token || ''}
          onChange={(e) => updateField('flow_token', e.target.value)}
          disabled={isReadOnly}
        />
        <AddVariableButton onAdd={() => handleAddVariable(formData.flow_token, 'flow_token')} isReadOnly={isReadOnly} />
        <RenderVariableSamples text={formData.flow_token} variables={variables} onVariablesChange={onVariablesChange} isReadOnly={isReadOnly} />
      </Box>
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
      case 'twilio/quick-reply':
        return renderQuickReplyForm();
      case 'twilio/list-picker':
        return renderListPickerForm();
      case 'twilio/card':
        return renderCardForm();
      case 'twilio/carousel':
        return renderCarouselForm();
      case 'whatsapp/card':
        return renderWhatsAppCardForm();
      case 'whatsapp/authentication':
        return renderAuthForm();
      case 'whatsapp/flows':
        return renderWhatsAppFlowsForm();
      default:
        // twilio/catalog and twilio/flows are not built yet and are disabled in
        // the selector; this branch only shows if one is reached another way.
        return (
          <Typography color="text.secondary">
            Editor untuk {type} belum tersedia.
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
