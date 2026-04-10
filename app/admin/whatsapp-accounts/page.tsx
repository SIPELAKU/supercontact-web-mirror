"use client";

import React from "react";
import PageHeader from "@/components/ui/page-header";
import ConnectWhatsAppForm from "@/components/omnichannel/ConnectWhatsAppForm";
import AccountList from "@/components/omnichannel/AccountList";

export default function WhatsAppAccountsPage() {
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
          <p className="text-sm text-gray-600 mb-6">
            Connect your WhatsApp Business account via Twilio to manage conversations.
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
