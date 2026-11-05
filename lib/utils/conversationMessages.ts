// lib/utils/conversationMessages.ts
//
// FE-8: a chat opens at its newest messages and loads older ones on scroll.
// `GET /omnichannels/conversations/{id}?page=N&limit=50` (API 1.163.4): page 1
// is the newest 50, page 2 the 50 before them, each page oldest first, and
// `total_messages` counts the whole chat. A message arriving while older pages
// load shifts every page by one towards the newer side: one message can come
// twice, none is skipped.

import type { Message } from "@/lib/types/omnichannel";

// Messages per page, for every page: the offsets only line up when page 1
// (useConversation) and the older pages ask for the same size.
export const CONVERSATION_PAGE_SIZE = 50;

// "At the bottom": closer than this to the end of the chat.
export const NEAR_BOTTOM_PX = 120;

const timeOf = (iso: string | undefined) => {
  const time = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(time) ? null : time;
};

// The API's order: sent_at, then created_at.
function compareMessages(a: Message, b: Message): number {
  const sentA = timeOf(a.sent_at) ?? timeOf(a.created_at) ?? 0;
  const sentB = timeOf(b.sent_at) ?? timeOf(b.created_at) ?? 0;
  if (sentA !== sentB) return sentA - sentB;
  return (timeOf(a.created_at) ?? 0) - (timeOf(b.created_at) ?? 0);
}

/**
 * The newest page plus the older pages loaded so far, oldest first, each
 * message once. The newest page wins a duplicate: it is the fresher copy
 * (a delivery status may have changed).
 */
export function mergeConversationMessages(newestPage: Message[], olderPages: Message[][]): Message[] {
  const byId = new Map<string, Message>();
  for (const page of olderPages) for (const message of page) byId.set(message.id, message);
  for (const message of newestPage) byId.set(message.id, message);
  return Array.from(byId.values()).sort(compareMessages);
}

/** More messages exist than are loaded; unknown total = nothing to load. */
export function hasOlderMessages(loaded: number, total: number | null | undefined): boolean {
  return typeof total === "number" && loaded < total;
}

/** Whether a scroll position is close enough to the end to follow new messages. */
export function isNearBottom(scrollHeight: number, scrollTop: number, clientHeight: number): boolean {
  return scrollHeight - scrollTop - clientHeight < NEAR_BOTTOM_PX;
}

/** What the list showed, enough to tell what changed. */
export interface MessageListSnapshot {
  conversationId: string | undefined;
  firstId: string | undefined;
  lastId: string | undefined;
}

export function messageListSnapshot(messages: Message[]): MessageListSnapshot {
  return {
    conversationId: messages[0]?.conversation_id,
    firstId: messages[0]?.id,
    lastId: messages[messages.length - 1]?.id,
  };
}

/**
 * What the scroll does after the messages change:
 * - `jump`: a chat opened (or another one): straight to the newest, no animation;
 * - `keep`: older messages were added on top: the message being read stays put;
 * - `follow`: a new message while at the bottom, or one the staff sent: glide down;
 * - `notify`: a new message while reading older ones: offer "New messages ↓";
 * - `none`: nothing that moves the view (e.g. a delivery status).
 */
export type MessageScrollAction = "jump" | "keep" | "follow" | "notify" | "none";

export function messageScrollAction(
  prev: MessageListSnapshot | null,
  next: MessageListSnapshot,
  { atBottom, lastIsOutbound }: { atBottom: boolean; lastIsOutbound: boolean },
): MessageScrollAction {
  if (!next.lastId) return "none";
  if (!prev?.lastId || prev.conversationId !== next.conversationId) return "jump";
  if (next.lastId !== prev.lastId) {
    return atBottom || lastIsOutbound ? "follow" : "notify";
  }
  if (next.firstId !== prev.firstId) return "keep";
  return "none";
}
