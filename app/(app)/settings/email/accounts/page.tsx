"use client";

import React from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectEmailForm from "@/components/omnichannel/ConnectEmailForm";
import AccountList from "@/components/omnichannel/AccountList";

export default function SettingsEmailAccountsPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Email Accounts"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Email" }, { label: "Accounts" }]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Gmail Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect your own Gmail account to manage email conversations. Teammates can each connect their own mailbox too.
          </p>
          <ConnectEmailForm />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Email Accounts</h2>
          <AccountList channelType="email" />
        </div>
      </div>
    </div>
  );
}
