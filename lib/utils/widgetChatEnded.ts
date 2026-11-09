// lib/utils/widgetChatEnded.ts
//
// A chat that is Solved, Closed or Archived is over (W2): the API refuses new
// messages in it and the visitor starts a new chat. Keep this file free of
// imports: it ships inside the widget bundle.

const ENDED_STATUSES = ["solved", "closed", "archived"];

export const CONVERSATION_ENDED_CODE = "CONVERSATION_ENDED";

/** Snoozed and open chats are still going. */
export function isEndedStatus(status: unknown): boolean {
  return typeof status === "string" && ENDED_STATUSES.includes(status);
}

/** The API refused because the chat is over, as opposed to any other 409. */
export function isConversationEndedError(error: unknown): boolean {
  const e = error as { status?: unknown; code?: unknown } | null | undefined;
  return e?.status === 409 && e?.code === CONVERSATION_ENDED_CODE;
}

/** The visitor from GET /conversation, so a new chat needs no form. Both
 *  fields are required by /start, so half an identity is no identity. */
export function readVisitorIdentity(visitor: unknown): { name: string; email: string } | null {
  const v = visitor as { name?: unknown; email?: unknown } | null | undefined;
  const name = typeof v?.name === "string" ? v.name.trim() : "";
  const email = typeof v?.email === "string" ? v.email.trim() : "";
  return name && email ? { name, email } : null;
}
