"use client";

import React from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectEmailForm from "@/components/omnichannel/ConnectEmailForm";
import AccountList from "@/components/omnichannel/AccountList";
import { useAccounts } from "@/lib/hooks/useOmnichannel";

export default function SettingsEmailAccountsPage() {
  const { data: accounts } = useAccounts();
  const hasExistingEmail = accounts?.some((account) => account.channel_type === "email") || false;

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
            Connect your Gmail account to manage email conversations. Only one email account is allowed per company.
          </p>
          <ConnectEmailForm hasExistingEmail={hasExistingEmail} />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Email Accounts</h2>
          <AccountList channelType="email" />
        </div>
      </div>
    </div>
  );
}
