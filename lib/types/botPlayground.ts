// Bot Playground (Fase A) - mirrors app/schemas/bot_playground_schema.py.

export interface BotPlaygroundOverrides {
  use_llm?: boolean | null;
  min_confidence?: number | null;
  max_articles?: number | null;
  intro_text?: string | null;
  no_answer_text?: string | null;
  greeting_text?: string | null;
  include_sales?: boolean | null;
}

export interface BotPlaygroundAskRequest {
  account_id: string;
  question: string;
  overrides?: BotPlaygroundOverrides | null;
}

export interface PlaygroundArticleHit {
  article_id: string;
  title: string;
  rank: number;
  snippet: string;
  guardrails: string[];
}

export interface PlaygroundSignal {
  id: string;
  name: string;
  category: string;
  weight: number;
  matched_cue: string;
}

export interface PlaygroundForbiddenMatch {
  technique: string;
  matched: string;
}

export interface PlaygroundSalesReport {
  platform_enabled: boolean;
  tenant_enabled: boolean;
  effective: boolean;
  applied: boolean;
  archetype?: string | null;
  state?: string | null;
  stage?: string | null;
  score?: number | null;
  veto?: string | null;
  needs_human: boolean;
  selling_allowed?: boolean | null;
  prohibited_claims: string[];
  disclosures: string[];
  signals: PlaygroundSignal[];
  forbidden_matches: PlaygroundForbiddenMatch[];
}

export interface PlaygroundEffectiveConfig {
  use_llm: boolean;
  min_confidence: number;
  max_articles: number;
  intro_text?: string | null;
  no_answer_text?: string | null;
  greeting_text?: string | null;
  answer_bot_enabled: boolean;
  answer_bot_deflect: boolean;
  is_widget_enabled: boolean;
}

export type PlaygroundReplySource = "llm" | "articles" | "no_answer_text" | "silence" | "greeting";

export interface BotPlaygroundAskResponse {
  reply_text: string;
  reply_source: PlaygroundReplySource;
  outcome: string;
  would_deflect: boolean;
  confidence: number;
  used_llm: boolean;
  llm_configured: boolean;
  ranking_mode: string;
  elapsed_ms: number;
  articles: PlaygroundArticleHit[];
  sales: PlaygroundSalesReport;
  effective_config: PlaygroundEffectiveConfig;
  warnings: string[];
}

// ---------- Fase B: tenant test set ----------
export type BotTestExpectation = "answered" | "article" | "no_answer";

export interface BotTestCase {
  id: string;
  account_id: string;
  question: string;
  expectation: BotTestExpectation;
  expected_article_id?: string | null;
  expected_article_title?: string | null;
  note?: string | null;
  last_passed?: boolean | null;
  last_outcome?: string | null;
  last_confidence?: number | null;
  last_top_article_id?: string | null;
  last_top_article_title?: string | null;
  last_run_at?: string | null;
  created_at?: string | null;
}

export interface CreateBotTestCaseRequest {
  account_id: string;
  question: string;
  expectation?: BotTestExpectation;
  expected_article_id?: string | null;
  note?: string | null;
}

export interface BotTestCaseRunResult {
  case_id: string;
  question: string;
  expectation: BotTestExpectation;
  passed: boolean;
  outcome: string;
  confidence: number;
  reply_source: string;
  top_article_id?: string | null;
  top_article_title?: string | null;
  detail: string;
}

export interface BotTestSetRunResponse {
  total: number;
  passed: number;
  failed: number;
  pass_rate_pct: number;
  results: BotTestCaseRunResult[];
}

// ---------- Fase C: shadow + readiness ----------
export interface BotShadowResult {
  id: string;
  account_id: string;
  conversation_id?: string | null;
  question: string;
  reply_text: string;
  reply_source: string;
  outcome: string;
  confidence: number;
  used_llm: boolean;
  articles: { article_id: string; title: string; rank: number }[];
  review_status: "pending" | "approved" | "rejected";
  created_at?: string | null;
}

export interface BotShadowListResponse {
  total_pending: number;
  total_reviewed: number;
  total_approved: number;
  approval_rate_pct?: number | null;
  results: BotShadowResult[];
}

export interface ReadinessItem {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "off";
  required: boolean;
  detail: string;
}

export interface BotReadinessResponse {
  ready: boolean;
  items: ReadinessItem[];
}

export interface BotActivateResponse {
  activated: boolean;
  answer_bot_enabled: boolean;
  answer_bot_shadow: boolean;
  failing: ReadinessItem[];
}

// ---------- Jalur C: Content Gaps (placeholder template) ----------
export interface ContentGapVariable {
  key: string;
  label: string;
  example: string;
  context: string;
  articles: { id: string; title: string }[];
}

export interface ContentGapsResponse {
  articles_with_placeholders: number;
  variables: ContentGapVariable[];
}

export interface FillPlaceholdersReport {
  articles_updated: number;
  variables_applied: string[];
  articles_remaining: number;
}
