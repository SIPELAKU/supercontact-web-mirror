"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConnectWebWidgetForm from "@/components/omnichannel/ConnectWebWidgetForm";
import WebWidgetConfigPanel from "@/components/omnichannel/WebWidgetConfigPanel";
import WebWidgetEmbedGuide from "@/components/omnichannel/WebWidgetEmbedGuide";
import BotPlaygroundPanel from "@/components/omnichannel/BotPlaygroundPanel";
import AccountList from "@/components/omnichannel/AccountList";
import { useAccounts, useReactivateAccount } from "@/lib/hooks/useOmnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

export default function SettingsWebWidgetPage() {
  // Each connected widget now gets its own config + embed: when more than one
  // exists, a selector picks which one this page targets. The default falls
  // to the first ACTIVE account (or the first of any, so a deactivated widget
  // is still reachable to reactivate) - previously the whole page was locked
  // to that single "primary" account with no way to configure the others.
  //
  // GET /accounts also returns inactive (deleted) accounts so they can be
  // reactivated below via the generic AccountList / banner.
  const { data: accounts, isLoading } = useAccounts("web_widget", true);
  const reactivateAccountMutation = useReactivateAccount();

  const defaultAccount = accounts?.find((a) => a.is_active) ?? accounts?.[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Keep the selection valid as accounts load / change (e.g. after a delete).
  useEffect(() => {
    if (!accounts || accounts.length === 0) {
      setSelectedAccountId(null);
      return;
    }
    setSelectedAccountId((prev) =>
      prev && accounts.some((a) => a.id === prev) ? prev : (defaultAccount?.id ?? null),
    );
  }, [accounts, defaultAccount?.id]);

  const selectedAccount = useMemo(
    () => accounts?.find((a) => a.id === selectedAccountId) ?? defaultAccount,
    [accounts, selectedAccountId, defaultAccount],
  );

  const handleReactivate = async () => {
    if (!selectedAccount) return;
    try {
      await reactivateAccountMutation.mutateAsync(selectedAccount.id);
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
      ) : !selectedAccount ? (
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
          {accounts && accounts.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Configuring widget</label>
              <select
                value={selectedAccount.id}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="h-10 min-w-[220px] rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.display_name}
                    {a.is_active ? "" : " (deactivated)"}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                The configuration and embed snippet below apply to the selected widget.
              </p>
            </div>
          )}

          {!selectedAccount.is_active && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-amber-800">
                <strong>{selectedAccount.display_name}</strong> is deactivated — visitors can&apos;t start new
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
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedAccount.display_name}</h2>
            <p className="text-sm text-gray-600 mb-6">
              Customize how the widget looks and behaves for your visitors.
            </p>
            <WebWidgetConfigPanel key={selectedAccount.id} accountId={selectedAccount.id} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <BotPlaygroundPanel key={`playground-${selectedAccount.id}`} accountId={selectedAccount.id} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <WebWidgetEmbedGuide key={selectedAccount.id} widgetKey={selectedAccount.channel_identifier} />
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
