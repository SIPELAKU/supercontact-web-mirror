// lib/types/agents.ts
// ---------------------------------------------------------------------------
// Agent Admin console types - the "manage agent support" half of the Support
// Desk program. Covers the read-only agent roster and the CRUD-able agent
// groups (teams) with their members.
//
// Permissions: reads need `agents:read`, all writes need `agents:manage`.
// ---------------------------------------------------------------------------

/** A user's role within an agent group. */
export type AgentGroupRole = "member" | "lead";

/** Lightweight group reference embedded in a roster row. */
export interface AgentRosterGroupRef {
  group_id: string;
  name: string;
  role: AgentGroupRole;
}

/** One agent as shown on the read-only roster (GET /agents). */
export interface AgentRosterItem {
  id: string;
  fullname: string;
  email: string;
  is_active: boolean;
  role_name: string | null;
  groups: AgentRosterGroupRef[];
}

/** Summary shape returned by the list/create/update group endpoints. */
export interface AgentGroup {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

/** One member of an agent group (GET /agent-groups/{id}). */
export interface AgentGroupMember {
  user_id: string;
  fullname: string;
  email: string;
  role: AgentGroupRole;
}

/** Group summary plus its expanded member list. */
export interface AgentGroupDetail extends AgentGroup {
  members: AgentGroupMember[];
}

// --- Request payloads --------------------------------------------------------

export interface CreateAgentGroupRequest {
  name: string;
  description?: string | null;
}

export interface UpdateAgentGroupRequest {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

export interface AddGroupMemberRequest {
  user_id: string;
  role: AgentGroupRole;
}

export interface UpdateGroupMemberRoleRequest {
  role: AgentGroupRole;
}
