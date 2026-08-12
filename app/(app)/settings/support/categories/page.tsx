"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CategoriesSettingsTab from "@/components/admin/ticket-settings/CategoriesSettingsTab";

export default function SettingsSupportCategoriesPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Categories"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "Categories" }]}
      />
      <CategoriesSettingsTab />
    </div>
  );
}
