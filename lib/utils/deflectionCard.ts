// lib/utils/deflectionCard.ts
//
// Where the true-deflection card ("Untuk informasi lebih lengkap, Anda bisa
// berbicara dengan agen kami. Mau dihubungkan?") goes in the embeddable widget
// (widget/src/widget.ts, bundled on its own by esbuild): right under the bot
// answer it belongs to, and only while that answer is the newest message.
// Once anything else arrives the card is gone, unanswered or not - the
// no-answer card follows the same rule, and one bot reply never carries both,
// so cards never stack. Keep this file free of imports: it ships inside the
// widget bundle.

export type DeflectionCardPlacement = { under: string } | "bottom" | null;

export function deflectionCardPlacement(
  messages: ReadonlyArray<{ id?: string; direction: string }>,
  card: { messageId?: string | null } | null,
  /** False while a request for an agent is under way or done. */
  allowed: boolean,
): DeflectionCardPlacement {
  if (!card || !allowed) return null;
  const last = messages[messages.length - 1];
  if (!last) return null;
  if (card.messageId) return last.id === card.messageId ? { under: card.messageId } : null;
  // No message_id (an older backend): at the bottom, while the newest message
  // is still the team's - a visitor reply retires it.
  return last.direction === "inbound" ? "bottom" : null;
}

/** `message_id` of a bot_suggestion frame or a replayed pending_deflection. */
export function readCardMessageId(raw: unknown): string | undefined {
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}
