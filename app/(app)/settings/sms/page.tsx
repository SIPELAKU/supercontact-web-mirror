"use client";

import React from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectSmsForm from "@/components/omnichannel/ConnectSmsForm";
import AccountList from "@/components/omnichannel/AccountList";

// Phase 9 Inc A: SMS channel settings - mirrors settings/whatsapp/page.tsx.
export default function SettingsSmsPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="SMS"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "SMS" }]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect an SMS Number</h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect a Twilio phone number to send and receive plain SMS conversations. The same
            number can also be connected as WhatsApp - the two channels keep separate
            conversation streams.
          </p>
          <ConnectSmsForm />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected SMS Numbers</h2>
          <AccountList channelType="sms" />
        </div>
      </div>
    </div>
  );
}
