"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import AutomationRulesSettingsTab from "@/components/admin/ticket-settings/AutomationRulesSettingsTab";

export default function SettingsSupportAutomationPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Automation"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "Automation" }]}
      />
      <AutomationRulesSettingsTab />
    </div>
  );
}
