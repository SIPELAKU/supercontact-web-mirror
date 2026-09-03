// lib/constants/whatsapp-limits.ts
//
// Provider caps for WhatsApp content templates. MIRROR of
// app/utils/whatsapp_limits.py in supercontact-api - the API validates against
// those numbers and this file caps the editor against the same ones.
//
// They must not drift. A UI cap looser than the server check builds a form that
// accepts work it then refuses to save; a tighter one silently hides capability
// the tenant is paying for. When these change, change both files together.
//
// CHECKED 2026-09-03 against Twilio's Content API reference and Meta's WhatsApp
// template documentation. Meta revises them.
//
// Two are easy to get wrong from memory:
//   - quick reply allows TEN buttons on a template. Three is the limit for
//     in-session messages sent WITHOUT template approval, which is not what
//     this feature builds.
//   - a carousel's card count is frozen at APPROVAL. An approved template sends
//     the number of cards it was approved with, so the count is a property of
//     the template rather than of the send.

export const LIMITS_CHECKED_ON = '2026-09-03';

export const QUICK_REPLY_MAX_ACTIONS = 10;
export const QUICK_REPLY_BODY_MAX = 1024;
export const QUICK_REPLY_TITLE_MAX = 20;
export const ACTION_ID_MAX = 200;

export const LIST_PICKER_MAX_ITEMS = 10;
export const LIST_PICKER_BODY_MAX = 1024;
export const LIST_PICKER_ITEM_MAX = 24;
export const LIST_PICKER_DESCRIPTION_MAX = 72;

export const CARD_MAX_ACTIONS = 10;
export const CARD_TITLE_MAX = 1024;
export const CARD_SUBTITLE_MAX = 60;

// Button text differs BY BUTTON TYPE, which is why this is two constants: a
// quick-reply button gets 20 characters, a URL or phone button gets 25.
export const BUTTON_TEXT_MAX_QUICK_REPLY = 20;
export const BUTTON_TEXT_MAX_URL_PHONE = 25;

export const CAROUSEL_MIN_CARDS = 2;
export const CAROUSEL_MAX_CARDS = 10;
export const CAROUSEL_MIN_CARD_ACTIONS = 1;
export const CAROUSEL_MAX_CARD_ACTIONS = 2;
// Title and body share ONE budget on a carousel card, unlike every other type.
export const CAROUSEL_CARD_TITLE_BODY_COMBINED_MAX = 160;

export const CTA_BODY_MAX = 1024;

// WhatsApp's own ceilings...
export const MEDIA_MAX_BYTES_IMAGE = 5 * 1024 * 1024;
export const MEDIA_MAX_BYTES_OTHER = 20 * 1024 * 1024;
// ...and ours, which is LOWER for everything except images. Solvera Storage
// refuses anything above this, so for video, audio and documents it is our
// limit that actually bites, not WhatsApp's.
export const STORAGE_MAX_BYTES = 10 * 1024 * 1024;

export const MEDIA_MIME_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
export const MEDIA_MIME_ALLOWED = [
  ...MEDIA_MIME_IMAGE,
  'video/mp4',
  'audio/ogg',
  'audio/amr',
  'audio/3gpp',
  'audio/aac',
  'audio/mpeg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/** The smaller of what WhatsApp allows for this type and what our storage takes. */
export function maxBytesFor(contentType?: string | null): number {
  const provider = MEDIA_MIME_IMAGE.includes((contentType || '').toLowerCase())
    ? MEDIA_MAX_BYTES_IMAGE
    : MEDIA_MAX_BYTES_OTHER;
  return Math.min(provider, STORAGE_MAX_BYTES);
}

/** Character budget for a button's title, which depends on the button's type. */
export function buttonTextMax(actionType?: string | null): number {
  const kind = (actionType || '').toUpperCase();
  return kind === 'URL' || kind === 'PHONE_NUMBER'
    ? BUTTON_TEXT_MAX_URL_PHONE
    : BUTTON_TEXT_MAX_QUICK_REPLY;
}

export function formatBytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
