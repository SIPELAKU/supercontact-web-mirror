"use client";

import { useState } from "react";
import { Users, UsersRound } from "lucide-react";
import { AppTabs } from "@/components/ui/app-tabs";
import { usePermission } from "@/lib/hooks/usePermission";
import AgentRosterTab from "./AgentRosterTab";
import AgentGroupsTab from "./AgentGroupsTab";

type AgentAdminTab = "roster" | "groups";

// Tenant admin console for support agents. Two tabs:
//   - Roster: read-only view of every agent and the groups they belong to.
//   - Groups: create/edit/delete agent groups (teams) and manage members.
// All write controls are gated in-UI by the `agents:manage` permission; the
// route itself is gated by `agents:read` via the Settings layout.
export default function AgentAdminClient() {
  const [tab, setTab] = useState<AgentAdminTab>("roster");
  const { can } = usePermission();
  const canManage = can("agents:manage");

  return (
    <div className="flex flex-col gap-4">
      <AppTabs<AgentAdminTab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "roster", label: "Roster", icon: <Users size={16} /> },
          { value: "groups", label: "Groups", icon: <UsersRound size={16} /> },
        ]}
      />

      {tab === "roster" ? <AgentRosterTab /> : <AgentGroupsTab canManage={canManage} />}
    </div>
  );
}
