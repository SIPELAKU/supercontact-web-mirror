import { describe, expect, it } from "vitest";
import { quickActionEmoji, quickActionIconKey } from "./widgetQuickActionIcon";

describe("quickActionIconKey", () => {
  it("names one of the Settings keys, in any case and spacing", () => {
    expect(quickActionIconKey("chat")).toBe("chat");
    expect(quickActionIconKey(" Sales ")).toBe("sales");
    expect(quickActionIconKey("CALENDAR")).toBe("calendar");
  });

  it("is null for an emoji, an older word or nothing", () => {
    expect(quickActionIconKey("🏦")).toBeNull();
    expect(quickActionIconKey("dollar")).toBeNull();
    expect(quickActionIconKey("")).toBeNull();
    expect(quickActionIconKey(null)).toBeNull();
    expect(quickActionIconKey(undefined)).toBeNull();
  });
});

describe("quickActionEmoji", () => {
  it("returns the emoji of a Setup Cepat template as it is", () => {
    // Taken from the industry blueprints (banking and others).
    for (const emoji of ["🏦", "📋", "💳", "🔒", "⚠️", "🗂️", "↩️", "⛏️", "👩‍⚕️", "✈️"]) {
      expect(quickActionEmoji(emoji)).toBe(emoji);
    }
  });

  it("trims spaces around it, and allows a flag", () => {
    expect(quickActionEmoji("  🏦 ")).toBe("🏦");
    expect(quickActionEmoji("🇮🇩")).toBe("🇮🇩");
  });

  it("is null for a Settings key, a word, text with an emoji, or nothing", () => {
    expect(quickActionEmoji("chat")).toBeNull();
    expect(quickActionEmoji("question")).toBeNull();
    expect(quickActionEmoji("Bank 🏦")).toBeNull();
    expect(quickActionEmoji("1")).toBeNull();
    expect(quickActionEmoji("-")).toBeNull();
    expect(quickActionEmoji("")).toBeNull();
    expect(quickActionEmoji(null)).toBeNull();
  });

  it("is null for a long run, which is not one icon", () => {
    expect(quickActionEmoji("🏦".repeat(9))).toBeNull();
  });
});
