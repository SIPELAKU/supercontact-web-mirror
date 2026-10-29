import { describe, expect, it } from 'vitest';

import type { BotPlaygroundAskResponse, PlaygroundEffectiveConfig } from '@/lib/types/botPlayground';
import { isAiOffArticleList, isTitleListOnly } from './answerBotHints';

describe('isTitleListOnly (settings warning)', () => {
  it('answer bot on, AI off: warn - visitors only get article titles', () => {
    expect(isTitleListOnly({ answer_bot_enabled: true, answer_bot_use_llm: false })).toBe(true);
  });

  it('AI on, or the answer bot off: no warning', () => {
    expect(isTitleListOnly({ answer_bot_enabled: true, answer_bot_use_llm: true })).toBe(false);
    expect(isTitleListOnly({ answer_bot_enabled: false, answer_bot_use_llm: false })).toBe(false);
  });
});

describe('isAiOffArticleList (playground hint)', () => {
  const result = (
    reply_source: BotPlaygroundAskResponse['reply_source'],
    use_llm: boolean
  ): Pick<BotPlaygroundAskResponse, 'reply_source' | 'effective_config'> => ({
    reply_source,
    effective_config: { use_llm } as PlaygroundEffectiveConfig,
  });

  it('an article list from a test with AI off: hint', () => {
    expect(isAiOffArticleList(result('articles', false))).toBe(true);
  });

  it('an article list although AI was on (the AI declined): no hint - the warnings explain it', () => {
    expect(isAiOffArticleList(result('articles', true))).toBe(false);
  });

  it('any other reply: no hint', () => {
    expect(isAiOffArticleList(result('llm', true))).toBe(false);
    expect(isAiOffArticleList(result('no_answer_text', false))).toBe(false);
    expect(isAiOffArticleList(result('silence', false))).toBe(false);
  });
});
