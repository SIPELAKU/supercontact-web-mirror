"use client";

// Phase 7A Copilot hooks. Three on-demand mutations (no useQuery) - each fires
// only when the agent explicitly asks for it from the composer's Copilot drawer.
// Follows the useKnowledge.ts pattern: token from useAuth, throw if missing.

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  copilotSummarize,
  copilotSuggestReply,
  copilotRewrite,
} from "../api/ai-copilot";
import type {
  CopilotTone,
  CopilotSummarizeResponse,
  CopilotSuggestReplyResponse,
  CopilotRewriteResponse,
} from "../api/ai-copilot";

export function useCopilotSummarize() {
  const { token } = useAuth();
  return useMutation<CopilotSummarizeResponse, Error, string>({
    mutationFn: (conversationId: string) => {
      if (!token) throw new Error("No authentication token");
      return copilotSummarize(token, conversationId);
    },
  });
}

export function useCopilotSuggestReply() {
  const { token } = useAuth();
  return useMutation<
    CopilotSuggestReplyResponse,
    Error,
    { conversationId: string; locale?: string }
  >({
    mutationFn: ({ conversationId, locale }) => {
      if (!token) throw new Error("No authentication token");
      return copilotSuggestReply(token, conversationId, locale);
    },
  });
}

export function useCopilotRewrite() {
  const { token } = useAuth();
  return useMutation<
    CopilotRewriteResponse,
    Error,
    { draft: string; tone: CopilotTone }
  >({
    mutationFn: ({ draft, tone }) => {
      if (!token) throw new Error("No authentication token");
      return copilotRewrite(token, draft, tone);
    },
  });
}
