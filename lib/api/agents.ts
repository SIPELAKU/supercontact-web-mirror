// lib/api/agents.ts
// ---------------------------------------------------------------------------
// Agent Admin console API layer. Follows the exact client/auth/error pattern
// of lib/api/omnichannel.ts: Bearer token, `json.data || json` unwrapping,
// throw the parsed body on !ok, and a dedicated UNAUTHORIZED throw on 401.
//
// Backend responses use a `{ data: ... }` envelope. Note the roster endpoint
// double-nests its payload as `{ data: { data: [...] } }` (handled below).
// ---------------------------------------------------------------------------

import { fetchWithTimeout } from "./api-client";
import type {
  AgentRosterItem,
  AgentGroup,
  AgentGroupDetail,
  CreateAgentGroupRequest,
  UpdateAgentGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRoleRequest,
  AgentProfile,
  AgentPresenceStatus,
  UpdateRoutingProfileRequest,
  AgentSkill,
  CreateAgentSkillRequest,
  UpdateAgentSkillRequest,
  AdminUpdateAgentProfileRequest,
  ConversationQueue,
  CreateConversationQueueRequest,
  UpdateConversationQueueRequest,
  ClaimNextResult,
  RouteQueueNowResult,
} from "../types/agents";

// Re-export types for convenience (mirrors omnichannel.ts).
export type {
  AgentRosterItem,
  AgentGroup,
  AgentGroupDetail,
  AgentGroupMember,
  AgentGroupRole,
  AgentRosterGroupRef,
  AgentRosterSkillRef,
  CreateAgentGroupRequest,
  UpdateAgentGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRoleRequest,
  AgentProfile,
  AgentPresenceStatus,
  AgentSeatType,
  SetPresenceRequest,
  UpdateRoutingProfileRequest,
  AgentSkill,
  CreateAgentSkillRequest,
  UpdateAgentSkillRequest,
  AdminUpdateAgentProfileRequest,
  ConversationQueue,
  ConversationQueueChannelType,
  ConversationQueuePriority,
  RoutingStrategy,
  CreateConversationQueueRequest,
  UpdateConversationQueueRequest,
  ClaimNextResult,
  RouteQueueNowResult,
} from "../types/agents";

const ROSTER_BASE = `${process.env.NEXT_PUBLIC_API_URL}/agents`;
const GROUPS_BASE = `${process.env.NEXT_PUBLIC_API_URL}/agent-groups`;
const ME_BASE = `${process.env.NEXT_PUBLIC_API_URL}/agents/me`;
const SKILLS_BASE = `${process.env.NEXT_PUBLIC_API_URL}/agent-skills`;
const QUEUES_BASE = `${process.env.NEXT_PUBLIC_API_URL}/conversation-queues`;

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });
const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ---------------------------------------------------------------------------
// Agent roster (read-only)
// ---------------------------------------------------------------------------

/**
 * GET /agents -> { data: { data: AgentRosterItem[] } }.
 * The roster payload is double-nested: one `data` for the envelope, one more
 * for the list itself. We unwrap both defensively.
 */
export async function fetchAgentRoster(token: string): Promise<AgentRosterItem[]> {
  const res = await fetchWithTimeout(ROSTER_BASE, { headers: authHeaders(token) });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch agent roster");
  }

  const outer = json.data ?? json;
  const list = outer?.data ?? outer;
  return Array.isArray(list) ? list : [];
}

// ---------------------------------------------------------------------------
// Agent groups
// ---------------------------------------------------------------------------

/** GET /agent-groups?include_inactive=<bool> -> { data: AgentGroup[] }. */
export async function fetchAgentGroups(
  token: string,
  includeInactive?: boolean
): Promise<AgentGroup[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append("include_inactive", "true");

  const res = await fetchWithTimeout(`${GROUPS_BASE}?${params.toString()}`, {
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch agent groups");
  }

  const data = json.data || json;
  return Array.isArray(data) ? data : [];
}

/** GET /agent-groups/{id} -> { data: AgentGroupDetail }. */
export async function getAgentGroup(token: string, id: string): Promise<AgentGroupDetail> {
  const res = await fetchWithTimeout(`${GROUPS_BASE}/${id}`, { headers: authHeaders(token) });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch agent group");
  }

  return json.data || json;
}

/** POST /agent-groups -> { data: AgentGroup } (201). Duplicate name -> 400. */
export async function createAgentGroup(
  token: string,
  data: CreateAgentGroupRequest
): Promise<AgentGroup> {
  const res = await fetchWithTimeout(GROUPS_BASE, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to create agent group");
  }

  return json.data || json;
}

