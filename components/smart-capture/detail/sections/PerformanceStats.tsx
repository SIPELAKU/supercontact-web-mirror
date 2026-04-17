import { SmartCapture } from "@/lib/models/types";
import { Eye, FileText, TrendingUp, Share2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";

interface PerformanceStatsProps {
  data: SmartCapture;
}

export const PerformanceStats = ({ data }: PerformanceStatsProps) => {
  // const conversionRate = data.views > 0
  //   ? ((data.valid_leads / data.views) * 100).toFixed(0)
  //   : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Views Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#F59E0B] shrink-0">
          <Eye size={28} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-500">Total Views</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <TrendingUp size={10} />
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-none">{data.views.toLocaleString()}</h2>
          <p className="text-[10px] text-gray-400 mt-2 line-clamp-1 italic">Total Unique Visitors to Magnet Links/Form</p>
        </div>
      </div>

      {/* Valid Leads Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] shrink-0">
          <FileText size={28} />
        </div>
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-sm font-medium text-gray-500">Total Valid Leads</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-none">{data.valid_leads.toLocaleString()}</h2>
          <p className="text-[10px] text-gray-400 mt-2 line-clamp-1 italic">Prospect who have verified their contacts info</p>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
          <TrendingUp size={28} />
        </div>
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-sm font-medium text-gray-500">Avg. Conversion Rate</span>
          </div>
          <h2 className="text-2xl font-bold text-[#10B981] leading-none">{data.conversions}%</h2>
          <p className="text-[10px] text-gray-400 mt-2 line-clamp-1 italic">Percentage of views that become validated leads</p>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-[#1E293B] p-6 rounded-2xl text-white shadow-inner overflow-hidden relative flex flex-col justify-center min-h-[120px]">
        <div className="absolute top-[-10px] right-[-10px] opacity-10 pointer-events-none">
          <Share2 size={100} />
        </div>
        <div className="relative z-10">
          <h4 className="font-bold text-base mb-1">Live Preview</h4>
          <p className="text-[10px] text-slate-400 mb-4 font-light max-w-[150px]">See how your magnet appears to prospect in real-time.</p>
          <AppButton
            variantStyle="white"
            className="w-full h-10 border-none font-bold text-xs"
            onClick={() => window.open(`/m/${data.code}`, '_blank')}
          >
            Open Preview
          </AppButton>
        </div>
      </div>
    </div>
  );
};
