import { describe, expect, it } from "vitest";

import {
  afterAgentOutcome,
  agentAnsweredSince,
  agentRequestLine,
  agentRequestMark,
  canRequestAgent,
  connectedAgentLine,
  msUntilAgentBusy,
  readAgentName,
  readAgentRequestedAt,
  readAgentRequestOutcome,
  showsAgentCards,
  type AgentRequestUi,
} from "./agentRequest";

const idle: AgentRequestUi = { state: "idle" };
const submitting: AgentRequestUi = { state: "submitting", source: "menu" };
const requested: AgentRequestUi = { state: "requested" };
const failed: AgentRequestUi = { state: "failed", source: "typed" };

describe("canRequestAgent / showsAgentCards", () => {
  it("only while nothing is under way, or after a failure", () => {
    expect([idle, submitting, requested, failed].map(canRequestAgent)).toEqual([true, false, false, true]);
    expect([idle, submitting, requested, failed].map(showsAgentCards)).toEqual([true, false, false, true]);
  });
});

describe("agentRequestLine", () => {
  it("connecting while sending and once handed over; a retry line after a failure", () => {
    expect(agentRequestLine(idle)).toBeNull();
    expect(agentRequestLine(submitting)).toBe("connecting");
    expect(agentRequestLine(requested)).toBe("connecting");
    expect(agentRequestLine(failed)).toBe("failed");
  });

  it("gone once an agent answered; only a handed-over request is affected", () => {
    expect(agentRequestLine(requested, true)).toBeNull();
    expect(agentRequestLine(submitting, true)).toBe("connecting");
    expect(agentRequestLine(failed, true)).toBe("failed");
    expect(agentRequestLine(idle, true)).toBeNull();
  });
});

describe("agentRequestMark", () => {
  it("the newest stored message, skipping local ones without an id", () => {
    expect(agentRequestMark([{ id: "a" }, { id: "b" }, {}])).toBe("b");
  });

  it("null while nothing is stored yet", () => {
    expect(agentRequestMark([])).toBeNull();
    expect(agentRequestMark([{}])).toBeNull();
  });
});

describe("agentAnsweredSince", () => {
  const thread = [
    { id: "bot1", direction: "inbound" },
    { id: "v1", direction: "outbound" },
  ];

  it("a team message after the mark is an answer", () => {
    expect(agentAnsweredSince([...thread, { id: "agent1", direction: "inbound" }], "v1")).toBe(true);
  });

  it("the team messages before the mark (bot answers) do not count", () => {
    expect(agentAnsweredSince(thread, "bot1")).toBe(false);
    expect(agentAnsweredSince([...thread, { id: "v2", direction: "outbound" }], "bot1")).toBe(false);
  });

  it("a request made on an empty thread: any stored team message counts", () => {
    expect(agentAnsweredSince([{ id: "v1", direction: "outbound" }], null)).toBe(false);
    expect(agentAnsweredSince([{ id: "v1", direction: "outbound" }, { id: "a", direction: "inbound" }], null)).toBe(true);
  });

  it("a team message not stored yet does not count", () => {
    expect(agentAnsweredSince([...thread, { direction: "inbound" }], "v1")).toBe(false);
  });

  it("no mark, or a mark no longer in the thread: not answered", () => {
    const answered = [...thread, { id: "agent1", direction: "inbound" }];
    expect(agentAnsweredSince(answered, undefined)).toBe(false);
    expect(agentAnsweredSince(answered, "gone")).toBe(false);
    // A local message has no id either: "no mark" must not match it.
    expect(agentAnsweredSince([{ direction: "outbound" }, { id: "agent1", direction: "inbound" }], undefined)).toBe(false);
  });
});

describe("readAgentRequestOutcome", () => {
  it("reads agent_request from POST /messages", () => {
    expect(readAgentRequestOutcome({ success: true, agent_request: { outcome: "escalated", ticket_code: "T-1" } })).toBe(
      "escalated",
    );
    expect(readAgentRequestOutcome({ success: true, agent_request: { outcome: "failed" } })).toBe("failed");
  });

  it("reads agent_requested from /start", () => {
    expect(readAgentRequestOutcome({ visitor_token: "t", agent_requested: true })).toBe("escalated");
  });

  it("a plain message, an older backend or a junk value: null", () => {
    expect(readAgentRequestOutcome({ success: true, agent_request: null })).toBeNull();
    expect(readAgentRequestOutcome({ success: true })).toBeNull();
    expect(readAgentRequestOutcome({ agent_request: { outcome: "maybe" } })).toBeNull();
    expect(readAgentRequestOutcome({ agent_requested: "true" })).toBeNull();
    expect(readAgentRequestOutcome(null)).toBeNull();
  });
});

