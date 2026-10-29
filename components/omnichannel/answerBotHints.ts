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
