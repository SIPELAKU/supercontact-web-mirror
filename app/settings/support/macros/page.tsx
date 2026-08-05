"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import MacrosSettingsTab from "@/components/admin/ticket-settings/MacrosSettingsTab";

export default function SettingsSupportMacrosPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Macros"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "Macros" }]}
      />
      <MacrosSettingsTab />
    </div>
  );
}
