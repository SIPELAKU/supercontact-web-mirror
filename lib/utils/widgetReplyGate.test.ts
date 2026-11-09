import { describe, expect, it } from "vitest";
import { widgetReplyState } from "./widgetReplyGate";

const widget = { channelType: "web_widget" as const, currentUserId: "rina" };

describe("widgetReplyState", () => {
  it("nobody holds the chat: Accept first", () => {
    expect(widgetReplyState({ ...widget, assignedUserId: null })).toBe("needs_accept");
    expect(widgetReplyState({ ...widget })).toBe("needs_accept");
  });

  it("an ended chat with no owner has nothing to accept", () => {
    for (const status of ["solved", "closed", "archived"]) {
      expect(widgetReplyState({ ...widget, status })).toBe("ended");
    }
    expect(widgetReplyState({ ...widget, status: "open" })).toBe("needs_accept");
  });

  it("an ended chat keeps its owner's state", () => {
    expect(widgetReplyState({ ...widget, status: "solved", assignedUserId: "rina" })).toBe("open");
    expect(widgetReplyState({ ...widget, status: "solved", assignedUserId: "andi" })).toBe("taken");
  });

  it("the agent's own chat: the reply box", () => {
    expect(widgetReplyState({ ...widget, assignedUserId: "rina" })).toBe("open");
  });

  it("another agent's chat: no reply box, no Accept", () => {
    expect(widgetReplyState({ ...widget, assignedUserId: "andi" })).toBe("taken");
  });

  it("before the chat and the profile have loaded: neither box nor Accept", () => {
    expect(widgetReplyState({ ...widget, loaded: false })).toBe("loading");
    expect(widgetReplyState({ ...widget, loaded: false, assignedUserId: "rina" })).toBe("loading");
  });

  it("other channels do not wait for the chat to load", () => {
    expect(widgetReplyState({ channelType: "whatsapp", loaded: false })).toBe("open");
  });

  it("other channels never need Accept", () => {
    for (const channelType of ["whatsapp", "email", "sms"] as const) {
      expect(widgetReplyState({ channelType, assignedUserId: null, currentUserId: "rina" })).toBe("open");
      expect(widgetReplyState({ channelType, assignedUserId: "andi", currentUserId: "rina" })).toBe("open");
    }
  });
});
