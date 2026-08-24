"use client";

import { useState } from "react";
import { Tags, Users, UsersRound } from "lucide-react";
import { AppTabs } from "@/components/ui/app-tabs";
import { usePermission } from "@/lib/hooks/usePermission";
import AgentRosterTab from "./AgentRosterTab";
import AgentGroupsTab from "./AgentGroupsTab";
import AgentSkillsTab from "./AgentSkillsTab";

type AgentAdminTab = "roster" | "groups" | "skills";

// Tenant admin console for support agents. Three tabs:
//   - Roster: every agent, their groups/skills/seat, and (for managers) a
//     per-agent editor for seat type, capacity and skills.
//   - Groups: create/edit/delete agent groups (teams) and manage members.
//   - Skills: the company skill vocabulary (create/edit/soft-delete).
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
          { value: "skills", label: "Skills", icon: <Tags size={16} /> },
        ]}
      />

      {tab === "roster" && <AgentRosterTab canManage={canManage} />}
      {tab === "groups" && <AgentGroupsTab canManage={canManage} />}
      {tab === "skills" && <AgentSkillsTab canManage={canManage} />}
    </div>
  );
}