/** PATCH /agent-groups/{id} -> { data: AgentGroup }. */
export async function updateAgentGroup(
  token: string,
  id: string,
  data: UpdateAgentGroupRequest
): Promise<AgentGroup> {
  const res = await fetchWithTimeout(`${GROUPS_BASE}/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update agent group");
  }

  return json.data || json;
}

/** DELETE /agent-groups/{id} -> { data: { id, deleted: true } } (soft delete). */
export async function deleteAgentGroup(
  token: string,
  id: string
): Promise<{ id: string; deleted: boolean }> {
  const res = await fetchWithTimeout(`${GROUPS_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to delete agent group");
  }

  return json.data || json;
}

// ---------------------------------------------------------------------------
// Agent group members
// ---------------------------------------------------------------------------

/** POST /agent-groups/{id}/members -> { data: AgentGroupDetail }. */
export async function addGroupMember(
  token: string,
  groupId: string,
  data: AddGroupMemberRequest
): Promise<AgentGroupDetail> {
  const res = await fetchWithTimeout(`${GROUPS_BASE}/${groupId}/members`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to add group member");
  }

  return json.data || json;
}

/** PATCH /agent-groups/{id}/members/{user_id} -> { data: AgentGroupDetail }. */
export async function updateGroupMemberRole(
  token: string,
  groupId: string,
  userId: string,
  data: UpdateGroupMemberRoleRequest
): Promise<AgentGroupDetail> {
  const res = await fetchWithTimeout(`${GROUPS_BASE}/${groupId}/members/${userId}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update member role");
  }

  return json.data || json;
}

/** DELETE /agent-groups/{id}/members/{user_id} -> { data: { deleted: true } }. */
export async function removeGroupMember(
  token: string,
  groupId: string,
  userId: string
): Promise<{ deleted: boolean }> {
  const res = await fetchWithTimeout(`${GROUPS_BASE}/${groupId}/members/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to remove group member");
  }

  return json.data || json;
}

// ---------------------------------------------------------------------------
// Agent presence + self-service routing profile (Phase 4a)
// ---------------------------------------------------------------------------

/** GET /agents/me/presence -> { data: AgentProfile }. */
export async function fetchMyPresence(token: string): Promise<AgentProfile> {
  const res = await fetchWithTimeout(`${ME_BASE}/presence`, { headers: authHeaders(token) });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch presence");
  }

  return json.data || json;
}

