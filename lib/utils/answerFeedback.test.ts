import { describe, expect, it } from "vitest";

import {
  agentOfferMessageId,
  answerVoteView,
  canSubmitVote,
  readAnswerFeedback,
  readDismissedOffers,
  storedVote,
} from "./answerFeedback";

describe("readAnswerFeedback", () => {
  it("reads the deflection id and an empty vote", () => {
    expect(readAnswerFeedback({ deflection_id: "d1", vote: null })).toEqual({
      deflectionId: "d1",
      vote: null,
    });
  });

  it("keeps a vote already cast", () => {
    expect(readAnswerFeedback({ deflection_id: "d1", vote: "not_helpful" })?.vote).toBe("not_helpful");
  });

  it("gives no buttons without a deflection id", () => {
    expect(readAnswerFeedback(null)).toBeNull();
    expect(readAnswerFeedback(undefined)).toBeNull();
    expect(readAnswerFeedback({ vote: null })).toBeNull();
    expect(readAnswerFeedback({ deflection_id: "  " })).toBeNull();
  });

  it("treats an unknown vote value as no vote", () => {
    expect(readAnswerFeedback({ deflection_id: "d1", vote: "maybe" })?.vote).toBeNull();
  });
});

describe("answerVoteView", () => {
  const open = { deflectionId: "d1", vote: null };

  it("is clickable with no vote", () => {
    expect(answerVoteView(open)).toEqual({ vote: null, locked: false, error: false });
  });

  it("locks while the vote is being sent", () => {
    expect(answerVoteView(open, { state: "submitting" }).locked).toBe(true);
  });

  it("locks with the server's vote", () => {
    expect(answerVoteView({ deflectionId: "d1", vote: "helpful" })).toEqual({
      vote: "helpful",
      locked: true,
      error: false,
    });
  });

  it("locks with the stored vote when the history snapshot is older", () => {
    expect(answerVoteView(open, { vote: "not_helpful" })).toEqual({
      vote: "not_helpful",
      locked: true,
      error: false,
    });
  });

  it("unlocks with an error after a failed vote", () => {
    expect(answerVoteView(open, { state: "error" })).toEqual({ vote: null, locked: false, error: true });
  });

  it("drops a stale error once the server reports a vote", () => {
    expect(answerVoteView({ deflectionId: "d1", vote: "helpful" }, { state: "error" })).toEqual({
      vote: "helpful",
      locked: true,
      error: false,
    });
  });
});

describe("canSubmitVote", () => {
  it("allows a first vote and a retry after an error", () => {
    expect(canSubmitVote({ deflectionId: "d1", vote: null })).toBe(true);
    expect(canSubmitVote({ deflectionId: "d1", vote: null }, { state: "error" })).toBe(true);
  });

  it("refuses a second vote or a double click", () => {
    expect(canSubmitVote({ deflectionId: "d1", vote: "helpful" })).toBe(false);
    expect(canSubmitVote({ deflectionId: "d1", vote: null }, { vote: "helpful" })).toBe(false);
    expect(canSubmitVote({ deflectionId: "d1", vote: null }, { state: "submitting" })).toBe(false);
  });
});

describe("agentOfferMessageId", () => {
  const noAnswer = { id: "m2", direction: "inbound", offer_agent: true };
  const question = { id: "m1", direction: "outbound" };
  const none = new Set<string>();

  it("puts the card under the newest message when the backend marked it", () => {
    expect(agentOfferMessageId([question, noAnswer], false, none)).toBe("m2");
  });

  it("drops it from an older no-answer once anything newer arrives", () => {
    const followUp = { id: "m3", direction: "outbound" };
    expect(agentOfferMessageId([noAnswer, followUp], false, none)).toBeNull();
    const answer = { id: "m4", direction: "inbound", offer_agent: false };
    expect(agentOfferMessageId([noAnswer, followUp, answer], false, none)).toBeNull();
  });

  it("hides it once the visitor asked for an agent", () => {
    expect(agentOfferMessageId([question, noAnswer], true, none)).toBeNull();
  });

  it("hides the offer the visitor said no to, not a later one", () => {
    const dismissed = new Set(["m2"]);
    expect(agentOfferMessageId([question, noAnswer], false, dismissed)).toBeNull();
    const later = { id: "m5", direction: "inbound", offer_agent: true };
    expect(agentOfferMessageId([question, noAnswer, question, later], false, dismissed)).toBe("m5");
  });

  it("no card on an unmarked, id-less or empty thread", () => {
    expect(agentOfferMessageId([{ id: "m6", direction: "inbound" }], false, none)).toBeNull();
    expect(agentOfferMessageId([{ direction: "inbound", offer_agent: true }], false, none)).toBeNull();
    expect(agentOfferMessageId([], false, none)).toBeNull();
    // Only a bot/team bubble, never the visitor's own message.
    expect(agentOfferMessageId([{ id: "m7", direction: "outbound", offer_agent: true }], false, none)).toBeNull();
  });
});

describe("readDismissedOffers", () => {
  it("keeps the stored ids", () => {
    expect(readDismissedOffers(["m2", "m5"])).toEqual(["m2", "m5"]);
  });

  it("an older session or a broken value counts as none", () => {
    expect(readDismissedOffers(undefined)).toEqual([]);
    expect(readDismissedOffers("m2")).toEqual([]);
    expect(readDismissedOffers(["m2", 7, "", null])).toEqual(["m2"]);
  });
});

describe("storedVote", () => {
  it("uses the vote the server stored, not the click", () => {
    expect(storedVote({ success: true, vote: "helpful" }, false)).toBe("helpful");
  });

  it("falls back to the click when the response has no valid vote", () => {
    expect(storedVote({ success: true }, true)).toBe("helpful");
    expect(storedVote(null, false)).toBe("not_helpful");
  });
});
