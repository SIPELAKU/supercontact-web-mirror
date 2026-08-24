"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import ConversationSlaSettingsTab from "@/components/admin/ticket-settings/ConversationSlaSettingsTab";

export default function SettingsSupportConversationSlaPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Conversation SLA"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Support", href: "/settings/support" },
          { label: "Conversation SLA" },
        ]}
      />
      <ConversationSlaSettingsTab />
    </div>
  );
}
