"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CustomFieldsSettingsTab from "@/components/admin/ticket-settings/CustomFieldsSettingsTab";

export default function SettingsSupportCustomFieldsPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Custom Fields"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "Custom Fields" }]}
      />
      <CustomFieldsSettingsTab />
    </div>
  );
}
