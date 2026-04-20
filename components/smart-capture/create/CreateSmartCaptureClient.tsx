"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Layers, MessageSquare, Code, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';

import { AppButton } from '@/components/ui/app-button';
import RewardSetupTab from './RewardSetupTab';
import DynamicFormTab from './DynamicFormTab';
import OutreachHookTab from './OutreachHookTab';
import EmbedShareTab from './EmbedShareTab';
import { FormField, SmartCaptureCreateReq, SmartCapture } from '@/lib/models/types';
import { createSmartCapture, updateSmartCapture } from '@/lib/api';
import { notify } from '@/lib/notifications';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const DEFAULT_FIELDS: FormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, sort_order: 0, sorting_id: 'core-name' },
  { name: 'email', label: 'Email Address', type: 'email', required: true, sort_order: 1, sorting_id: 'core-email' },
  { name: 'phone_number', label: 'Phone Number', type: 'text', required: true, sort_order: 2, sorting_id: 'core-phone' },
];

interface CreateSmartCaptureClientProps {
  initialData?: SmartCapture;
  mode?: 'create' | 'edit';
}

export default function CreateSmartCaptureClient({ 
  initialData, 
  mode = 'create' 
}: CreateSmartCaptureClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<SmartCapture | null>(null);

  const [formData, setFormData] = useState<SmartCaptureCreateReq>({
    name: initialData?.name || '',
    action: 'draft',
    email_subject: initialData?.email_subject || '',
    email_body: initialData?.email_body || '',
    form_title: initialData?.form_title || '',
    form_description: initialData?.form_description || '',
    target: initialData?.target || 'email',
    content_template: initialData?.content_template || 'Hello {{target_name}}, I see {{company_name}} is growing. I have a free {{asset_name}} for your team\'s reference. Please check it here: {{magnet_link}}',
    file_ids: initialData?.files?.map(f => f.id) || [],
    form_fields: initialData?.form_fields?.map(f => ({
      name: f.name,
      label: f.label,
      type: f.field_type || f.type || 'text',
      required: f.required,
      sort_order: f.sort_order,
      options: f.options,
      sorting_id: f.sorting_id
    })) || DEFAULT_FIELDS,
    mail_sender_id: initialData?.mail_sender_id || '',
  });

  const TABS = [
    { id: 1, label: '1. Reward Setup', icon: FileText },
    { id: 2, label: '2. Dynamic Form', icon: Layers },
    { id: 3, label: '3. Outreach Hook', icon: MessageSquare },
  ];

  const updateFormData = (updates: Partial<SmartCaptureCreateReq>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async (action: 'draft' | 'publish') => {
    if (!formData.name) {
      notify.error("Campaign name is required");
      setActiveTab(1);
      return;
    }

    if (!formData.file_ids || formData.file_ids.length === 0) {
      notify.error("Please upload at least one media asset (Lead Magnet)");
      setActiveTab(1);
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get('access_token') as string;
      const payload = { ...formData, action };

      let response;
      if (mode === 'edit' && initialData?.id) {
        response = await updateSmartCapture(token, initialData.id, payload);
      } else {
        response = await createSmartCapture(token, payload);
      }

      if (response.success) {
        if (action === 'publish') {
          setSuccessData(response.data);
          notify.success(`Smart Capture ${mode === 'edit' ? 'updated and ' : ''}published successfully!`);
        } else {
          notify.success(`${mode === 'edit' ? 'Draft updated' : 'Draft saved'} successfully!`);
          router.push('/smart-capture');
        }
      }
    } catch (error: any) {
      notify.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6 pb-20">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <AppButton
            variantStyle="outline"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.push('/smart-capture')}
            className="rounded-lg shadow-sm"
          >
            Back
          </AppButton>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {mode === 'edit' ? 'Edit Lead Magnet' : 'Create New Lead Magnet'}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Lead Magnets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AppButton
            variantStyle="outline"
            color="primary"
            className="rounded-lg"
            onClick={() => handleSave('draft')}
            disabled={isLoading}
          >
            {isLoading && formData.action === 'draft' ? "Saving..." : "Save As Draft"}
          </AppButton>
          <AppButton
            variantStyle="primary"
            className="rounded-lg"
            onClick={() => handleSave('publish')}
            disabled={isLoading}
          >
            {isLoading && formData.action === 'publish' ? "Publishing..." : "Publish And Finish"}
          </AppButton>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 bg-white rounded-xl border border-gray-200 p-4 shrink-0 shadow-sm flex flex-col gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${isActive
                  ? 'bg-blue-100/50 text-[#5479EE]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-[#5479EE]' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full">
          {activeTab === 1 && (
            <RewardSetupTab 
              formData={formData} 
              updateFormData={updateFormData} 
              initialFiles={initialData?.files}
            />
          )}
          {activeTab === 2 && <DynamicFormTab formData={formData} updateFormData={updateFormData} />}
          {activeTab === 3 && <OutreachHookTab formData={formData} updateFormData={updateFormData} />}
        </div>

      </div>

      {/* Success Modal */}
      <Dialog
        open={!!successData}
        onOpenChange={(open) => !open && router.push('/smart-capture')}
        maxWidth="sm"
      >
        <div className="overflow-hidden">
          {/* Modal Header */}
          <div className="bg-linear-to-br from-[#5479EE] to-[#3F66E0] p-10 text-white text-center flex flex-col items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-400 rounded-full blur-2xl" />
            </div>

            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-xl animate-in zoom-in duration-500">
              <CheckCircle2 size={48} className="text-white drop-shadow-md" />
            </div>

            <div className="space-y-2 z-10">
              <h2 className="text-3xl font-extrabold tracking-tight">Smart Capture Published!</h2>
              <p className="text-blue-100 text-sm font-medium opacity-90 max-w-sm mx-auto leading-relaxed">
                Your lead magnet is now live. Share the link or embed it to start capturing high-quality leads.
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-10 -mt-6 bg-white rounded-t-[2.5rem] z-20 relative shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.05)]">
            <EmbedShareTab code={successData?.code || ''} />

            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-center">
              <AppButton
                variantStyle="primary"
                className="px-12 py-6 rounded-2xl text-base font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95"
                onClick={() => router.push('/smart-capture')}
              >
                Return to Dashboard
              </AppButton>
            </div>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
