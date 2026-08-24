"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import TicketFormsSettingsTab from "@/components/admin/ticket-settings/TicketFormsSettingsTab";

export default function SettingsSupportTicketFormsPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Ticket Forms"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Support", href: "/settings/support" }, { label: "Ticket Forms" }]}
      />
      <TicketFormsSettingsTab />
    </div>
  );
}
