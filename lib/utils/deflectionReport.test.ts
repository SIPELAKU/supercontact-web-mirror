import { describe, expect, it } from "vitest";
import { resolvedWithoutAgentView } from "./deflectionReport";

describe("resolvedWithoutAgentView", () => {
  it("shows the share and the chats behind it", () => {
    expect(
      resolvedWithoutAgentView({ resolved_without_agent: 80, ended_bot_chats: 100, resolved_without_agent_pct: 80 }),
    ).toEqual({ pct: "80.0%", caption: "80 dari 100 chat" });
  });

  it("zero from the API is a real figure", () => {
    expect(
      resolvedWithoutAgentView({ resolved_without_agent: 0, ended_bot_chats: 0, resolved_without_agent_pct: 0 }),
    ).toEqual({ pct: "0.0%", caption: "0 dari 0 chat" });
  });

  it("before the API sends it: nothing, so the card keeps its old figure", () => {
    for (const summary of [null, undefined, {}, { resolved_without_agent_pct: null }]) {
      expect(resolvedWithoutAgentView(summary)).toBeNull();
    }
  });

  it("missing counts read as zero", () => {
    expect(resolvedWithoutAgentView({ resolved_without_agent_pct: 12.34 })).toEqual({
      pct: "12.3%",
      caption: "0 dari 0 chat",
    });
  });
});
