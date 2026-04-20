import { Copy } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import { SmartCaptureCreateReq } from '@/lib/models/types';
import { notify } from '@/lib/notifications';
import { useRef } from 'react';

interface OutreachHookTabProps {
  formData: SmartCaptureCreateReq;
  updateFormData: (updates: Partial<SmartCaptureCreateReq>) => void;
}

export default function OutreachHookTab({ formData, updateFormData }: OutreachHookTabProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const VARIABLES = [
    '{{target_name}}',
    '{{company_name}}',
    '{{asset_name}}',
    '{{magnet_link}}'
  ];

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content_template || '';
    const newText = text.substring(0, start) + variable + text.substring(end);
    
    updateFormData({ content_template: newText });
    
    // Focus back and set cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formData.content_template || '');
    notify.success("Template copied to clipboard");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Message Template (Hook)</h2>
          <p className="text-gray-600 text-sm">
            Use this template when sending messages via LinkedIn/WA to connect target data to the form.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Generator Block - Hidden as per user request */}
        {false && (
          <div className="bg-[#EEF2FF] rounded-xl p-5 border border-blue-100 flex flex-col gap-4">
            {/* ... */}
          </div>
        )}

        {/* Manual Variables */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Insert Manual Variables:</span>
            {VARIABLES.map((v) => (
              <span 
                key={v} 
                onClick={() => insertVariable(v)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors"
              >
                {v}
              </span>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] min-h-[200px]"
            value={formData.content_template}
            onChange={(e) => updateFormData({ content_template: e.target.value })}
            placeholder="Write your message template here..."
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex justify-end border-t pt-6">
          <AppButton
            variantStyle="primary"
            color="primary"
            startIcon={<Copy size={16} />}
            className="rounded-xl px-8"
            onClick={copyToClipboard}
          >
            Copy Template
          </AppButton>
        </div>
      </div>
    </div>
  );
}
