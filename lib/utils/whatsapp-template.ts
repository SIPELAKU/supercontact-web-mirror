// lib/utils/whatsapp-template.ts
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';

/**
 * The content type a template actually IS, ignoring its text fallback.
 *
 * Every rich type ships a `twilio/text` alongside it - the API requires one,
 * for channels that cannot render the rich form. It is a fallback, not the
 * template's type.
 *
 * Reading `Object.keys(types)[0]` returned that fallback almost every time,
 * because Postgres JSONB does not preserve insertion order: it stores object
 * keys sorted by (length, bytes), and `twilio/text` is 11 characters against
 * `twilio/carousel` at 15, `twilio/quick-reply` at 18, `twilio/media` at 12.
 * So a carousel opened as plain text - in the detail page, in its editor, and
 * in the preview shown while composing a broadcast.
 */
export function primaryContentType(
  types?: Record<string, unknown> | null
): BroadcastTemplateType | undefined {
  const keys = Object.keys(types || {}) as BroadcastTemplateType[];
  if (keys.length === 0) return undefined;
  return keys.find((k) => k !== 'twilio/text') ?? keys[0];
}
