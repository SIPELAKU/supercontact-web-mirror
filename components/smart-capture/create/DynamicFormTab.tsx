import { Plus, CheckCircle2, Circle, Trash2, GripVertical, Settings2, HelpCircle, ChevronRight, Lock } from 'lucide-react';
import { SmartCaptureCreateReq, FormField } from '@/lib/models/types';
import { Box, Tooltip } from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DynamicFormTabProps {
  formData: SmartCaptureCreateReq;
  updateFormData: (updates: Partial<SmartCaptureCreateReq>) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
];

/**
 * Smart mapping for labels to aliases (system names) and types
 */
const getMappingForLabel = (label: string) => {
  const l = label.toLowerCase();

  // High-priority exact matches / starters
  if (l.includes('email')) return { name: 'email', type: 'email' };
  if (l.includes('full name') || (l.startsWith('name') && l.length < 10) || l === 'nama') return { name: 'name', type: 'text' };
  if (l.includes('wa') || l.includes('phone') || l.includes('whatsapp') || l.includes('telp') || l.includes('hp')) return { name: 'phone_number', type: 'text' };

  // Specific reference matches
  if (l.includes('description') || l.includes('deskripsi') || l.includes('catatan')) return { name: 'description', type: 'textarea' };
  if (l.includes('interest') || l.includes('tertarik') || l.includes('minat')) return { name: 'product_interest', type: 'dropdown' };
  if (l.includes('method') || l.includes('cara hubungi')) return { name: 'preferred_contact_method', type: 'radio' };
  if (l.includes('channel') || l.includes('sosmed') || l.includes('media')) return { name: 'social_media_channels', type: 'checkbox' };

  // Generic company mapping
  if (l.includes('perusahaan') || l.includes('company')) return { name: 'company_name', type: 'text' };

  return null;
};

