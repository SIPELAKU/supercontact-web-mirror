import { SmartCapture } from "@/lib/models/types";
import { CheckCircle, MailOpen, MousePointer2, AlertCircle } from "lucide-react";

interface OutreachStatsProps {
  data: SmartCapture;
}

export const OutreachStats = ({ data }: OutreachStatsProps) => {
  const stats = data.log_stats || {
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0
  };

  const openRate = stats.delivered > 0
    ? ((stats.opened / stats.delivered) * 100).toFixed(1)
    : "0";

  const clickRate = stats.opened > 0
    ? ((stats.clicked / stats.opened) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 text-[#5479EE]">
        <h3 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-2">
           Outreach Performance
           <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Campaign Metrics</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivered Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-green-100 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-medium text-gray-500 block mb-0.5 uppercase tracking-wider">Delivered</span>
            <h2 className="text-xl font-bold text-gray-900 leading-none">{stats.delivered.toLocaleString()}</h2>
            <p className="text-[10px] text-gray-400 mt-1.5 italic">Total messages successfully delivered</p>
          </div>
        </div>

        {/* Opened Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-100 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
            <MailOpen size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Opened</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{openRate}%</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-none">{stats.opened.toLocaleString()}</h2>
            <p className="text-[10px] text-gray-400 mt-1.5 italic">Total messages opened by recipients</p>
          </div>
        </div>

        {/* Clicked Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
            <MousePointer2 size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Clicked</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">{clickRate}%</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-none">{stats.clicked.toLocaleString()}</h2>
            <p className="text-[10px] text-gray-400 mt-1.5 italic">Link/Button clicks within the message</p>
          </div>
        </div>

        {/* Bounced Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-red-100 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-medium text-gray-500 block mb-0.5 uppercase tracking-wider">Bounced</span>
            <h2 className="text-xl font-bold text-gray-900 leading-none">{stats.bounced.toLocaleString()}</h2>
            <p className="text-[10px] text-gray-400 mt-1.5 italic">Delivery failures or invalid contacts</p>
          </div>
        </div>
      </div>
    </div>
  );
};
