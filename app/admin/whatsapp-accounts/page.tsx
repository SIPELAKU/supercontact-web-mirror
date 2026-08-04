"use client";

import React from "react";
import PageHeader from "@/components/ui/page-header";
import ConnectWhatsAppForm from "@/components/omnichannel/ConnectWhatsAppForm";
import AccountList from "@/components/omnichannel/AccountList";
import { useAccounts } from "@/lib/hooks/useOmnichannel";
import { Loader2, MessageCircle } from "lucide-react";

export default function WhatsAppAccountsPage() {
  // Same query key as AccountList's own useAccounts('whatsapp') call below,
  // so both share one cache entry and never disagree on "is one connected".
  const { data: accounts, isLoading } = useAccounts("whatsapp");
  const hasAccount = !isLoading && !!accounts && accounts.length > 0;

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-8">
      <PageHeader
        title="WhatsApp Accounts"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin" },
          { label: "WhatsApp" },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect WhatsApp Account</h2>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
              <Loader2 className="animate-spin" size={16} />
              Checking connection status...
            </div>
          ) : hasAccount ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <MessageCircle className="text-green-600 mt-0.5" size={20} />
              <p className="text-sm text-green-800">
                Your WhatsApp number is connected. Delete it below to connect a different one.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Connect your WhatsApp Business account via Twilio to manage conversations.
              </p>
              <ConnectWhatsAppForm />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected WhatsApp Accounts</h2>
          <AccountList channelType="whatsapp" />
        </div>
      </div>
    </div>
  );
}
