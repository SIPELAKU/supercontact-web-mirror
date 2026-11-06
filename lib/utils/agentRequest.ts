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
  | { state: "failed"; source: AgentRequestSource };

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
 *  over until an agent answers, "failed" with a retry, nothing otherwise. */
export function agentRequestLine(
  ui: AgentRequestUi,
  agentAnswered = false,
): "connecting" | "failed" | null {
  if (ui.state === "submitting") return "connecting";
  if (ui.state === "requested") return agentAnswered ? null : "connecting";
  if (ui.state === "failed") return "failed";
  return null;
}

/** Where the thread stood when a request for an agent went through: the id of
 *  the newest stored message, or null while nothing is stored yet. Kept with
 *  the session so a reload still knows what came after it. */
export function agentRequestMark(messages: ReadonlyArray<{ id?: string }>): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const id = messages[i].id;
    if (id) return id;
  }
  return null;
}

/** A team message (UI "inbound", stored) came after the mark. Once a request
 *  goes through the bot and flows stay quiet, so that is an agent - the one
 *  exception the widget cannot tell apart is the idle "still there?" warning
 *  (messages carry no sender). No mark, or one no longer in the thread, counts
 *  as not answered: "Menghubungkan…" stays. */
export function agentAnsweredSince(
  messages: ReadonlyArray<{ id?: string; direction: string }>,
  mark: string | null | undefined,
): boolean {
  if (mark === undefined) return false;
  const start = mark === null ? 0 : messages.findIndex((m) => m.id === mark) + 1;
  if (mark !== null && start === 0) return false;
  return messages.slice(start).some((m) => m.direction === "inbound" && !!m.id);
}

/** What a POST /messages or /start response says about an agent request:
 *  `agent_request.outcome`, or `agent_requested: true` from /start. null
 *  when the message was not a request for an agent. */
export function readAgentRequestOutcome(response: unknown): "escalated" | "failed" | null {
  const r = response as { agent_request?: { outcome?: unknown } | null; agent_requested?: unknown } | null;
  const outcome = r?.agent_request?.outcome;
  if (outcome === "escalated" || outcome === "failed") return outcome;
  return r?.agent_requested === true ? "escalated" : null;
}

/** An online agent took the chat at once: `assigned` on POST /request-agent
 *  and /start, `agent_request.assigned` on POST /messages. A later pick-up
 *  in the Workspace is not reported to the widget (no event for it yet). */
export function readAgentAssigned(response: unknown): boolean {
  const r = response as { assigned?: unknown; agent_request?: { assigned?: unknown } | null } | null;
  return r?.assigned === true || r?.agent_request?.assigned === true;
}

/** The state after a response reported an outcome. A failure never undoes a
 *  request that already went through (another tab, a WS frame). */
export function afterAgentOutcome(
  ui: AgentRequestUi,
  outcome: "escalated" | "failed" | null,
  source: AgentRequestSource,
): AgentRequestUi {
  if (outcome === "escalated") return { state: "requested" };
  if (outcome === "failed" && ui.state !== "requested") return { state: "failed", source };
  return ui;
}
