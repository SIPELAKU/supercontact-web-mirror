// components/omnichannel/answerBotHints.ts
//
// Without AI the answer bot only sends a list of matching article titles. That
// reads like a broken bot, and it is what visitors get by default: AI stays off
// until someone ticks "Use AI to compose an answer". These decide where to say so.

import type { BotPlaygroundAskResponse } from "@/lib/types/botPlayground";

/** Settings: the answer bot is on, but it can only list article titles. */
export function isTitleListOnly(config: {
  answer_bot_enabled: boolean;
  answer_bot_use_llm: boolean;
}): boolean {
  return config.answer_bot_enabled && !config.answer_bot_use_llm;
}

/** Playground: this reply is the article list only because AI was off for the test. */
export function isAiOffArticleList(
  result: Pick<BotPlaygroundAskResponse, "reply_source" | "effective_config">
): boolean {
  return result.reply_source === "articles" && result.effective_config?.use_llm === false;
}

const FALLBACK_REASON: Record<string, string> = {
  llm_off: 'AI is off, so the bot did not write an answer. Turn on "Use AI to compose an answer".',
  llm_not_configured: "No AI model is configured for this company. Contact the technical team.",
  llm_refused:
    "The AI judged that the matched articles do not answer this question. Complete the article or add a new one.",
  llm_error: "The AI call failed (quota or timeout). Try again.",
  guardrail: "The AI's answer was held back because it broke an article's rules.",
};

/** Playground: why the AI wrote no answer, from the API's `fallback_reason`
 *  (BE-7). null when it did answer, when the API does not say, and for AI off
 *  on an article list - isAiOffArticleList already explains that one. */
export function fallbackReasonHint(
  result: Pick<BotPlaygroundAskResponse, "reply_source" | "effective_config" | "fallback_reason">
): string | null {
  const reason = result.fallback_reason;
  if (!reason || result.reply_source === "llm") return null;
  if (reason === "llm_off" && isAiOffArticleList(result)) return null;
  return FALLBACK_REASON[reason] ?? `The AI did not write an answer (${reason}).`;
}
