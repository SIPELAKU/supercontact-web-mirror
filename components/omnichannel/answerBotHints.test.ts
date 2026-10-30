import { describe, expect, it } from 'vitest';

import type { BotPlaygroundAskResponse, PlaygroundEffectiveConfig } from '@/lib/types/botPlayground';
import { fallbackReasonHint, isAiOffArticleList, isTitleListOnly } from './answerBotHints';

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

describe('fallbackReasonHint (playground, BE-7)', () => {
  const result = (
    reply_source: BotPlaygroundAskResponse['reply_source'],
    fallback_reason: BotPlaygroundAskResponse['fallback_reason'],
    use_llm = true
  ): Pick<BotPlaygroundAskResponse, 'reply_source' | 'effective_config' | 'fallback_reason'> => ({
    reply_source,
    fallback_reason,
    effective_config: { use_llm } as PlaygroundEffectiveConfig,
  });

  it('each known reason gets its own sentence', () => {
    const texts = ['llm_not_configured', 'llm_refused', 'llm_error', 'guardrail'].map((r) =>
      fallbackReasonHint(result('articles', r))
    );
    expect(texts.every(Boolean)).toBe(true);
    expect(new Set(texts).size).toBe(4);
    expect(fallbackReasonHint(result('no_answer_text', 'llm_refused'))).toMatch(/do not answer this question/);
  });

  it('the AI answered, or the API does not say (older BE): nothing', () => {
    expect(fallbackReasonHint(result('llm', null))).toBeNull();
    expect(fallbackReasonHint(result('llm', 'llm_refused'))).toBeNull();
    expect(fallbackReasonHint(result('articles', undefined))).toBeNull();
  });

  it('AI off on an article list: the existing AI-off hint already says it, no second line', () => {
    expect(fallbackReasonHint(result('articles', 'llm_off', false))).toBeNull();
  });

  it('AI off on another fallback (no-answer text): explained here', () => {
    expect(fallbackReasonHint(result('no_answer_text', 'llm_off', false))).toMatch(/Use AI to compose an answer/);
  });

  it('a reason this FE does not know: shown as its code', () => {
    expect(fallbackReasonHint(result('articles', 'rate_limited'))).toBe('The AI did not write an answer (rate_limited).');
  });
});
