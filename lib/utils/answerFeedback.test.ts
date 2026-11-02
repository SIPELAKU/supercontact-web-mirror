import { describe, expect, it } from "vitest";

import {
  answerVoteView,
  canSubmitVote,
  readAnswerFeedback,
  showsAgentOffer,
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

describe("showsAgentOffer", () => {
  it("shows the button on a bubble the backend marked", () => {
    expect(showsAgentOffer(true, false)).toBe(true);
  });

  it("hides it once the visitor asked for an agent", () => {
    expect(showsAgentOffer(true, true)).toBe(false);
  });

  it("hides it on any other bubble", () => {
    expect(showsAgentOffer(false, false)).toBe(false);
    expect(showsAgentOffer(undefined, false)).toBe(false);
    expect(showsAgentOffer("true", false)).toBe(false);
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
