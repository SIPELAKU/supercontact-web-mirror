import { describe, expect, it } from "vitest";
import { profileContactId, visitorEmail } from "./workspaceHelpers";

describe("visitorEmail", () => {
  it("prefers the fetched detail over the queue row", () => {
    expect(
      visitorEmail({ external_contact_email: "new@mail.com" }, { external_contact_email: "old@mail.com" }),
    ).toBe("new@mail.com");
  });

  it("falls back to the queue row while the detail is loading or has none", () => {
    expect(visitorEmail(undefined, { external_contact_email: "budi@mail.com" })).toBe("budi@mail.com");
    expect(visitorEmail({ external_contact_email: null }, { external_contact_email: "budi@mail.com" })).toBe(
      "budi@mail.com",
    );
  });

  it("is null when neither copy has an email", () => {
    expect(visitorEmail({ external_contact_email: null }, {})).toBeNull();
    expect(visitorEmail(undefined, { external_contact_email: "  " })).toBeNull();
  });
});

describe("profileContactId", () => {
  it("shows the contact as soon as the WS-refetched detail has it, before the queue polls", () => {
    expect(profileContactId({ contact_id: "k1" }, { contact_id: null })).toBe("k1");
  });

  it("prefers the detail when the queue row still holds an older contact (e.g. after a merge)", () => {
    expect(profileContactId({ contact_id: "k2" }, { contact_id: "k1" })).toBe("k2");
  });

  it("falls back to the queue row", () => {
    expect(profileContactId(undefined, { contact_id: "k1" })).toBe("k1");
  });

  it("is null for a widget chat still handled by the bot", () => {
    expect(profileContactId({ contact_id: null }, { contact_id: null })).toBeNull();
  });
});