/** PUT /agents/me/presence body { status } -> { data: AgentProfile }. */
export async function setMyPresence(
  token: string,
  status: AgentPresenceStatus
): Promise<AgentProfile> {
  const res = await fetchWithTimeout(`${ME_BASE}/presence`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({ status }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update presence");
  }

  return json.data || json;
}

/** PATCH /agents/me/routing-profile -> { data: AgentProfile }. */
export async function updateMyRoutingProfile(
  token: string,
  data: UpdateRoutingProfileRequest
): Promise<AgentProfile> {
  const res = await fetchWithTimeout(`${ME_BASE}/routing-profile`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update routing profile");
  }

  return json.data || json;
}

// ---------------------------------------------------------------------------
// Agent skills (Phase 1b): company skill vocabulary + per-agent assignment.
// ---------------------------------------------------------------------------

/**
 * GET /agent-skills?include_inactive=<bool> -> { data: { data: AgentSkill[] } }.
 * The list payload is double-nested (one `data` for the envelope, one more for
 * the list) - unwrap both defensively, mirroring the roster endpoint.
 */
export async function fetchAgentSkills(
  token: string,
  includeInactive?: boolean
): Promise<AgentSkill[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append("include_inactive", "true");

  const res = await fetchWithTimeout(`${SKILLS_BASE}?${params.toString()}`, {
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch agent skills");
  }

  const outer = json.data ?? json;
  const list = outer?.data ?? outer;
  return Array.isArray(list) ? list : [];
}

/** POST /agent-skills -> { data: AgentSkill } (201). Duplicate name -> 400. */
export async function createAgentSkill(
  token: string,
  data: CreateAgentSkillRequest
): Promise<AgentSkill> {
  const res = await fetchWithTimeout(SKILLS_BASE, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to create agent skill");
  }

  return json.data || json;
}

/** PATCH /agent-skills/{id} -> { data: AgentSkill }. */
export async function updateAgentSkill(
  token: string,
  id: string,
  data: UpdateAgentSkillRequest
): Promise<AgentSkill> {
  const res = await fetchWithTimeout(`${SKILLS_BASE}/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update agent skill");
  }

  return json.data || json;
}

/** DELETE /agent-skills/{id} -> { data: { ...soft-deleted } } (soft delete). */
export async function deleteAgentSkill(
  token: string,
  id: string
): Promise<AgentSkill> {
  const res = await fetchWithTimeout(`${SKILLS_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to delete agent skill");
  }

  return json.data || json;
}

/** POST /agents/{user_id}/skills body { skill_id } -> { data: ... }. */
export async function assignAgentSkill(
  token: string,
  userId: string,
  skillId: string
): Promise<unknown> {
  const res = await fetchWithTimeout(`${ROSTER_BASE}/${userId}/skills`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ skill_id: skillId }),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to assign skill");
  }

  return json.data || json;
}

/** DELETE /agents/{user_id}/skills/{skill_id} -> { data: { ...removed } }. */
export async function removeAgentSkill(
  token: string,
  userId: string,
  skillId: string
): Promise<unknown> {
  const res = await fetchWithTimeout(`${ROSTER_BASE}/${userId}/skills/${skillId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to remove skill");
  }

  return json.data || json;
}

/**
 * PATCH /agents/{user_id}/profile -> { data: AgentProfile }. Lets a manager set
 * any agent's seat type, routing capacity and transfer opt-in.
 */
export async function adminUpdateAgentProfile(
  token: string,
  userId: string,
  data: AdminUpdateAgentProfileRequest
): Promise<AgentProfile> {
  const res = await fetchWithTimeout(`${ROSTER_BASE}/${userId}/profile`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update agent profile");
  }

  return json.data || json;
}

// ---------------------------------------------------------------------------
// Conversation queues (Phase 4a)
// ---------------------------------------------------------------------------

/**
 * GET /conversation-queues?include_inactive=<bool> -> { data: { data: [...] } }.
 * The list payload is double-nested (one `data` for the envelope, one more for
 * the list) - unwrap both defensively, mirroring the roster endpoint.
 */
export async function fetchConversationQueues(
  token: string,
  includeInactive?: boolean
): Promise<ConversationQueue[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append("include_inactive", "true");

  const res = await fetchWithTimeout(`${QUEUES_BASE}?${params.toString()}`, {
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch conversation queues");
  }

  const outer = json.data ?? json;
  const list = outer?.data ?? outer;
  return Array.isArray(list) ? list : [];
}

/** POST /conversation-queues -> { data: ConversationQueue } (201). */
export async function createConversationQueue(
  token: string,
  data: CreateConversationQueueRequest
): Promise<ConversationQueue> {
  const res = await fetchWithTimeout(QUEUES_BASE, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to create conversation queue");
  }

  return json.data || json;
}

/** PATCH /conversation-queues/{id} -> { data: ConversationQueue }. */
export async function updateConversationQueue(
  token: string,
  id: string,
  data: UpdateConversationQueueRequest
): Promise<ConversationQueue> {
  const res = await fetchWithTimeout(`${QUEUES_BASE}/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update conversation queue");
  }

  return json.data || json;
}

/** DELETE /conversation-queues/{id} -> { data: { ...soft-deleted } }. */
export async function deleteConversationQueue(
  token: string,
  id: string
): Promise<ConversationQueue> {
  const res = await fetchWithTimeout(`${QUEUES_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to delete conversation queue");
  }

  return json.data || json;
}

/**
 * POST /conversation-queues/{id}/claim-next -> { data: ClaimNextResult }.
 * Race-safe pull of the next-in-line conversation. `claimed: false` means the
 * queue was empty (no conversation returned).
 */
export async function claimNextConversation(
  token: string,
  queueId: string
): Promise<ClaimNextResult> {
  const res = await fetchWithTimeout(`${QUEUES_BASE}/${queueId}/claim-next`, {
    method: "POST",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to claim next conversation");
  }

  return json.data || json;
}

/**
 * POST /conversation-queues/{id}/route-now -> { data: { assigned: number } }.
 * Runs the Phase 4b auto-assignment sweep for a single queue immediately and
 * reports how many conversations were assigned. Gated by `omnichannel:setup`.
 */
export async function routeQueueNow(
  token: string,
  queueId: string
): Promise<RouteQueueNowResult> {
  const res = await fetchWithTimeout(`${QUEUES_BASE}/${queueId}/route-now`, {
    method: "POST",
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to route queue");
  }

  return json.data || json;
}
