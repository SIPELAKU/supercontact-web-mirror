"use client";

import React from "react";
import { Loader2, RotateCcw } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectWebWidgetForm from "@/components/omnichannel/ConnectWebWidgetForm";
import WebWidgetConfigPanel from "@/components/omnichannel/WebWidgetConfigPanel";
import WebWidgetEmbedGuide from "@/components/omnichannel/WebWidgetEmbedGuide";
import AccountList from "@/components/omnichannel/AccountList";
import { useAccounts, useReactivateAccount } from "@/lib/hooks/useOmnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

export default function SettingsWebWidgetPage() {
  // v1 configures/embeds only the first widget account - multiple widgets
  // managed at once is an explicit non-goal for now (see plans/), the data
  // model already supports more, agents can still connect + delete extras
  // below via the generic AccountList.
  //
  // GET /accounts now returns inactive (deleted) accounts too, so agents can
  // reactivate them below - but that means an active widget must be
  // preferred here, or a deleted one would silently take over this panel
  // with no obvious way back to creating/reactivating.
  const { data: accounts, isLoading } = useAccounts("web_widget", true);
  const primaryAccount = accounts?.find((a) => a.is_active) ?? accounts?.[0];
  const reactivateAccountMutation = useReactivateAccount();

  const handleReactivate = async () => {
    if (!primaryAccount) return;
    try {
      await reactivateAccountMutation.mutateAsync(primaryAccount.id);
      notify.success("Widget Reactivated", { description: "This widget is accepting messages again." });
    } catch (error: any) {
      notify.error("Error", { description: handleError(error, "Reactivate Widget") });
    }
  };

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
          {!primaryAccount.is_active && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-amber-800">
                <strong>{primaryAccount.display_name}</strong> is deactivated — visitors can&apos;t start new
                chats until you reactivate it.
              </p>
              <button
                type="button"
                onClick={handleReactivate}
                disabled={reactivateAccountMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {reactivateAccountMutation.isPending ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <RotateCcw size={14} />
                )}
                Reactivate
              </button>
            </div>
          )}

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
