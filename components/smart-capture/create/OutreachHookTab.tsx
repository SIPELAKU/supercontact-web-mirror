import { Sparkles, Copy } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';

interface OutreachHookTabProps {
  initialData?: any;
}

export default function OutreachHookTab({ initialData }: OutreachHookTabProps) {
  const VARIABLES = [
    '{{target_name}}',
    '{{company_name}}',
    '{{asset_name}}',
    '{{magnet_link}}'
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Message Template (Hook)</h2>
      <p className="text-gray-600 text-sm mb-6">
        Use this template when sending messages via LinkedIn/WA to connect target data to the form.
      </p>

      <div className="space-y-6">
        {/* AI Generator Block */}
        <div className="bg-[#EEF2FF] rounded-xl p-5 border border-blue-100 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#5479EE]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Generate with Smart AI</h3>
              <p className="text-gray-600 text-xs">
                Tell us briefly about your event or lead magnet. Our AI will craft promotional words that are engaging and professional, complete with dynamic variables.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., B2B Seminar Event..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE]"
            />
            <AppButton variantStyle="primary" startIcon={<Sparkles size={16} />} className="rounded-lg shrink-0">
              Generate AI
            </AppButton>
          </div>
        </div>

        {/* Manual Variables */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Insert Manual Variables:</span>
            {VARIABLES.map((v) => (
              <span key={v} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                {v}
              </span>
            ))}
          </div>

          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] min-h-[160px]"
            defaultValue="Hello {{target_name}}, I see {{company_name}} is growing. I have a free {{asset_name}} for your team's reference. Please check it here: {{magnet_link}}"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <AppButton
            variantStyle="primary"
            color="primary"
            startIcon={<Copy size={16} />}
            className="rounded-lg"
          >
            Copy Template
          </AppButton>
        </div>
      </div>
    </div>
  );
}
