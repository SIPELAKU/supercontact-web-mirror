"use client";

import React from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectMessengerForm from "@/components/omnichannel/ConnectMessengerForm";
import AccountList from "@/components/omnichannel/AccountList";

// Phase 9 Inc B: Facebook Messenger channel settings - mirrors
// settings/sms/page.tsx. Messenger conversations open in the Support Desk
// Workspace (conversation-first, like web-widget chats) - a Messenger user
// is identified by an opaque PSID, not a phone number or email.
export default function SettingsMessengerPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Messenger"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Messenger" }]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect a Facebook Page</h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect a Facebook Page to receive and reply to Messenger conversations. Incoming
            chats appear in the Support Workspace. Configure your Meta app&apos;s webhook to
            point at <code className="bg-gray-100 px-1 rounded">/api/v1/webhooks/meta</code> and
            subscribe the page to the app so Meta delivers its messages here.
          </p>
          <ConnectMessengerForm />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Facebook Pages</h2>
          <AccountList channelType="messenger" />
        </div>
      </div>
    </div>
  );
}
