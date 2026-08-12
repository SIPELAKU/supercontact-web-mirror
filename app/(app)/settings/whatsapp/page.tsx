"use client";

import React from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectWhatsAppForm from "@/components/omnichannel/ConnectWhatsAppForm";
import AccountList from "@/components/omnichannel/AccountList";

export default function SettingsWhatsAppPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="WhatsApp"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "WhatsApp" }]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect a WhatsApp Number</h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect a WhatsApp Business number via Twilio to manage conversations. Connect
            multiple numbers to give each department or branch its own line.
          </p>
          <ConnectWhatsAppForm />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected WhatsApp Accounts</h2>
          <AccountList channelType="whatsapp" />
        </div>
      </div>
    </div>
  );
}
