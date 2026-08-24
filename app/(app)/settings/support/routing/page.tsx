"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import RoutingQueuesSettingsTab from "@/components/admin/ticket-settings/RoutingQueuesSettingsTab";

export default function SettingsSupportRoutingPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Routing"
        description="Set your availability and capacity, and define the conversation queues agents pull work from."
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Support", href: "/settings/support" },
          { label: "Routing" },
        ]}
      />
      <RoutingQueuesSettingsTab />
    </div>
  );
}
