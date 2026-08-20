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
} from "../api/agents";
import type {
  AgentRosterItem,
  AgentGroup,
  AgentGroupDetail,
  CreateAgentGroupRequest,
  UpdateAgentGroupRequest,
  AddGroupMemberRequest,
  AgentGroupRole,
} from "../types/agents";

// Query key roots (kept together so invalidations stay in sync):
//   ['agents', 'roster']            -> read-only roster
//   ['agents', 'groups', include]   -> group list (per include_inactive flag)
//   ['agents', 'group', id]         -> a single group + its members
const ROSTER_KEY = ["agents", "roster"] as const;
const GROUPS_KEY = ["agents", "groups"] as const;
const GROUP_KEY = ["agents", "group"] as const;

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
