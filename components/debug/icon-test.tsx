"use client";

import { BarChart3, Users } from "lucide-react";
import { useState } from "react";

export default function IconTest() {
  const [salesError, setSalesError] = useState(false);
  const [omnichannelError, setOmnichannelError] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-4">Icon Loading Test</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-20">Sales:</span>
          {salesError ? (
            <BarChart3 className="w-5 h-5 text-red-500" />
          ) : (
            <img
              src="/assets/sales-icon-sb.svg"
              alt="Sales"
              className="w-5 h-5"
              onError={() => setSalesError(true)}
            />
          )}
          <span className={salesError ? "text-red-500" : "text-green-500"}>
            {salesError ? "Failed - Using fallback" : "Loaded successfully"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-20">Omnichannel:</span>
          {omnichannelError ? (
            <Users className="w-5 h-5 text-red-500" />
          ) : (
            <img
              src="/assets/omnichannel.svg"
              alt="Omnichannel"
              className="w-5 h-5"
              onError={() => setOmnichannelError(true)}
            />
          )}
          <span className={omnichannelError ? "text-red-500" : "text-green-500"}>
            {omnichannelError ? "Failed - Using fallback" : "Loaded successfully"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-20">Logo:</span>
          <img
            src="/assets/sc-logo.png"
            alt="Logo"
            className="h-8 w-auto"
          />
          <span className="text-green-500">Logo test</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>This component helps debug icon loading issues.</p>
        <p>If icons show as fallbacks, check the console for errors.</p>
      </div>
    </div>
  );
}