// lib/hooks/useAgents.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  fetchAgentRoster,
  fetchAgentGroups,
  getAgentGroup,
  createAgentGroup,
  updateAgentGroup,
  deleteAgentGroup,
  addGroupMember,
  updateGroupMemberRole,
  removeGroupMember,
  fetchMyPresence,
  setMyPresence,
  updateMyRoutingProfile,
  fetchAgentSkills,
  createAgentSkill,
  updateAgentSkill,
  deleteAgentSkill,
  assignAgentSkill,
  removeAgentSkill,
  adminUpdateAgentProfile,
  fetchConversationQueues,
  createConversationQueue,
  updateConversationQueue,
  deleteConversationQueue,
  claimNextConversation,
  routeQueueNow,
} from "../api/agents";
import type {
  AgentRosterItem,
  AgentGroup,
  AgentGroupDetail,
  CreateAgentGroupRequest,
  UpdateAgentGroupRequest,
  AddGroupMemberRequest,
  AgentGroupRole,
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

// Query key roots (kept together so invalidations stay in sync):
//   ['agents', 'roster']            -> read-only roster
//   ['agents', 'groups', include]   -> group list (per include_inactive flag)
//   ['agents', 'group', id]         -> a single group + its members
//   ['agents', 'me', 'presence']    -> the signed-in agent's presence/profile
//   ['agents', 'queues', include]   -> conversation queue list (per include flag)
//   ['omnichannels', 'inbox']       -> workspace queue (invalidated by claim-next)
const ROSTER_KEY = ["agents", "roster"] as const;
const GROUPS_KEY = ["agents", "groups"] as const;
const GROUP_KEY = ["agents", "group"] as const;
const PRESENCE_KEY = ["agents", "me", "presence"] as const;
const SKILLS_KEY = ["agents", "skills"] as const;
const QUEUES_KEY = ["agents", "queues"] as const;
const INBOX_KEY = ["omnichannels", "inbox"] as const;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useAgentRoster() {
  const { token } = useAuth();
  return useQuery<AgentRosterItem[], Error>({
    queryKey: [...ROSTER_KEY],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchAgentRoster(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useAgentGroups(includeInactive?: boolean) {
  const { token } = useAuth();
  return useQuery<AgentGroup[], Error>({
    queryKey: [...GROUPS_KEY, includeInactive ?? false],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchAgentGroups(token, includeInactive);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useAgentGroup(id: string | null | undefined) {
  const { token } = useAuth();
  return useQuery<AgentGroupDetail, Error>({
    queryKey: [...GROUP_KEY, id],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      if (!id) throw new Error("No group id");
      return getAgentGroup(token, id);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token && !!id,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateAgentGroup() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentGroupRequest) => {
      if (!token) throw new Error("No authentication token");
      return createAgentGroup(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...GROUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

export function useUpdateAgentGroup() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentGroupRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateAgentGroup(token, id, data);
    },
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...GROUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [...GROUP_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

export function useDeleteAgentGroup() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteAgentGroup(token, id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: [...GROUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [...GROUP_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

export function useAddGroupMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: AddGroupMemberRequest }) => {
      if (!token) throw new Error("No authentication token");
      return addGroupMember(token, groupId, data);
    },
    onSuccess: (_result, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: [...GROUP_KEY, groupId] });
      // Group list shows member_count; roster shows each agent's groups.
      queryClient.invalidateQueries({ queryKey: [...GROUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

export function useUpdateGroupMemberRole() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      userId,
      role,
    }: {
      groupId: string;
      userId: string;
      role: AgentGroupRole;
    }) => {
      if (!token) throw new Error("No authentication token");
      return updateGroupMemberRole(token, groupId, userId, { role });
    },
    onSuccess: (_result, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: [...GROUP_KEY, groupId] });
      // Roster surfaces the member/lead distinction per group.
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

export function useRemoveGroupMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => {
      if (!token) throw new Error("No authentication token");
      return removeGroupMember(token, groupId, userId);
    },
    onSuccess: (_result, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: [...GROUP_KEY, groupId] });
      queryClient.invalidateQueries({ queryKey: [...GROUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

// ---------------------------------------------------------------------------
// Agent presence + self-service routing profile (Phase 4a)
// ---------------------------------------------------------------------------

/** The signed-in agent's presence + routing profile (GET /agents/me/presence). */
export function useMyPresence() {
  const { token } = useAuth();
  return useQuery<AgentProfile, Error>({
    queryKey: [...PRESENCE_KEY],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchMyPresence(token);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

/**
 * Set your own presence. Optimistically flips the cached presence_status so the
 * workspace switch feels instant, rolling back on error.
 */
export function useSetMyPresence() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AgentProfile, Error, AgentPresenceStatus, { previous?: AgentProfile }>({
    mutationFn: (status: AgentPresenceStatus) => {
      if (!token) throw new Error("No authentication token");
      return setMyPresence(token, status);
    },
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: [...PRESENCE_KEY] });
      const previous = queryClient.getQueryData<AgentProfile>([...PRESENCE_KEY]);
      if (previous) {
        queryClient.setQueryData<AgentProfile>([...PRESENCE_KEY], {
          ...previous,
          presence_status: status,
        });
      }
      return { previous };
    },
    onError: (_err, _status, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...PRESENCE_KEY], context.previous);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData([...PRESENCE_KEY], result);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...PRESENCE_KEY] });
    },
  });
}

/** Update your own routing profile (max concurrent open + accepts transfers). */
export function useUpdateMyRoutingProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoutingProfileRequest) => {
      if (!token) throw new Error("No authentication token");
      return updateMyRoutingProfile(token, data);
    },
    onSuccess: (result) => {
      queryClient.setQueryData([...PRESENCE_KEY], result);
      queryClient.invalidateQueries({ queryKey: [...PRESENCE_KEY] });
    },
  });
}

// ---------------------------------------------------------------------------
// Agent skills + admin-managed agent profile (Phase 1b)
// ---------------------------------------------------------------------------

/** Company skill vocabulary (GET /agent-skills). */
export function useAgentSkills(includeInactive?: boolean) {
  const { token } = useAuth();
  return useQuery<AgentSkill[], Error>({
    queryKey: [...SKILLS_KEY, includeInactive ?? false],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchAgentSkills(token, includeInactive);
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateAgentSkill() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentSkillRequest) => {
      if (!token) throw new Error("No authentication token");
      return createAgentSkill(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SKILLS_KEY] });
    },
  });
}

export function useUpdateAgentSkill() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentSkillRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateAgentSkill(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SKILLS_KEY] });
      // Roster rows show each agent's skill chips.
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

