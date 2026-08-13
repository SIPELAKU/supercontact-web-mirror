"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectWebWidgetForm from "@/components/omnichannel/ConnectWebWidgetForm";
import WebWidgetConfigPanel from "@/components/omnichannel/WebWidgetConfigPanel";
import WebWidgetEmbedGuide from "@/components/omnichannel/WebWidgetEmbedGuide";
import AccountList from "@/components/omnichannel/AccountList";
import { useAccounts } from "@/lib/hooks/useOmnichannel";

export default function SettingsWebWidgetPage() {
  // v1 configures/embeds only the first widget account - multiple widgets
  // managed at once is an explicit non-goal for now (see plans/), the data
  // model already supports more, agents can still connect + delete extras
  // below via the generic AccountList.
  const { data: accounts, isLoading } = useAccounts("web_widget");
  const primaryAccount = accounts?.[0];

  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Web Widget"
        description="Let visitors on your website start a live chat that becomes a real support ticket."
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Web Widget" }]}
      />

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : !primaryAccount ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create a Web Widget</h2>
            <p className="text-sm text-gray-600 mb-6">
              Creates a chat bubble you can embed on your website. Once created, you&apos;ll get a
              connection key and step-by-step install instructions below.
            </p>
            <ConnectWebWidgetForm />
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{primaryAccount.display_name}</h2>
            <p className="text-sm text-gray-600 mb-6">
              Customize how the widget looks and behaves for your visitors.
            </p>
            <WebWidgetConfigPanel accountId={primaryAccount.id} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <WebWidgetEmbedGuide widgetKey={primaryAccount.channel_identifier} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Widgets</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add another widget for a different brand or website, or remove one you no longer use.
            </p>
            <div className="mb-6">
              <ConnectWebWidgetForm />
            </div>
            <AccountList channelType="web_widget" />
          </div>
        </>
      )}
    </div>
  );
}
