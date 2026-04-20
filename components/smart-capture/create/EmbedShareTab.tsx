import { Copy, Code, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import { notify } from '@/lib/notifications';

interface EmbedShareTabProps {
  code: string;
}

export default function EmbedShareTab({ code }: EmbedShareTabProps) {
  const shareUrl = `${window.location.protocol}//${window.location.host}/m/${code}`;
  const embedCode = `<iframe src="${window.location.protocol}//${window.location.host}/forms/${code}/embed" width="100%" height="600px" frameborder="0" style="border:none;"></iframe>`;

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    notify.success(message);
  };

  return (
    <div className="bg-white rounded-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="space-y-10">
        {/* Direct Link Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-[#5479EE] rounded-lg border border-blue-100/50">
                <LinkIcon size={16} />
              </div>
              <span>Direct Link</span>
            </label>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Shareable URL</span>
          </div>
          
          <div className="group relative">
            <div className="flex flex-col sm:flex-row gap-4 p-1 rounded-[1.25rem] bg-gray-50/80 border border-gray-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-blue-500/5 transition-all duration-300">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-5 py-4 bg-transparent text-sm text-gray-600 font-medium focus:outline-none placeholder-gray-400"
              />
              <div className="flex gap-2 p-1">
                <button 
                  onClick={() => copyToClipboard(shareUrl, "Direct link copied")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-[#5479EE] text-sm font-bold hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 shadow-sm"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
                <button 
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#5479EE] text-white text-sm font-bold hover:bg-[#3F66E0] transition-all active:scale-95 shadow-md shadow-blue-500/20"
                >
                  <ExternalLink size={16} />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Website Embed Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/50">
                <Code size={16} />
              </div>
              <span>Website Embed Code</span>
            </label>
            <button 
                onClick={() => copyToClipboard(embedCode, "Embed code copied")}
                className="group flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
              >
                <Copy size={12} className="group-hover:scale-110 transition-transform" />
                <span>Copy Code</span>
            </button>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <textarea
              readOnly
              className="w-full px-6 py-6 border-none bg-transparent text-[13px] font-mono text-gray-500 leading-relaxed min-h-[140px] focus:outline-none resize-none"
              value={embedCode}
            ></textarea>
            
            <div className="absolute bottom-4 left-6 flex items-center gap-2.5">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
               <p className="text-[10px] font-bold text-gray-400 py-1 tracking-wider uppercase">Iframe snippet ready</p>
            </div>
          </div>
          
          <p className="px-1 text-[11px] text-gray-400 font-medium italic leading-relaxed">
            * Simply paste this snippet into your website's HTML body to display the form.
          </p>
        </div>
      </div>
    </div>
  );
}
