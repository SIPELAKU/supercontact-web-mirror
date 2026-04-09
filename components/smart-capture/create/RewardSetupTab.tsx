import { Upload } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';

export default function RewardSetupTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Reward (Lead Magnet) Setup</h2>

      <div className="space-y-6">
        {/* Campaign Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Campaign / Form Name</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] placeholder-gray-400"
            placeholder="e.g., Sales Strategy Ebook"
          />
        </div>

        {/* File Asset Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Asset File (Sent automatically via Email)</label>
          <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
              <Upload className="text-gray-500 w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Choose a file or drag & drop it here</h4>
            <p className="text-xs text-gray-500 mb-4">PDF, DOCX, or ZIP (Max 10MB)</p>
            <AppButton variantStyle="outline" color="primary" className="rounded-lg px-6 shadow-sm bg-white">
              Browse File
            </AppButton>
          </div>
        </div>

        {/* Auto Responder Email */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">Delivery Email (Auto-Responder)</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] placeholder-gray-400"
            placeholder="Subject: Here is what you requested..."
          />
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] placeholder-gray-400 min-h-[120px]"
            placeholder="Hello {{name}}, here is the file you requested..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}
