// lib/types/agents.ts
// ---------------------------------------------------------------------------
// Agent Admin console types - the "manage agent support" half of the Support
// Desk program. Covers the read-only agent roster and the CRUD-able agent
// groups (teams) with their members.
//
// Permissions: reads need `agents:read`, all writes need `agents:manage`.
// ---------------------------------------------------------------------------

import type { ConversationWithMessages } from "./omnichannel";

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
  /** Live presence (Phase 4a). Optional - only present once the roster
   *  endpoint surfaces it; absent on older payloads. */
  presence_status?: AgentPresenceStatus;
}

// ---------------------------------------------------------------------------
// Agent presence + self-service routing profile (Support Desk Phase 4a).
//
// Every agent has a presence status (drives who "claim next" can pull to) and
// a personal routing profile (capacity + whether they accept transfers). The
// seat_type is read-only here (set elsewhere).
//
// Permissions: reading/setting your own presence + routing-profile needs
// `omnichannel:use` (it's self-service).
// ---------------------------------------------------------------------------

/** An agent's live availability. */
export type AgentPresenceStatus = "online" | "away" | "offline";

/** Licensed seat kind (read-only in this UI). */
export type AgentSeatType = "full" | "light";

/** The signed-in agent's own presence + routing profile. */
export interface AgentProfile {
  presence_status: AgentPresenceStatus;
  max_concurrent_open: number | null;
  accepts_transfers: boolean;
  seat_type: AgentSeatType;
}

/** PUT /agents/me/presence body. */
export interface SetPresenceRequest {
  status: AgentPresenceStatus;
}

/** PATCH /agents/me/routing-profile body (both fields optional). */
export interface UpdateRoutingProfileRequest {
  max_concurrent_open?: number | null;
  accepts_transfers?: boolean;
}

// ---------------------------------------------------------------------------
// Admin-defined conversation queues (Support Desk Phase 4a).
//
// Admins define ordered queues that describe a slice of work (optionally scoped
// to a group / channel / priority). Agents pull the next-in-line conversation
// from a queue via a race-safe "claim next" call.
//
// Permissions: listing queues + claim-next need `omnichannel:use`; queue
// create/update/delete need `omnichannel:setup`.
// ---------------------------------------------------------------------------

export type ConversationQueueChannelType = "whatsapp" | "email" | "web_widget";
export type ConversationQueuePriority = "low" | "normal" | "high" | "urgent";

/** One admin-defined conversation queue. */
export interface ConversationQueue {
  id: string;
  name: string;
  group_id: string | null;
  channel_type: ConversationQueueChannelType | null;
  priority: ConversationQueuePriority | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationQueueRequest {
  name: string;
  group_id?: string | null;
  channel_type?: ConversationQueueChannelType | null;
  priority?: ConversationQueuePriority | null;
  position?: number;
}

export type UpdateConversationQueueRequest = Partial<CreateConversationQueueRequest> & {
  is_active?: boolean;
};

/**
 * Result of POST /conversation-queues/{id}/claim-next. When `claimed` is true,
 * `conversation` is a full conversation-detail object (the same shape the
 * workspace thread consumes).
 */
export interface ClaimNextResult {
  claimed: boolean;
  conversation?: ConversationWithMessages;
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
