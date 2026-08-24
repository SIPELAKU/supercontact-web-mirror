"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CannedRepliesSettingsTab from "@/components/admin/ticket-settings/CannedRepliesSettingsTab";

export default function SettingsSupportCannedRepliesPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Canned Replies"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Support", href: "/settings/support" },
          { label: "Canned Replies" },
        ]}
      />
      <CannedRepliesSettingsTab />
    </div>
  );
}
