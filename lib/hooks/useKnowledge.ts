"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "./usePermission";
import {
  fetchKbCategories,
  createKbCategory,
  updateKbCategory,
  deleteKbCategory,
  fetchKbSections,
  createKbSection,
  updateKbSection,
  deleteKbSection,
  fetchKbArticles,
  fetchKbArticle,
  createKbArticle,
  updateKbArticle,
  bulkPublishKbArticles,
  bulkSetKbArticleStatus,
  publishKbArticle,
  unpublishKbArticle,
  archiveKbArticle,
  deleteKbArticle,
  aiAdaptKbArticle,
  fetchKbArticleVersions,
  searchKb,
  submitKbFeedback,
  flagKbArticle,
  fetchKbFlags,
  resolveKbFlag,
} from "../api/knowledge";
import { fetchKbTemplates, installKbTemplate } from "../api/knowledge-templates";
import type {
  KbTemplatePack,
  InstallKbTemplateRequest,
  KbTemplateInstallResult,
} from "../types/knowledge";
import type {
  KbCategory,
  KbSection,
  KbArticle,
  KbArticleSummary,
  KbArticleVersion,
  KbSearchHit,
  KbFlag,
  CreateKbCategoryRequest,
  UpdateKbCategoryRequest,
  CreateKbSectionRequest,
  UpdateKbSectionRequest,
  CreateKbArticleRequest,
  UpdateKbArticleRequest,
  KbArticleListParams,
  KbFeedbackRequest,
  KbBulkPublishRequest,
  KbBulkStatusRequest,
} from "../types/knowledge";

// Root cache key so a broad invalidate({ queryKey: ['knowledge'] }) can refresh
// every knowledge query at once when needed.
const KB = "knowledge";

// Central gate for every Knowledge Base UI action. Mirrors the backend's four
// grants (knowledge:read|author|publish|manage) so the UI never enables an
// action the API would 403 — and never disables one the API would allow:
//   - canRead    : view articles/categories   (read | author | publish | manage)
//   - canWrite   : create/edit/save drafts     (author | publish | manage)  [backend: knowledge:author]
//   - canPublish : publish / unpublish / archive (publish | manage)
//   - canManage  : delete, category/section CRUD, resolve flags (manage)
export function useKbPermissions() {
  const { can } = usePermission();
  const canManage = can("knowledge:manage");
  const canPublish = can(["knowledge:publish", "knowledge:manage"]);
  return {
    canRead: can([
      "knowledge:read",
      "knowledge:author",
      "knowledge:publish",
      "knowledge:manage",
    ]),
    canWrite: can(["knowledge:author", "knowledge:publish", "knowledge:manage"]),
    canPublish,
    canManage,
  };
}

// ---- Categories --------------------------------------------------------------

export function useKbCategories() {
  const { token } = useAuth();
  return useQuery<KbCategory[], Error>({
    queryKey: [KB, "categories"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchKbCategories(token);
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateKbCategory() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKbCategoryRequest) => {
      if (!token) throw new Error("No authentication token");
      return createKbCategory(token, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "categories"] }),
  });
}

export function useUpdateKbCategory() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKbCategoryRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateKbCategory(token, id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "categories"] }),
  });
}

export function useDeleteKbCategory() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteKbCategory(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KB, "categories"] });
      qc.invalidateQueries({ queryKey: [KB, "sections"] });
    },
  });
}

// ---- Sections ----------------------------------------------------------------

export function useKbSections(categoryId?: string) {
  const { token } = useAuth();
  return useQuery<KbSection[], Error>({
    queryKey: [KB, "sections", categoryId ?? "all"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchKbSections(token, categoryId);
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateKbSection() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKbSectionRequest) => {
      if (!token) throw new Error("No authentication token");
      return createKbSection(token, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "sections"] }),
  });
}

export function useUpdateKbSection() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKbSectionRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateKbSection(token, id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "sections"] }),
  });
}

export function useDeleteKbSection() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteKbSection(token, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "sections"] }),
  });
}

// ---- Articles ----------------------------------------------------------------

export function useKbArticles(params: KbArticleListParams = {}) {
  const { token } = useAuth();
  return useQuery<KbArticleSummary[], Error>({
    // The whole params object is part of the key so each filter combo caches
    // independently; mutation hooks invalidate the ['knowledge','articles']
    // prefix which reaches every variant.
    queryKey: [KB, "articles", params],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchKbArticles(token, params);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useKbArticle(id?: string) {
  const { token } = useAuth();
  return useQuery<KbArticle, Error>({
    queryKey: [KB, "article", id],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      if (!id) throw new Error("No article id");
      return fetchKbArticle(token, id);
    },
    staleTime: 1000 * 15,
    refetchOnWindowFocus: false,
    enabled: !!token && !!id,
  });
}

export function useKbArticleVersions(id?: string, enabled = true) {
  const { token } = useAuth();
  return useQuery<KbArticleVersion[], Error>({
    queryKey: [KB, "article", id, "versions"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      if (!id) throw new Error("No article id");
      return fetchKbArticleVersions(token, id);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token && !!id && enabled,
  });
}

// Shared invalidation after any article-level change.
function invalidateArticle(qc: ReturnType<typeof useQueryClient>, id?: string) {
  qc.invalidateQueries({ queryKey: [KB, "articles"] });
  if (id) qc.invalidateQueries({ queryKey: [KB, "article", id] });
}

export function useCreateKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKbArticleRequest) => {
      if (!token) throw new Error("No authentication token");
      return createKbArticle(token, data);
    },
    onSuccess: (article) => invalidateArticle(qc, article?.id),
  });
}

