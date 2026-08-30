// Bot Playground (Fase A) - mirrors app/schemas/bot_playground_schema.py.

export interface BotPlaygroundOverrides {
  use_llm?: boolean | null;
  min_confidence?: number | null;
  max_articles?: number | null;
  intro_text?: string | null;
  no_answer_text?: string | null;
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
  answer_bot_enabled: boolean;
  answer_bot_deflect: boolean;
  is_widget_enabled: boolean;
}

export type PlaygroundReplySource = "llm" | "articles" | "no_answer_text" | "silence";

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
