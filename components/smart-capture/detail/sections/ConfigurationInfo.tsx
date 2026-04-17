import { useState, useEffect, useCallback } from "react";
import { SmartCapture } from "@/lib/models/types";
import { Link2, Zap, Gift, Copy } from "lucide-react";
import { notify } from "@/lib/notifications";

interface ConfigurationInfoProps {
  data: SmartCapture;
}

export const ConfigurationInfo = ({ data }: ConfigurationInfoProps) => {
  const [magnetUrl, setMagnetUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && data.code) {
      setMagnetUrl(`${window.location.origin}/m/${data.code}`);
    }
  }, [data.code]);

  const copyToClipboard = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    notify.success("Link copied to clipboard!");
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">Magnet Configuration</h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Public Link */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Public Magnet Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm text-gray-600 truncate">
              <Link2 size={14} className="text-gray-400 shrink-0" />
              {magnetUrl}
            </div>
            <button
              onClick={() => copyToClipboard(magnetUrl)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
              title="Copy Link"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Trigger */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Capture Trigger</p>
              <p className="text-sm font-medium text-gray-900">Direct Form Link</p>
              <p className="text-xs text-gray-400 mt-1">Users fill a form before receiving the reward.</p>
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
              <Gift size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Reward Asset</p>
              <p 
                className="text-sm font-medium text-gray-900 truncate hover:underline cursor-pointer transition-all hover:text-blue-600"
                onClick={() => {
                  const file = data.files?.[0];
                  if (file?.file_url) window.open(file.file_url, '_blank');
                }}
                title={data.files?.[0]?.file_name ? "Click to open asset" : ""}
              >
                {data.files && data.files.length > 0 ? data.files[0].file_name : "No asset uploaded"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.files && data.files.length > 0
                  ? `${(data.files[0].file_size / 1024 / 1024).toFixed(1)} MB`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
