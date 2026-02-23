"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Tabs, Tab, Box } from "@mui/material";
import ConnectWhatsAppForm from "@/components/omnichannel/ConnectWhatsAppForm";
import ConnectEmailForm from "@/components/omnichannel/ConnectEmailForm";
import AccountList from "@/components/omnichannel/AccountList";
import { useAccounts } from "@/lib/hooks/useOmnichannel";

export default function OmnichannelSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const { data: accounts } = useAccounts();

  const hasExistingEmail = accounts?.some(account => account.channel_type === 'email') || false;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-8">
            <AppButton
              variantStyle="outline"
              color="gray"
              size="small"
              onClick={() => router.push('/omnichannel')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Inbox
            </AppButton>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your communication channel connections</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="WhatsApp" />
              <Tab label="Email" />
            </Tabs>
          </Box>

          {/* WhatsApp Tab */}
          {activeTab === 0 && (
            <div className="p-6">
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
          )}

          {/* Email Tab */}
          {activeTab === 1 && (
            <div className="p-6">
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
          )}
        </div>
      </div>
    </div>
  );
}
