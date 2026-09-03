import { describe, it, expect } from 'vitest';
import { primaryContentType } from './whatsapp-template';

/**
 * The gap this closes: for years the template detail page reported a carousel
 * as `twilio/text`, and its editor rendered a text box where the carousel
 * belonged. Six call sites read `Object.keys(types)[0]`. Nothing caught it,
 * because nothing compared what a page DISPLAYS to what the record IS.
 *
 * The fixtures below are not invented orders. They are the key orders Postgres
 * JSONB actually returns - it stores object keys sorted by (length, bytes), so
 * the 11-character `twilio/text` fallback sorts ahead of every rich type.
 */
describe('primaryContentType', () => {
  it('returns the rich type, not the text fallback, in JSONB key order', () => {
    // Exactly as read from broadcast_templates on dev, 2026-09-03.
    expect(primaryContentType({ 'twilio/text': {}, 'twilio/carousel': {} })).toBe('twilio/carousel');
    expect(primaryContentType({ 'twilio/text': {}, 'twilio/quick-reply': {} })).toBe('twilio/quick-reply');
    expect(primaryContentType({ 'twilio/text': {}, 'twilio/list-picker': {} })).toBe('twilio/list-picker');
    expect(primaryContentType({ 'twilio/text': {}, 'twilio/media': {} })).toBe('twilio/media');
  });

  it('is insensitive to key order - the whole point', () => {
    expect(primaryContentType({ 'twilio/carousel': {}, 'twilio/text': {} })).toBe('twilio/carousel');
  });

  it('keeps twilio/text for a template that genuinely is only text', () => {
    expect(primaryContentType({ 'twilio/text': { body: 'halo' } })).toBe('twilio/text');
  });

  it('handles the types with no fallback at all', () => {
    expect(primaryContentType({ 'whatsapp/authentication': {} })).toBe('whatsapp/authentication');
    expect(primaryContentType({ 'twilio/card': {} })).toBe('twilio/card');
  });

  it('yields undefined for an empty or missing types object', () => {
    expect(primaryContentType({})).toBeUndefined();
    expect(primaryContentType(null)).toBeUndefined();
    expect(primaryContentType(undefined)).toBeUndefined();
  });

  it('would have failed on the old expression', () => {
    // The regression, stated as code: this is what the six call sites did.
    const jsonbOrder = { 'twilio/text': {}, 'twilio/carousel': {} };
    const old = Object.keys(jsonbOrder)[0];
    expect(old).toBe('twilio/text'); // the bug
    expect(primaryContentType(jsonbOrder)).not.toBe(old); // the fix
  });
});
