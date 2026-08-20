"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  fetchConversationSlaPolicies,
  createConversationSlaPolicy,
  updateConversationSlaPolicy,
  deleteConversationSlaPolicy,
} from "@/lib/api/conversationSla";
import {
  ConversationSlaPolicy,
  CreateConversationSlaPolicyRequest,
  UpdateConversationSlaPolicyRequest,
} from "@/lib/types/omnichannel";

const POLICIES_KEY = ["omnichannels", "conversation-sla-policies"];

// includeInactive is part of the key so the (future) active-only readers and
// the settings page's full listing cache independently (mirrors useCannedReplies).
export function useConversationSlaPolicies(includeInactive?: boolean) {
  const { token } = useAuth();
  return useQuery<ConversationSlaPolicy[], Error>({
    queryKey: [...POLICIES_KEY, includeInactive ?? false],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchConversationSlaPolicies(token, includeInactive);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateConversationSlaPolicy() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationSlaPolicyRequest) => {
      if (!token) throw new Error("No authentication token");
      return createConversationSlaPolicy(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
    },
  });
}

export function useUpdateConversationSlaPolicy() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationSlaPolicyRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateConversationSlaPolicy(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
    },
  });
}

export function useDeleteConversationSlaPolicy() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteConversationSlaPolicy(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
    },
  });
}
