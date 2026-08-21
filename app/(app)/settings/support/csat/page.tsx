"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import CsatSettingsTab from "@/components/admin/ticket-settings/CsatSettingsTab";

export default function SettingsSupportCsatPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="CSAT Surveys"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Support", href: "/settings/support" },
          { label: "CSAT Surveys" },
        ]}
      />
      <CsatSettingsTab />
    </div>
  );
}
