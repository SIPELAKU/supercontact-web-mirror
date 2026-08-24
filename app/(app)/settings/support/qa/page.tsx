"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import QaScorecardsSettingsTab from "@/components/admin/ticket-settings/QaScorecardsSettingsTab";

export default function SettingsSupportQaPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="QA Scorecards"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "QA Scorecards" }]}
      />
      <QaScorecardsSettingsTab />
    </div>
  );
}
