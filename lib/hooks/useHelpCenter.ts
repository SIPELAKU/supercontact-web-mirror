// lib/hooks/useHelpCenter.ts
//
// TanStack Query hooks for the Phase 7C Help Center:
//  - Public portal hooks (no auth) driving the app/(help)/ route group.
//  - Admin config hooks (authed) driving the Settings > Help Center page.
//
// The public queries never retry a 404 (a disabled / unknown portal or a
// private article is a terminal state, not a transient error) so the UI can
// render a clean "not found" immediately.

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  fetchHelpConfig,
  fetchHelpCategories,
  fetchHelpSections,
  fetchHelpArticles,
  fetchHelpArticle,
  searchHelp,
  postHelpFeedback,
  HelpApiError,
  type HelpCenterPublicConfig,
  type HelpCategory,
  type HelpSection,
  type HelpArticleSummary,
  type HelpArticle,
  type HelpSearchHit,
  type HelpFeedbackRequest,
} from "../api/help-center-public";
import {
  fetchHelpCenterAdminConfig,
  updateHelpCenterAdminConfig,
  type HelpCenterAdminConfig,
  type HelpCenterConfigUpdate,
} from "../api/help-center-admin";

const HC = "help-center";

// Don't burn retries on a terminal 404 (disabled/unknown portal, missing
// article); keep the default 3 retries for anything transient.
const noRetryOn404 = (failureCount: number, error: unknown) => {
  if (error instanceof HelpApiError && error.status === 404) return false;
  return failureCount < 3;
};

// ---- Public portal -----------------------------------------------------------

export function useHelpConfig(slug: string) {
  return useQuery<HelpCenterPublicConfig, HelpApiError>({
    queryKey: [HC, "config", slug],
    queryFn: () => fetchHelpConfig(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: noRetryOn404,
  });
}

export function useHelpCategories(slug: string) {
  return useQuery<HelpCategory[], HelpApiError>({
    queryKey: [HC, "categories", slug],
    queryFn: () => fetchHelpCategories(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: noRetryOn404,
  });
}

export function useHelpSections(slug: string, categorySlug: string) {
  return useQuery<HelpSection[], HelpApiError>({
    queryKey: [HC, "sections", slug, categorySlug],
    queryFn: () => fetchHelpSections(slug, categorySlug),
    enabled: !!slug && !!categorySlug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: noRetryOn404,
  });
}

export function useHelpArticles(slug: string, section?: string) {
  return useQuery<HelpArticleSummary[], HelpApiError>({
    queryKey: [HC, "articles", slug, section ?? "all"],
    queryFn: () => fetchHelpArticles(slug, section),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: noRetryOn404,
  });
}

export function useHelpArticle(slug: string, articleSlug: string) {
  return useQuery<HelpArticle, HelpApiError>({
    queryKey: [HC, "article", slug, articleSlug],
    queryFn: () => fetchHelpArticle(slug, articleSlug),
    enabled: !!slug && !!articleSlug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: noRetryOn404,
  });
}

export function useHelpSearch(slug: string, q: string) {
  const query = q.trim();
  return useQuery<HelpSearchHit[], HelpApiError>({
    queryKey: [HC, "search", slug, query],
    queryFn: () => searchHelp(slug, query),
    enabled: !!slug && query.length > 0,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: noRetryOn404,
  });
}

export function useHelpFeedback(slug: string, articleSlug: string) {
  return useMutation<{ ok: true }, HelpApiError, HelpFeedbackRequest>({
    mutationFn: (body) => postHelpFeedback(slug, articleSlug, body),
  });
}

// ---- Admin config (authed) ---------------------------------------------------

export function useHelpCenterAdminConfig() {
  const { token } = useAuth();
  return useQuery<HelpCenterAdminConfig, Error>({
    queryKey: [HC, "admin-config"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchHelpCenterAdminConfig(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateHelpCenterConfig() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation<HelpCenterAdminConfig, Error, HelpCenterConfigUpdate>({
    mutationFn: (body) => {
      if (!token) throw new Error("No authentication token");
      return updateHelpCenterAdminConfig(token, body);
    },
    onSuccess: (data) => {
      qc.setQueryData([HC, "admin-config"], data);
    },
  });
}