export function useDeleteAgentSkill() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteAgentSkill(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SKILLS_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

/** Assign a skill to an agent (POST /agents/{user_id}/skills). */
export function useAssignAgentSkill() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, skillId }: { userId: string; skillId: string }) => {
      if (!token) throw new Error("No authentication token");
      return assignAgentSkill(token, userId, skillId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
      queryClient.invalidateQueries({ queryKey: [...SKILLS_KEY] });
    },
  });
}

/** Remove a skill from an agent (DELETE /agents/{user_id}/skills/{skill_id}). */
export function useRemoveAgentSkill() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, skillId }: { userId: string; skillId: string }) => {
      if (!token) throw new Error("No authentication token");
      return removeAgentSkill(token, userId, skillId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
      queryClient.invalidateQueries({ queryKey: [...SKILLS_KEY] });
    },
  });
}

/**
 * Manager-set agent profile (seat type + capacity + transfers) for any agent
 * (PATCH /agents/{user_id}/profile). Refreshes the roster so the seat chip
 * updates in place.
 */
export function useAdminUpdateAgentProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: AdminUpdateAgentProfileRequest;
    }) => {
      if (!token) throw new Error("No authentication token");
      return adminUpdateAgentProfile(token, userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROSTER_KEY] });
    },
  });
}

// ---------------------------------------------------------------------------
// Conversation queues (Phase 4a)
// ---------------------------------------------------------------------------

export function useConversationQueues(includeInactive?: boolean) {
  const { token } = useAuth();
  return useQuery<ConversationQueue[], Error>({
    queryKey: [...QUEUES_KEY, includeInactive ?? false],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchConversationQueues(token, includeInactive);
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateConversationQueue() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationQueueRequest) => {
      if (!token) throw new Error("No authentication token");
      return createConversationQueue(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUEUES_KEY] });
    },
  });
}

export function useUpdateConversationQueue() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationQueueRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateConversationQueue(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUEUES_KEY] });
    },
  });
}

export function useDeleteConversationQueue() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteConversationQueue(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUEUES_KEY] });
    },
  });
}

/**
 * Race-safe "claim next" pull from a queue. On success it refreshes the
 * workspace inbox (the claimed conversation is now assigned to the caller and
 * should surface in the "assigned to me" views).
 */
export function useClaimNext() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ClaimNextResult, Error, string>({
    mutationFn: (queueId: string) => {
      if (!token) throw new Error("No authentication token");
      return claimNextConversation(token, queueId);
    },
    onSuccess: (result) => {
      if (result.claimed) {
        queryClient.invalidateQueries({ queryKey: [...INBOX_KEY] });
      }
    },
  });
}

/**
 * Phase 4b "Route now" - run the auto-assignment sweep for one queue on demand.
 * On success it refreshes the workspace inbox (freshly assigned conversations)
 * and the queue list (any surfaced counts).
 */
export function useRouteQueueNow() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<RouteQueueNowResult, Error, string>({
    mutationFn: (queueId: string) => {
      if (!token) throw new Error("No authentication token");
      return routeQueueNow(token, queueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INBOX_KEY] });
      queryClient.invalidateQueries({ queryKey: [...QUEUES_KEY] });
    },
  });
}
