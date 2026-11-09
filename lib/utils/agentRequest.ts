// lib/utils/agentRequest.ts
//
// One way to bring in a person from the embeddable widget (widget/src/widget.ts,
// bundled on its own by esbuild): every "talk to an agent" control - the
// deflection card, the no-answer card, the ⋮ menu, the Home button - and a
// typed request ("admin dong") end in the same state, shown the same way:
// the note "Menghubungkan Anda dengan tim kami…", no visitor bubble on the
// visitor's behalf, no bot reply (BE 1.157.0, request_agent). Keep this file
// free of imports: it ships inside the widget bundle.

export type AgentRequestSource = "deflection" | "no_answer" | "menu" | "home" | "typed";

export type AgentRequestUi =
  | { state: "idle" }
  | { state: "submitting"; source: AgentRequestSource }
  | { state: "requested" }
  // Asked outside business hours: no one will pick it up for now (W6).
  | { state: "offline" }
  | { state: "failed"; source: AgentRequestSource };

// How long "Menghubungkan…" is shown before saying the team is busy (W5).
export const AGENT_BUSY_AFTER_MS = 5 * 60 * 1000;

/** A new request may start: nothing under way, or the last one failed. */
export function canRequestAgent(ui: AgentRequestUi): boolean {
  return ui.state === "idle" || ui.state === "failed";
}

/** The cards that offer an agent (no-answer card, deflection card) only show
 *  while no request is under way or done; a failed one brings them back. */
export function showsAgentCards(ui: AgentRequestUi): boolean {
  return canRequestAgent(ui);
}

/** The line under the thread: "connecting" while sending and once handed
 *  over, "busy" after 5 minutes of that, "offline" outside business hours,
 *  "failed" with a retry, nothing otherwise. The widget stops showing it once
 *  the API says an agent has the chat; a message alone proves nothing, as the
 *  idle "still there?" warning looks the same as an agent's reply. */
export function agentRequestLine(
  ui: AgentRequestUi,
  requestedAt?: string | null,
  now: number = Date.now(),
): "connecting" | "busy" | "offline" | "failed" | null {
  if (ui.state === "submitting") return "connecting";
  if (ui.state === "requested") return msUntilAgentBusy(requestedAt, now) === 0 ? "busy" : "connecting";
  if (ui.state === "offline") return "offline";
  if (ui.state === "failed") return "failed";
  return null;
}

/** Time left before the team counts as busy; the full wait for a time that
 *  is missing or unreadable, so "Menghubungkan…" simply stays. */
export function msUntilAgentBusy(requestedAt: string | null | undefined, now: number = Date.now()): number {
  const at = requestedAt ? Date.parse(requestedAt) : NaN;
  if (Number.isNaN(at)) return AGENT_BUSY_AFTER_MS;
  return Math.max(0, at + AGENT_BUSY_AFTER_MS - now);
}

export type AgentRequestOutcome = "escalated" | "offline" | "failed";

/** What a response says about an agent request: `outcome` on POST
 *  /request-agent, `agent_request.outcome` on POST /messages, `agent_requested`
 *  from /start. null when the message was not a request for an agent. */
export function readAgentRequestOutcome(response: unknown): AgentRequestOutcome | null {
  const r = response as {
    outcome?: unknown;
    agent_request?: { outcome?: unknown } | null;
    agent_requested?: unknown;
  } | null;
  const outcome = r?.agent_request?.outcome ?? r?.outcome;
  if (outcome === "escalated" || outcome === "offline" || outcome === "failed") return outcome;
  return r?.agent_requested === true ? "escalated" : null;
}

/** When the visitor asked for an agent, from the same responses or a frame. */
export function readAgentRequestedAt(response: unknown): string | null {
  const r = response as { agent_requested_at?: unknown; agent_request?: { agent_requested_at?: unknown } | null } | null;
  const at = r?.agent_request?.agent_requested_at ?? r?.agent_requested_at;
  return typeof at === "string" && at ? at : null;
}

/** The agent's name from `agent_connected` or GET /conversation (W8). */
export function readAgentName(agent: unknown): string | null {
  const name = (agent as { name?: unknown } | null | undefined)?.name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

/** "Anda terhubung dengan Rina", or the plain line without a name. */
export function connectedAgentLine(named: string, plain: string, name: string | null): string {
  return name ? named.replace("{name}", name) : plain;
}

/** The state after a response reported an outcome. A failure never undoes a
 *  request that already went through (another tab, a WS frame). */
export function afterAgentOutcome(
  ui: AgentRequestUi,
  outcome: AgentRequestOutcome | null,
  source: AgentRequestSource,
): AgentRequestUi {
  if (outcome === "escalated") return { state: "requested" };
  if (outcome === "offline") return { state: "offline" };
  if (outcome === "failed" && ui.state !== "requested") return { state: "failed", source };
  return ui;
}
