"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import BusinessHoursSettingsTab from "@/components/admin/ticket-settings/BusinessHoursSettingsTab";

export default function SettingsSupportBusinessHoursPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Business Hours"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "Business Hours" }]}
      />
      <BusinessHoursSettingsTab />
    </div>
  );
}
