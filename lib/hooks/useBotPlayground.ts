"use client";

import { useMutation } from "@tanstack/react-query";
import { askBotPlayground } from "@/lib/api/bot-playground";
import type {
  BotPlaygroundAskRequest,
  BotPlaygroundAskResponse,
} from "@/lib/types/botPlayground";
import { useAuth } from "../context/AuthContext";

// One-shot ask; nothing is cached or invalidated because the endpoint is a
// pure dry-run - it writes nothing on the server.
export function useBotPlaygroundAsk() {
  const { token } = useAuth();
  return useMutation<BotPlaygroundAskResponse, unknown, BotPlaygroundAskRequest>({
    mutationFn: (payload) => {
      if (!token) throw new Error("No authentication token");
      return askBotPlayground(token, payload);
    },
  });
}

// ---------- Fase B/C ----------
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateBot,
  createBotTestCase,
  deleteBotTestCase,
  getBotReadiness,
  listBotShadowResults,
  listBotTestCases,
  reviewBotShadowResult,
  runBotTestSet,
} from "@/lib/api/bot-playground";
import { attachQuestionToKbArticle } from "@/lib/api/knowledge";
import type {
  BotPlaygroundOverrides,
  CreateBotTestCaseRequest,
} from "@/lib/types/botPlayground";

const keys = {
  testSet: (accountId?: string) => ["bot-playground", "test-set", accountId],
  shadow: (accountId?: string, status?: string) => [
    "bot-playground",
    "shadow",
    accountId,
    status ?? "all",
  ],
  readiness: (accountId?: string) => ["bot-playground", "readiness", accountId],
};

export function useBotTestCases(accountId?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: keys.testSet(accountId),
    queryFn: () => {
      if (!token || !accountId) throw new Error("No authentication token");
      return listBotTestCases(token, accountId);
    },
    enabled: !!token && !!accountId,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBotTestCase(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBotTestCaseRequest) => {
      if (!token) throw new Error("No authentication token");
      return createBotTestCase(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.testSet(accountId) });
      queryClient.invalidateQueries({ queryKey: keys.readiness(accountId) });
    },
  });
}

export function useDeleteBotTestCase(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteBotTestCase(token, caseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.testSet(accountId) });
      queryClient.invalidateQueries({ queryKey: keys.readiness(accountId) });
    },
  });
}

export function useRunBotTestSet(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (overrides?: BotPlaygroundOverrides) => {
      if (!token || !accountId) throw new Error("No authentication token");
      return runBotTestSet(token, accountId, overrides);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.testSet(accountId) });
      queryClient.invalidateQueries({ queryKey: keys.readiness(accountId) });
    },
  });
}

export function useBotShadow(
  accountId?: string,
  status?: "pending" | "approved" | "rejected",
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: keys.shadow(accountId, status),
    queryFn: () => {
      if (!token || !accountId) throw new Error("No authentication token");
      return listBotShadowResults(token, accountId, status);
    },
    enabled: !!token && !!accountId,
    refetchOnWindowFocus: false,
  });
}

export function useReviewBotShadow(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shadowId, approve }: { shadowId: string; approve: boolean }) => {
      if (!token) throw new Error("No authentication token");
      return reviewBotShadowResult(token, shadowId, approve);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-playground", "shadow", accountId] });
      queryClient.invalidateQueries({ queryKey: keys.readiness(accountId) });
    },
  });
}

export function useBotReadiness(accountId?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: keys.readiness(accountId),
    queryFn: () => {
      if (!token || !accountId) throw new Error("No authentication token");
      return getBotReadiness(token, accountId);
    },
    enabled: !!token && !!accountId,
    refetchOnWindowFocus: false,
  });
}

export function useActivateBot(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token || !accountId) throw new Error("No authentication token");
      return activateBot(token, accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.readiness(accountId) });
      queryClient.invalidateQueries({
        queryKey: ["omnichannels", "web-widget-config", accountId],
      });
    },
  });
}

export function useAttachQuestionToArticle(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      articleId,
      question,
      keywords,
    }: {
      articleId: string;
      question: string;
      keywords?: string[];
    }) => {
      if (!token) throw new Error("No authentication token");
      return attachQuestionToKbArticle(token, articleId, question, keywords);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.readiness(accountId) });
      queryClient.invalidateQueries({ queryKey: ["kb", "articles"] });
    },
  });
}
