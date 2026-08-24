"use client";

import React from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectInstagramForm from "@/components/omnichannel/ConnectInstagramForm";
import AccountList from "@/components/omnichannel/AccountList";

// Phase 9 Inc C: Instagram DM channel settings - mirrors
// settings/messenger/page.tsx. Instagram conversations open in the Support
// Desk Workspace (conversation-first, like Messenger and web-widget chats) -
// an Instagram user is identified by an opaque IGSID, not a phone number or
// email.
export default function SettingsInstagramPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Instagram"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Instagram" }]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect an Instagram Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect an Instagram professional (business or creator) account to receive and reply
            to Instagram DMs. Incoming chats appear in the Support Workspace. Instagram messaging
            uses the same Meta webhook as Messenger - point your Meta app&apos;s webhook at{" "}
            <code className="bg-gray-100 px-1 rounded">/api/v1/webhooks/meta</code> and subscribe
            it to Instagram messaging so Meta delivers DMs here.
          </p>
          <ConnectInstagramForm />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Instagram Accounts</h2>
          <AccountList channelType="instagram" />
        </div>
      </div>
    </div>
  );
}
