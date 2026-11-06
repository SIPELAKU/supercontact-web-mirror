// lib/utils/answerFeedback.ts
//
// State rules for the 👍/👎 under a bot answer in the embeddable widget
// (widget/src/widget.ts, bundled on its own by esbuild). The backend decides
// which bubbles get the buttons by sending `answer_feedback` on the message;
// the widget never guesses from the text, sender or AI settings. Keep this
// file free of imports: it ships inside the widget bundle.

export type AnswerVote = "helpful" | "not_helpful";

export interface AnswerFeedback {
  deflectionId: string;
  vote: AnswerVote | null;
}

// Client-only state per answer, kept outside the message objects because a
// history resync rebuilds every message from the server.
export interface AnswerVoteUi {
  // The vote the server stored, from the POST response. Covers a resync whose
  // snapshot was taken before the vote landed.
  vote?: AnswerVote;
  state?: "submitting" | "error";
}

export interface AnswerVoteView {
  vote: AnswerVote | null;
  locked: boolean;
  error: boolean;
}

function asVote(value: unknown): AnswerVote | null {
  return value === "helpful" || value === "not_helpful" ? value : null;
}

// `answer_feedback` from a WS "message" frame or a history item. Anything
// without a deflection id means no buttons.
export function readAnswerFeedback(raw: unknown): AnswerFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { deflection_id?: unknown; vote?: unknown };
  const deflectionId = typeof r.deflection_id === "string" ? r.deflection_id.trim() : "";
  if (!deflectionId) return null;
  return { deflectionId, vote: asVote(r.vote) };
}

export function answerVoteView(feedback: AnswerFeedback, ui?: AnswerVoteUi): AnswerVoteView {
  const vote = feedback.vote ?? ui?.vote ?? null;
  return {
    vote,
    locked: vote !== null || ui?.state === "submitting",
    error: vote === null && ui?.state === "error",
  };
}

// A vote is final, so a click only counts while nothing is stored or sent.
export function canSubmitVote(feedback: AnswerFeedback, ui?: AnswerVoteUi): boolean {
  return !answerVoteView(feedback, ui).locked;
}

// The no-answer reply that gets the "talk to an agent?" card, or null. Only
// the newest message, so older no-answer replies don't stack cards; only when
// the backend marked it; never once the visitor asked for an agent or said no
// to this particular offer.
export function agentOfferMessageId(
  messages: ReadonlyArray<{ id?: string; direction: string; offer_agent?: boolean }>,
  agentRequested: boolean,
  dismissed: ReadonlySet<string>,
): string | null {
  if (agentRequested) return null;
  const last = messages[messages.length - 1];
  if (!last || last.direction !== "inbound" || last.offer_agent !== true || !last.id) return null;
  return dismissed.has(last.id) ? null : last.id;
}

// Offers the visitor said no to, as stored with the session. Anything that
// isn't a list of ids (an older session, a hand-edited value) counts as none.
export function readDismissedOffers(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string" && id !== "") : [];
}

// The server returns the vote it stored (an earlier vote wins over this
// click), so that value drives the buttons, not the one clicked.
export function storedVote(response: unknown, helpful: boolean): AnswerVote {
  const vote = asVote((response as { vote?: unknown } | null)?.vote);
  return vote ?? (helpful ? "helpful" : "not_helpful");
}
