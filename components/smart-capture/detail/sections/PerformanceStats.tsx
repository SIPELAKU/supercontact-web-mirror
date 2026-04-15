import { LeadMagnet } from "../../LeadMagnetsTable";
import { Eye, CheckCircle2, TrendingUp } from "lucide-react";

interface PerformanceStatsProps {
  data: LeadMagnet;
}

export const PerformanceStats = ({ data }: PerformanceStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Views Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Eye size={20} />
          </div>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Views</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-gray-900">{data.views.toLocaleString()}</h2>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp size={12} /> +12.5%
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2 italic">Total unique visitors to the magnet link/form.</p>
      </div>

      {/* Valid Leads Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Validated Leads</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-gray-900">{data.leadsValid.toLocaleString()}</h2>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">New Today: 4</span>
        </div>
        <p className="text-xs text-gray-400 mt-2 italic">Prospects who have verified their contact info.</p>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <TrendingUp size={20} />
          </div>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-[#16A34A]">{data.conversion}%</h2>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-green-500" 
               style={{ width: `${data.conversion}%` }}
             />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 italic">Percentage of views that became validated leads.</p>
      </div>
    </div>
  );
};
