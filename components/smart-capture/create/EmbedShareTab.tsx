import { Copy, Code, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';

interface EmbedShareTabProps {
  initialData?: any;
}

export default function EmbedShareTab({ initialData }: EmbedShareTabProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Embed & Share</h2>
      <p className="text-gray-600 text-sm mb-6">
        Share your form directly or embed it into your existing website to start capturing leads.
      </p>

      <div className="space-y-6">
        {/* Direct Link */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <LinkIcon size={16} className="text-gray-400" />
            Direct Link
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              value="https://supercontact.app/forms/smrt-cpt-2026"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE]"
            />
            <div className="flex gap-2">
              <AppButton variantStyle="outline" startIcon={<Copy size={16} />} className="rounded-lg">
                Copy
              </AppButton>
              <AppButton variantStyle="primary" startIcon={<ExternalLink size={16} />} className="rounded-lg">
                Preview
              </AppButton>
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Code size={16} className="text-gray-400" />
            Website Embed Code
          </label>
          <div className="relative">
            <textarea
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#5479EE] focus:border-[#5479EE] min-h-[120px]"
              value={`<iframe src="https://supercontact.app/forms/smrt-cpt-2026/embed" width="100%" height="600px" frameborder="0" style="border:none;"></iframe>`}
            ></textarea>
            <div className="absolute right-3 top-3">
              <AppButton variantStyle="outline" startIcon={<Copy size={14} />} className="rounded-lg px-3 py-1.5 h-auto text-xs bg-white">
                Copy Code
              </AppButton>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Paste this iframe code into your website's HTML to embed the form directly.
          </p>
        </div>
      </div>
    </div>
  );
}
