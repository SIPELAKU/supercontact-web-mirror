"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import SlaPolicySettingsTab from "@/components/admin/ticket-settings/SlaPolicySettingsTab";

export default function SettingsSupportSlaPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="SLA Policies"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "SLA Policies" }]}
      />
      <SlaPolicySettingsTab />
    </div>
  );
}
