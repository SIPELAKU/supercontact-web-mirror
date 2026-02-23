"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Plus, RefreshCw } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import PageHeader from "@/components/ui/page-header";
import InboxList from "@/components/omnichannel/InboxList";
import NewConversationModal from "@/components/omnichannel/NewConversationModal";
import { useRefreshEmail } from "@/lib/hooks/useOmnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

export default function OmnichannelPage() {
  const router = useRouter();
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const refreshEmailMutation = useRefreshEmail();

  const handleRefreshEmail = async (fullSync: boolean) => {
    try {
      await refreshEmailMutation.mutateAsync(fullSync);
      notify.success("Email Refreshed", { 
        description: fullSync ? "All emails have been synced." : "Recent emails have been synced." 
      });
    } catch (error: any) {
      const message = handleError(error, "Refresh Email");
      notify.error("Error", { description: message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="Omnichannel Inbox"
          description="Manage all your conversations in one place"
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Omnichannel" },
          ]}
        />

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <AppButton
              variantStyle="primary"
              onClick={() => setIsNewConversationOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              New Conversation
            </AppButton>

            <div className="flex items-center gap-2">
              <AppButton
                variantStyle="outline"
                color="gray"
                onClick={() => handleRefreshEmail(false)}
                disabled={refreshEmailMutation.isPending}
              >
                {refreshEmailMutation.isPending ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Refresh Email (24h)
              </AppButton>

              <AppButton
                variantStyle="outline"
                color="gray"
                onClick={() => handleRefreshEmail(true)}
                disabled={refreshEmailMutation.isPending}
              >
                Full Sync
              </AppButton>
            </div>
          </div>

          <AppButton
            variantStyle="outline"
            color="gray"
            onClick={() => router.push('/omnichannel/settings')}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </AppButton>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Channel</label>
              <AppSelect
                isBgWhite
                fullWidth
                size="small"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as string)}
                displayEmpty
                options={[
                  { value: "", label: "All Channels" },
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "email", label: "Email" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <AppSelect
                isBgWhite
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string)}
                displayEmpty
                options={[
                  { value: "", label: "All Status" },
                  { value: "open", label: "Open" },
                  { value: "closed", label: "Closed" },
                  { value: "archived", label: "Archived" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Inbox List */}
        <InboxList 
          channelType={channelFilter || undefined} 
          status={statusFilter || undefined} 
        />
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
      />
    </div>
  );
}