describe("the wait for an agent (W5)", () => {
  const at = "2026-11-09T03:00:00.000Z";
  const start = Date.parse(at);
  const minutes = (n: number) => start + n * 60 * 1000;

  it("connecting for 5 minutes, then busy", () => {
    expect(agentRequestLine(requested, false, at, minutes(4.9))).toBe("connecting");
    expect(agentRequestLine(requested, false, at, minutes(5))).toBe("busy");
    expect(agentRequestLine(requested, false, at, minutes(60))).toBe("busy");
  });

  it("an agent's answer ends the wait", () => {
    expect(agentRequestLine(requested, true, at, minutes(60))).toBeNull();
  });

  it("no time known: keeps connecting", () => {
    expect(agentRequestLine(requested, false, null, minutes(60))).toBe("connecting");
    expect(agentRequestLine(requested, false, "not a date", minutes(60))).toBe("connecting");
  });

  it("msUntilAgentBusy counts down to zero and stops there", () => {
    expect(msUntilAgentBusy(at, minutes(1))).toBe(4 * 60 * 1000);
    expect(msUntilAgentBusy(at, minutes(6))).toBe(0);
  });
});

describe("outside business hours (W6)", () => {
  const offline: AgentRequestUi = { state: "offline" };

  it("shows the offline line and offers no more requests", () => {
    expect(agentRequestLine(offline)).toBe("offline");
    expect(canRequestAgent(offline)).toBe(false);
  });

  it("an agent's answer ends it", () => {
    expect(agentRequestLine(offline, true)).toBeNull();
  });

  it("is read from every response shape", () => {
    expect(readAgentRequestOutcome({ outcome: "offline" })).toBe("offline");
    expect(readAgentRequestOutcome({ agent_request: { outcome: "offline" } })).toBe("offline");
    expect(afterAgentOutcome(submitting, "offline", "menu")).toEqual(offline);
  });
});

describe("readAgentRequestedAt", () => {
  it("reads either response shape, nothing else", () => {
    expect(readAgentRequestedAt({ agent_requested_at: "t" })).toBe("t");
    expect(readAgentRequestedAt({ agent_request: { agent_requested_at: "t" } })).toBe("t");
    expect(readAgentRequestedAt({ agent_requested_at: 5 })).toBeNull();
    expect(readAgentRequestedAt(null)).toBeNull();
  });
});

describe("the connected line (W8)", () => {
  it("names the agent when known", () => {
    expect(connectedAgentLine("Anda terhubung dengan {name}", "Anda terhubung dengan agen", readAgentName({ name: " Rina " }))).toBe(
      "Anda terhubung dengan Rina",
    );
  });

  it("falls back without a usable name", () => {
    for (const agent of [null, undefined, {}, { name: "" }, { name: 5 }]) {
      expect(connectedAgentLine("x {name}", "plain", readAgentName(agent))).toBe("plain");
    }
  });
});

describe("afterAgentOutcome", () => {
  it("escalated: handed over, from any state", () => {
    expect(afterAgentOutcome(idle, "escalated", "typed")).toEqual(requested);
    expect(afterAgentOutcome(failed, "escalated", "typed")).toEqual(requested);
  });

  it("failed: remembers what to retry", () => {
    expect(afterAgentOutcome(idle, "failed", "typed")).toEqual({ state: "failed", source: "typed" });
    expect(afterAgentOutcome(submitting, "failed", "home")).toEqual({ state: "failed", source: "home" });
  });

  it("a failure never undoes a request that already went through", () => {
    expect(afterAgentOutcome(requested, "failed", "typed")).toEqual(requested);
  });

  it("no outcome: unchanged", () => {
    expect(afterAgentOutcome(idle, null, "typed")).toBe(idle);
    expect(afterAgentOutcome(failed, null, "typed")).toBe(failed);
  });
});
