import { describe, expect, it } from "vitest";

import { deflectionCardPlacement, readCardMessageId } from "./deflectionCard";

const visitor = (id: string) => ({ id, direction: "outbound" });
const bot = (id: string) => ({ id, direction: "inbound" });

describe("deflectionCardPlacement", () => {
  it("under its answer while that answer is the newest message", () => {
    expect(deflectionCardPlacement([visitor("v1"), bot("b1")], { messageId: "b1" }, true)).toEqual({ under: "b1" });
  });

  it("gone once anything newer arrives, answered or not - no stacking", () => {
    const thread = [visitor("v1"), bot("b1"), visitor("v2")];
    expect(deflectionCardPlacement(thread, { messageId: "b1" }, true)).toBeNull();
    expect(deflectionCardPlacement([...thread, bot("b2")], { messageId: "b1" }, true)).toBeNull();
  });

  it("never while a request for an agent is under way or done", () => {
    expect(deflectionCardPlacement([bot("b1")], { messageId: "b1" }, false)).toBeNull();
  });

  it("no card, or an empty thread: nothing", () => {
    expect(deflectionCardPlacement([bot("b1")], null, true)).toBeNull();
    expect(deflectionCardPlacement([], { messageId: "b1" }, true)).toBeNull();
  });

  it("older backend without message_id: at the bottom until the visitor writes again", () => {
    expect(deflectionCardPlacement([visitor("v1"), bot("b1")], {}, true)).toBe("bottom");
    expect(deflectionCardPlacement([visitor("v1"), bot("b1")], { messageId: null }, true)).toBe("bottom");
    expect(deflectionCardPlacement([bot("b1"), visitor("v2")], {}, true)).toBeNull();
  });
});

describe("readCardMessageId", () => {
  it("a message id, trimmed; anything else is none", () => {
    expect(readCardMessageId(" m1 ")).toBe("m1");
    expect(readCardMessageId("")).toBeUndefined();
    expect(readCardMessageId(null)).toBeUndefined();
    expect(readCardMessageId(42)).toBeUndefined();
  });
});
