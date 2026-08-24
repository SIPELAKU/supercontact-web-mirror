// lib/types/knowledge.ts
//
// Phase 6 Help Center / Knowledge Base. Mirrors the backend contracts under the
// `/knowledge` prefix - every list/detail endpoint returns its payload under
// the standard `{ success, data, error }` envelope's `.data`.

export type KbArticleStatus = "draft" | "published" | "archived";

export interface KbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface KbSection {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface KbArticleSummary {
  id: string;
  section_id: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  status: KbArticleStatus;
  locale: string;
  translation_group_id: string | null;
  labels: string[];
  author_id: string | null;
  author_name: string | null;
  is_public: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KbArticle extends KbArticleSummary {
  body: string;
  last_edited_by_id: string | null;
}

export interface KbArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  body: string;
  excerpt: string | null;
  edited_by_id: string | null;
  created_at: string;
}

export interface KbArticleAiAdaptResponse {
  available: boolean;
  suggested_body: string | null;
}

export interface KbSearchHit {
  article_id: string;
  title: string;
  slug: string;
  section_id: string | null;
  category_id: string | null;
  excerpt: string | null;
  snippet: string;
  rank: number;
  locale: string;
}

// The flags endpoints' exact payload isn't fully specced; kept permissive but
// typed so the moderation UI can render what the backend returns.
export interface KbFlag {
  id: string;
  article_id: string;
  article_title?: string | null;
  reason: string;
  status: string;
  created_by_id?: string | null;
  created_by_name?: string | null;
  resolved_by_id?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// ---- Template packs (KB Industry Starter Packs) ------------------------------

export interface KbTemplateVariable {
  key: string;
  label: string;
  example?: string | null;
}

// One node of the gallery preview tree: category name -> section names only.
export interface KbTemplatePreviewCategory {
  name: string;
  sections: string[];
}

export interface KbTemplateCounts {
  categories: number;
  sections: number;
  articles: number;
}

export interface KbTemplatePack {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  version: number | string;
  variables: KbTemplateVariable[];
  locales: string[];
  counts: KbTemplateCounts;
  preview: KbTemplatePreviewCategory[];
}

export interface InstallKbTemplateRequest {
  locale: string;
  variables?: Record<string, string>;
  install_as?: "draft" | "published";
  public_defaults?: boolean;
}

export interface KbTemplateInstallResult {
  created: KbTemplateCounts;
  skipped: KbTemplateCounts;
  unsubstituted_variables: string[];
}

// ---- Request payloads --------------------------------------------------------

export interface CreateKbCategoryRequest {
  name: string;
  description?: string | null;
  icon?: string | null;
  is_public?: boolean;
  position?: number;
}

export type UpdateKbCategoryRequest = Partial<CreateKbCategoryRequest>;

export interface CreateKbSectionRequest {
  category_id: string;
  name: string;
  description?: string | null;
  position?: number;
}

export type UpdateKbSectionRequest = Partial<
  Pick<CreateKbSectionRequest, "category_id" | "name" | "description" | "position">
>;

export interface CreateKbArticleRequest {
  section_id?: string | null;
  title: string;
  body: string;
  excerpt?: string | null;
  locale?: string;
  labels?: string[];
  is_public?: boolean;
}

export interface UpdateKbArticleRequest {
  section_id?: string | null;
  title?: string;
  body?: string;
  excerpt?: string | null;
  locale?: string;
  labels?: string[];
  is_public?: boolean;
}

export interface KbArticleListParams {
  status?: KbArticleStatus | "";
  section_id?: string;
  q?: string;
  locale?: string;
  limit?: number;
  offset?: number;
}

export interface KbFeedbackRequest {
  is_helpful: boolean;
  comment?: string;
}

export interface KbFlagRequest {
  reason: string;
}
