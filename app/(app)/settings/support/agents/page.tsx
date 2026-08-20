"use client";

import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import AgentAdminClient from "@/components/admin/agent-admin/AgentAdminClient";

export default function SettingsSupportAgentsPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SettingsPageHeader
        title="Agents"
        description="Manage your support agents and organize them into groups (teams)."
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Support", href: "/settings/support" },
          { label: "Agents" },
        ]}
      />
      <AgentAdminClient />
    </div>
  );
}
