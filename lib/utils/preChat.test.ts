import { describe, expect, it } from "vitest";

import { isValidVisitorEmail, landingView, preChatErrors, startIdentityError } from "./preChat";

describe("isValidVisitorEmail", () => {
  it("accepts an ordinary address", () => {
    expect(isValidVisitorEmail("budi@example.com")).toBe(true);
    expect(isValidVisitorEmail("  budi.s@mail.example.co.id ")).toBe(true);
  });

  it("refuses an address without one @ and a dotted domain", () => {
    expect(isValidVisitorEmail("budi")).toBe(false);
    expect(isValidVisitorEmail("budi@example")).toBe(false);
    expect(isValidVisitorEmail("budi@@example.com")).toBe(false);
    expect(isValidVisitorEmail("@example.com")).toBe(false);
    expect(isValidVisitorEmail("budi@.com")).toBe(false);
    expect(isValidVisitorEmail("budi@example.")).toBe(false);
  });

  it("refuses spaces and over-long addresses", () => {
    expect(isValidVisitorEmail("budi santoso@example.com")).toBe(false);
    expect(isValidVisitorEmail(`${"a".repeat(250)}@x.co`)).toBe(false);
    expect(isValidVisitorEmail("")).toBe(false);
  });
});

describe("preChatErrors", () => {
  it("passes a name and a valid email", () => {
    expect(preChatErrors("Budi Santoso", "budi@example.com")).toBeNull();
  });

  it("flags an empty name and a bad email separately", () => {
    expect(preChatErrors("   ", "budi@example.com")).toEqual({ name: true, email: false });
    expect(preChatErrors("Budi", "budi")).toEqual({ name: false, email: true });
    expect(preChatErrors("", "")).toEqual({ name: true, email: true });
  });

  it("flags a name over 120 characters", () => {
    expect(preChatErrors("a".repeat(121), "budi@example.com")?.name).toBe(true);
    expect(preChatErrors("a".repeat(120), "budi@example.com")).toBeNull();
  });
});

describe("startIdentityError", () => {
  it("maps the backend's 400 messages to the form fields", () => {
    expect(startIdentityError(400, "Name is required")).toEqual({ name: true, email: false });
    expect(startIdentityError(400, "A valid email is required")).toEqual({ name: false, email: true });
  });

  it("treats other failures as send errors", () => {
    expect(startIdentityError(400, "Message cannot be empty")).toBeNull();
    expect(startIdentityError(500, "Name is required")).toBeNull();
    expect(startIdentityError(undefined, undefined)).toBeNull();
  });
});

describe("landingView", () => {
  it("asks for details before anything else", () => {
    expect(landingView({ hasSession: false, hasVisitor: false, showHomeScreen: true })).toBe("prechat");
  });

  it("opens the home screen or the thread once the details are in", () => {
    expect(landingView({ hasSession: false, hasVisitor: true, showHomeScreen: true })).toBe("home");
    expect(landingView({ hasSession: false, hasVisitor: true, showHomeScreen: false })).toBe("chat");
  });

  it("goes straight to the thread for a live chat", () => {
    expect(landingView({ hasSession: true, hasVisitor: false, showHomeScreen: true })).toBe("chat");
  });
});
