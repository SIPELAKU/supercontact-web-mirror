import { describe, expect, it } from "vitest";
import { isConversationEndedError, isEndedStatus, readVisitorIdentity } from "./widgetChatEnded";

describe("isEndedStatus", () => {
  it("solved, closed and archived are over", () => {
    for (const status of ["solved", "closed", "archived"]) expect(isEndedStatus(status)).toBe(true);
  });

  it("everything else is still going", () => {
    for (const status of ["open", "snoozed", "", null, undefined, 5]) expect(isEndedStatus(status)).toBe(false);
  });
});

describe("isConversationEndedError", () => {
  it("is the 409 with its own code", () => {
    expect(isConversationEndedError({ status: 409, code: "CONVERSATION_ENDED" })).toBe(true);
  });

  it("other failures stay ordinary failures", () => {
    expect(isConversationEndedError({ status: 409, code: "CONFLICT" })).toBe(false);
    expect(isConversationEndedError({ status: 409 })).toBe(false);
    expect(isConversationEndedError({ status: 500, code: "CONVERSATION_ENDED" })).toBe(false);
    expect(isConversationEndedError(null)).toBe(false);
  });
});

describe("readVisitorIdentity", () => {
  it("trims a complete identity", () => {
    expect(readVisitorIdentity({ name: " Budi ", email: " budi@example.com " })).toEqual({
      name: "Budi",
      email: "budi@example.com",
    });
  });

  it("half an identity is none: the form asks again", () => {
    for (const visitor of [null, undefined, {}, { name: "Budi" }, { email: "b@e.co" }, { name: " ", email: "b@e.co" }, { name: 5, email: "b@e.co" }]) {
      expect(readVisitorIdentity(visitor)).toBeNull();
    }
  });
});
