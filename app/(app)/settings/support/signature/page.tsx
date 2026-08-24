"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import SignatureSettingsTab from "@/components/admin/ticket-settings/SignatureSettingsTab";

export default function SettingsSupportSignaturePage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="My Signature"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "My Signature" }]}
      />
      <SignatureSettingsTab />
    </div>
  );
}