export default function DynamicFormTab({ formData, updateFormData }: DynamicFormTabProps) {
  const fields = formData.form_fields || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const coreFieldNames = ['name', 'email', 'phone_number'];

  const addField = () => {
    const newField: FormField = {
      name: `field_${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false,
      sort_order: fields.length,
      options: [],
      sorting_id: `field_${Date.now()}`,
    };
    updateFormData({ form_fields: [...fields, newField] });
  };

  const removeField = (index: number) => {
    const field = fields[index];
    if (coreFieldNames.includes(field.name)) return; // Prevent deletion of core fields

    const newFields = [...fields];
    newFields.splice(index, 1);
    
    // Maintain sort order consistency
    const reorderedFields = newFields.map((f, i) => ({ ...f, sort_order: i }));
    updateFormData({ form_fields: reorderedFields });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    updateFormData({ form_fields: newFields });
  };

  const addOption = (index: number) => {
    const currentOptions = fields[index].options || [];
    updateField(index, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const currentOptions = [...(fields[fieldIndex].options || [])];
    currentOptions[optionIndex] = value;
    updateField(fieldIndex, { options: currentOptions });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const currentOptions = [...(fields[fieldIndex].options || [])];
    currentOptions.splice(optionIndex, 1);
    updateField(fieldIndex, { options: currentOptions });
  };

  const handleLabelChange = (index: number, label: string) => {
    const field = fields[index];
    const isCore = coreFieldNames.includes(field.name);
    const updates: Partial<FormField> = { label };

    if (!isCore) {
      // Sync name with label: lowercase and spaces to underscores
      updates.name = label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      // Still attempt to auto-set type if it looks like a known field
      const mapping = getMappingForLabel(label);
      if (mapping) {
        updates.type = mapping.type;
        if (['dropdown', 'radio', 'checkbox'].includes(mapping.type) && (!field.options || field.options.length === 0)) {
          updates.options = ['Option 1', 'Option 2'];
        }
      }
    }

    updateField(index, updates);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => (f.sorting_id || f.name || f.id) === active.id);
      const newIndex = fields.findIndex((f) => (f.sorting_id || f.name || f.id) === over.id);

      // Restriction: Prevent moving core fields OR moving custom fields into core field positions
      if (oldIndex < 3 || newIndex < 3) {
        return;
      }

      const newFieldsArr = arrayMove(fields, oldIndex, newIndex);
      
      // Update sort_order for all fields
      const sortedFields = newFieldsArr.map((f, i) => ({
        ...f,
        sort_order: i,
      }));

      updateFormData({ form_fields: sortedFields });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Form Builder Column */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Form Builder</h2>
          <Tooltip title="Form fields are exported as {name, value} for CRM mapping" arrow>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 cursor-help bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <HelpCircle size={12} />
              <span>Mapping Info</span>
            </div>
          </Tooltip>
        </div>

        <div className="space-y-4">
          {/* Header Form */}
          <div className="p-4 border border-blue-100 bg-blue-50/10 rounded-xl space-y-4">
            <h3 className="font-semibold text-blue-600 text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={12} />
              Form Identification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Form Title</label>
                <input
                  type="text"
                  value={formData.form_title || ''}
                  onChange={(e) => updateFormData({ form_title: e.target.value })}
                  placeholder="e.g., Template SOP Sales 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] bg-white transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Short Description</label>
                <textarea
                  value={formData.form_description || ''}
                  onChange={(e) => updateFormData({ form_description: e.target.value })}
                  placeholder="Please complete the data below to get instant access..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] min-h-[40px] bg-white transition-all shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Form Fields Mapping */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Questions & Mapping</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 uppercase font-bold">{fields.length} Fields</span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.sorting_id || f.id || f.name || '')}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <SortableFieldItem
                      key={field.sorting_id || field.id || field.name}
                      field={field}
                      index={index}
                      coreFieldNames={coreFieldNames}
                      updateField={updateField}
                      handleLabelChange={handleLabelChange}
                      removeField={removeField}
                      addOption={addOption}
                      updateOption={updateOption}
                      removeOption={removeOption}
                    />
                  ))}

                  {/* Add Field Button */}
                  <button
                    onClick={addField}
                    className="w-full py-4 border-2 border-dashed border-[#5479EE]/30 text-[#5479EE] hover:bg-[#5479EE]/5 rounded-2xl flex justify-center items-center gap-2 font-bold text-sm transition-all hover:border-[#5479EE] mt-4 group"
                  >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    Add New Question
                  </button>
                </div>
              </SortableContext>
            </DndContext>
          </div>

        </div>
      </div>

      {/* Live Preview Column */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="sticky top-6 bg-gray-50/50 rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-[0.2em]">Live Preview</h3>

          {/* Card Preview Frame */}
          <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
            <div className="h-1.5 bg-linear-to-r from-blue-400 to-indigo-500" />

            <div className="p-8">
              <h4 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">{formData.form_title || "Your Resource Title"}</h4>
              <p className="text-[13px] text-gray-500 mb-8 leading-relaxed">{formData.form_description || "Example description text for your lead magnet resource..."}</p>

              <div className="space-y-5">
                {fields.map((field, idx) => (
                  <div key={`preview-${idx}`} className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">
                      {field.label} {field.required && '*'}
                    </label>

                    {/* Dynamic Field Renderer */}
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.label}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50/50 placeholder-gray-300 italic min-h-[80px] resize-none"
                      />
                    ) : field.type === 'dropdown' ? (
                      <div className="relative">
                        <select disabled className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50/50 text-gray-300 italic appearance-none">
                          <option>{field.label}...</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/50 border border-gray-50">
                            <div className="w-3 h-3 rounded-full border border-gray-300" />
                            <span className="text-xs text-gray-400 italic">{opt}</span>
                          </div>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-2">
                        {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/50 border border-gray-50">
                            <div className="w-3 h-3 rounded-md border border-gray-300" />
                            <span className="text-xs text-gray-400 italic">{opt}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={field.type === 'email' ? 'email' : 'text'}
                        placeholder={field.label}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50/50 placeholder-gray-300 italic"
                      />
                    )}
                  </div>
                ))}

                <button className="w-full mt-4 bg-[#5479EE] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#3F66E0] transition-all active:scale-[0.98]">
                  Get Access Now
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-gray-400 font-medium italic">
            Fields will be mapped using their System Name.
          </p>
        </div>
      </div>

    </div>
  );
}

// Sub-component for Sortable List Item
function SortableFieldItem({
  field,
  index,
  coreFieldNames,
  updateField,
  handleLabelChange,
  removeField,
  addOption,
  updateOption,
  removeOption,
}: {
  field: FormField;
  index: number;
  coreFieldNames: string[];
  updateField: (i: number, u: Partial<FormField>) => void;
  handleLabelChange: (i: number, l: string) => void;
  removeField: (i: number) => void;
  addOption: (i: number) => void;
  updateOption: (fi: number, oi: number, v: string) => void;
  removeOption: (fi: number, oi: number) => void;
}) {
  const isCore = coreFieldNames.includes(field.name);
  const isChoiceField = ['dropdown', 'radio', 'checkbox'].includes(field.type || '');
  
  // Custom required logic
  const isEmail = field.name === 'email';
  const isRequiredDisabled = isEmail; // As per request: "email (disable)"
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: field.sorting_id || field.id || field.name || '',
    disabled: isCore, // Restriction: "tidak bisa diubah urutan card nya"
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col p-5 border rounded-2xl bg-white transition-all group relative ${
        isCore ? 'border-gray-100 bg-gray-50/30' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
      }`}
    >
      {/* Row 1: Label and Visibility */}
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1">
          {isCore ? (
            <div className="text-gray-200 px-1">
               <Lock size={18} />
            </div>
          ) : (
            <div {...attributes} {...listeners} className="text-gray-300 cursor-grab active:cursor-grabbing px-1 hover:text-blue-400 transition-colors">
              <GripVertical size={18} />
            </div>
          )}
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleLabelChange(index, e.target.value)}
            placeholder="Field Label (e.g., Your Business Email)"
            className="bg-transparent border-none focus:ring-0 font-bold text-[15px] text-gray-800 p-0 w-full placeholder:text-gray-300"
          />
        </div>

        <div className="flex items-center gap-4">
          <div
            onClick={() => !isRequiredDisabled && updateField(index, { required: !field.required })}
            className={`flex items-center gap-1.5 select-none ${isRequiredDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
          >
            {field.required ? (
              <CheckCircle2 className={`w-5 h-5 ${isRequiredDisabled ? 'text-gray-400' : 'text-[#5479EE]'}`} />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
            <span className={`text-[11px] font-bold uppercase tracking-tight ${field.required ? (isRequiredDisabled ? 'text-gray-400' : 'text-[#5479EE]') : 'text-gray-400'}`}>
              Required
            </span>
          </div>

          {!isCore && (
            <button
              onClick={() => removeField(index)}
              className="text-gray-300 hover:text-red-500 transition-colors bg-gray-50 group-hover:bg-red-50 p-1.5 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          )}
          {isCore && (
            <div className="w-8 h-8 rounded-lg bg-gray-100/30 flex items-center justify-center text-gray-300">
               <Trash2 size={16} className="opacity-20" />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Field Type Selection (System Name is now hidden and auto-synced) */}
      <div className="grid grid-cols-1 gap-4 py-4 border-t border-gray-50 mt-1">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Field Type</label>
          <select
            value={field.type}
            disabled={isCore}
            onChange={(e) => updateField(index, { type: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-[13px] focus:outline-none appearance-none transition-all ${
              isCore
                ? 'bg-gray-100/50 border-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-50 border-gray-200 focus:ring-1 focus:ring-blue-500 cursor-pointer'
            }`}
          >
            {FIELD_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Options (Only for dropdown/radio/checkbox) */}
      {isChoiceField && (
        <div className="pt-4 border-t border-gray-50 mt-1 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options List</label>
            <button
              onClick={() => addOption(index)}
              className="text-[10px] font-bold text-[#5479EE] uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              <Plus size={10} />
              Add Option
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(field.options || []).map((opt, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2 group/opt">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(index, optIndex, e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
                <button
                  onClick={() => removeOption(index, optIndex)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {(field.options || []).length === 0 && (
              <p className="text-[11px] text-gray-400 italic col-span-2 py-2">No options added. Add at least one option.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
