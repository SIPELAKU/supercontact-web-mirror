import { describe, expect, it } from "vitest";
import type { Message } from "@/lib/types/omnichannel";
import {
  hasOlderMessages,
  isNearBottom,
  mergeConversationMessages,
  messageListSnapshot,
  messageScrollAction,
} from "./conversationMessages";

const msg = (n: number, extra: Partial<Message> = {}): Message => ({
  id: `m${n}`,
  conversation_id: "c1",
  direction: "inbound",
  content: `Message ${n}`,
  status: "sent",
  // One minute apart, so the number is the order.
  sent_at: new Date(Date.UTC(2026, 10, 5, 8, n)).toISOString(),
  created_at: new Date(Date.UTC(2026, 10, 5, 8, n)).toISOString(),
  ...extra,
});
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => msg(from + i));
const ids = (messages: Message[]) => messages.map((m) => m.id);

describe("mergeConversationMessages", () => {
  it("older pages go before the newest page, oldest first", () => {
    // Pages as the API sends them: page 1 newest, each page oldest first.
    const merged = mergeConversationMessages(range(5, 6), [range(3, 4), range(1, 2)]);
    expect(ids(merged)).toEqual(["m1", "m2", "m3", "m4", "m5", "m6"]);
  });

  it("a page shifted by a new message: the overlap shows once, nothing is missing", () => {
    // Page 2 was read after m7 arrived, so it repeats m4 from page 1.
    const merged = mergeConversationMessages(range(4, 7), [range(1, 4)]);
    expect(ids(merged)).toEqual(["m1", "m2", "m3", "m4", "m5", "m6", "m7"]);
  });

  it("page 1 slid on: a message shown before stays when passed back as retained", () => {
    // 57 messages: page 1 was m8-m57, page 2 m1-m7. m58 arrives: page 1 is
    // now m9-m58, and m8 is on neither page any more.
    const retained = range(1, 57);
    const merged = mergeConversationMessages(range(9, 58), [retained, range(1, 7)]);
    expect(ids(merged)).toEqual(ids(range(1, 58)));
  });

  it("the newest page wins a duplicate (fresher delivery status)", () => {
    const merged = mergeConversationMessages([msg(2, { status: "read" })], [[msg(1), msg(2, { status: "sent" })]]);
    expect(merged.find((m) => m.id === "m2")?.status).toBe("read");
  });

  it("orders by sent_at, then created_at; no sent_at falls back to created_at", () => {
    const sameMinute = new Date(Date.UTC(2026, 10, 5, 9, 0)).toISOString();
    const a = msg(10, { id: "a", sent_at: sameMinute, created_at: new Date(Date.UTC(2026, 10, 5, 9, 2)).toISOString() });
    const b = msg(11, { id: "b", sent_at: sameMinute, created_at: new Date(Date.UTC(2026, 10, 5, 9, 1)).toISOString() });
    const c = msg(12, { id: "c", sent_at: "", created_at: new Date(Date.UTC(2026, 10, 5, 8, 30)).toISOString() });
    expect(ids(mergeConversationMessages([a, b, c], []))).toEqual(["c", "b", "a"]);
  });

  it("sent_at decides before created_at; a message without sent_at goes by created_at", () => {
    const at = (minute: number) => new Date(Date.UTC(2026, 10, 5, 9, minute)).toISOString();
    // x was sent first but stored later; z has no sent_at and was stored last.
    const x = msg(20, { id: "x", sent_at: at(0), created_at: at(5) });
    const y = msg(21, { id: "y", sent_at: at(1), created_at: at(2) });
    const z = msg(22, { id: "z", sent_at: "", created_at: at(10) });
    // Whatever order they arrive in.
    for (const page of [[z, y, x], [x, y, z], [y, z, x], [z, x, y]]) {
      expect(ids(mergeConversationMessages(page, []))).toEqual(["x", "y", "z"]);
    }
  });

  it("no older pages: the newest page as it is", () => {
    expect(ids(mergeConversationMessages(range(1, 3), []))).toEqual(["m1", "m2", "m3"]);
  });
});

describe("hasOlderMessages", () => {
  it("only while fewer are loaded than the chat holds", () => {
    expect(hasOlderMessages(50, 57)).toBe(true);
    expect(hasOlderMessages(57, 57)).toBe(false);
    // An older API without total_messages: nothing to load.
    expect(hasOlderMessages(50, undefined)).toBe(false);
    expect(hasOlderMessages(50, null)).toBe(false);
  });
});

describe("isNearBottom", () => {
  it("closer than 120px to the end", () => {
    // scrollHeight 1000, viewport 400: the end is at scrollTop 600.
    expect(isNearBottom(1000, 600, 400)).toBe(true);
    expect(isNearBottom(1000, 481, 400)).toBe(true);
    expect(isNearBottom(1000, 480, 400)).toBe(false);
  });
});

describe("messageScrollAction", () => {
  const snap = (messages: Message[]) => messageListSnapshot(messages);
  const quiet = { atBottom: false, lastIsOutbound: false };

  it("a chat that opens, or another chat: jump to the newest", () => {
    expect(messageScrollAction(null, snap(range(1, 3)), quiet)).toBe("jump");
    expect(messageScrollAction(snap([]), snap(range(1, 3)), quiet)).toBe("jump");
    const other = range(1, 3).map((m) => ({ ...m, conversation_id: "c2" }));
    expect(messageScrollAction(snap(range(1, 3)), snap(other), quiet)).toBe("jump");
  });

  it("older messages added on top: keep the reader's place", () => {
    expect(messageScrollAction(snap(range(3, 5)), snap(range(1, 5)), quiet)).toBe("keep");
  });

  it("a new message: follow at the bottom or when the staff sent it, otherwise notify", () => {
    const before = snap(range(1, 3));
    const after = snap(range(1, 4));
    expect(messageScrollAction(before, after, { atBottom: true, lastIsOutbound: false })).toBe("follow");
    expect(messageScrollAction(before, after, { atBottom: false, lastIsOutbound: true })).toBe("follow");
    expect(messageScrollAction(before, after, quiet)).toBe("notify");
  });

  it("nothing new at either end (e.g. a delivery status): none", () => {
    expect(messageScrollAction(snap(range(1, 3)), snap(range(1, 3)), { atBottom: true, lastIsOutbound: true })).toBe(
      "none",
    );
    expect(messageScrollAction(snap(range(1, 3)), snap([]), quiet)).toBe("none");
  });
});