export function useUpdateKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKbArticleRequest }) => {
      if (!token) throw new Error("No authentication token");
      return updateKbArticle(token, id, data);
    },
    onSuccess: (_article, vars) => {
      invalidateArticle(qc, vars.id);
      qc.invalidateQueries({ queryKey: [KB, "article", vars.id, "versions"] });
    },
  });
}

// Draft-only Copilot suggestion - never mutates the article server-side, so
// no cache invalidation on success (there is nothing to invalidate).
export function useAiAdaptKbArticle() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return aiAdaptKbArticle(token, id);
    },
  });
}

export function usePublishKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return publishKbArticle(token, id);
    },
    onSuccess: (_a, id) => invalidateArticle(qc, id),
  });
}

export function useBulkSetKbArticleStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: KbBulkStatusRequest) => {
      if (!token) throw new Error("No authentication token");
      return bulkSetKbArticleStatus(token, payload);
    },
    // A bulk run can move dozens of rows and it also changes the blueprint
    // activation checklist's KB count, so invalidate both.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KB] });
      qc.invalidateQueries({ queryKey: ["activation-checklist"] });
    },
  });
}

export function useBulkPublishKbArticles() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: KbBulkPublishRequest) => {
      if (!token) throw new Error("No authentication token");
      return bulkPublishKbArticles(token, payload);
    },
    // A bulk run can move dozens of rows and it also empties the blueprint
    // activation checklist's KB item, so invalidate both rather than a single
    // article key.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KB] });
      qc.invalidateQueries({ queryKey: ["activation-checklist"] });
    },
  });
}

export function useUnpublishKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return unpublishKbArticle(token, id);
    },
    onSuccess: (_a, id) => invalidateArticle(qc, id),
  });
}

export function useArchiveKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return archiveKbArticle(token, id);
    },
    onSuccess: (_a, id) => invalidateArticle(qc, id),
  });
}

export function useDeleteKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return deleteKbArticle(token, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "articles"] }),
  });
}

// ---- Search ------------------------------------------------------------------

export function useKbSearch(q: string, locale?: string, limit = 8) {
  const { token } = useAuth();
  const trimmed = q.trim();
  return useQuery<KbSearchHit[], Error>({
    queryKey: [KB, "search", trimmed, locale ?? "all"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return searchKb(token, trimmed, locale, limit);
    },
    // Only fires once there's a query - keeps the popover from hammering the
    // endpoint on every keystroke before the user has typed anything.
    enabled: !!token && trimmed.length >= 2,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}

// ---- Feedback ----------------------------------------------------------------

export function useSubmitKbFeedback() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KbFeedbackRequest }) => {
      if (!token) throw new Error("No authentication token");
      return submitKbFeedback(token, id, data);
    },
    onSuccess: (_a, vars) => invalidateArticle(qc, vars.id),
  });
}

// ---- Template packs ----------------------------------------------------------

export function useKbTemplates(enabled = true) {
  const { token } = useAuth();
  return useQuery<KbTemplatePack[], Error>({
    queryKey: [KB, "templates"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchKbTemplates(token);
    },
    // Packs are versioned repo files - they only change on release.
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!token && enabled,
  });
}

export function useInstallKbTemplate() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation<
    KbTemplateInstallResult,
    unknown,
    { packId: string; data: InstallKbTemplateRequest }
  >({
    mutationFn: ({ packId, data }) => {
      if (!token) throw new Error("No authentication token");
      return installKbTemplate(token, packId, data);
    },
    // An install creates categories + sections + articles in one shot, so
    // refresh every knowledge query via the shared root key.
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB] }),
  });
}

// ---- Flags -------------------------------------------------------------------

export function useKbFlags(status: string = "open", enabled = true) {
  const { token } = useAuth();
  return useQuery<KbFlag[], Error>({
    queryKey: [KB, "flags", status],
    queryFn: () => {
      if (!token) throw new Error("No authentication token");
      return fetchKbFlags(token, status);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token && enabled,
  });
}

export function useFlagKbArticle() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => {
      if (!token) throw new Error("No authentication token");
      return flagKbArticle(token, id, { reason });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "flags"] }),
  });
}

export function useResolveKbFlag() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No authentication token");
      return resolveKbFlag(token, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KB, "flags"] }),
  });
}
