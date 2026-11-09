import { describe, expect, it } from "vitest";

import { dayKey, dayLabel, formatMessageTime, parseMessageTime } from "./widgetTime";

// Local-time constructors, so the tests hold in any time zone the suite runs in.
const at = (y: number, m: number, d: number, h = 10, min = 12) => new Date(y, m - 1, d, h, min);
const ID_WORDS = { today: "Hari ini", yesterday: "Kemarin" };
const EN_WORDS = { today: "Today", yesterday: "Yesterday" };

describe("parseMessageTime", () => {
  it("reads an ISO time from the server", () => {
    expect(parseMessageTime("2026-11-03T03:12:00Z")?.toISOString()).toBe("2026-11-03T03:12:00.000Z");
  });

  it("no time, or one that doesn't parse: null", () => {
    expect(parseMessageTime(undefined)).toBeNull();
    expect(parseMessageTime(null)).toBeNull();
    expect(parseMessageTime("")).toBeNull();
    expect(parseMessageTime("kemarin sore")).toBeNull();
  });
});

describe("formatMessageTime", () => {
  it("Indonesian: 24-hour with a dot", () => {
    expect(formatMessageTime(at(2026, 11, 3, 10, 12), "id")).toBe("10.12");
    expect(formatMessageTime(at(2026, 11, 3, 21, 5), "id")).toBe("21.05");
    expect(formatMessageTime(at(2026, 11, 3, 9, 5), "id")).toBe("09.05");
  });

  it("English: 12-hour with AM/PM", () => {
    expect(formatMessageTime(at(2026, 11, 3, 10, 12), "en")).toBe("10:12 AM");
    expect(formatMessageTime(at(2026, 11, 3, 21, 5), "en")).toBe("9:05 PM");
  });
});

describe("dayKey", () => {
  it("same calendar day, same key; the next minute after midnight is a new day", () => {
    expect(dayKey(at(2026, 11, 3, 0, 1))).toBe(dayKey(at(2026, 11, 3, 23, 59)));
    expect(dayKey(at(2026, 11, 3, 23, 59))).not.toBe(dayKey(at(2026, 11, 4, 0, 0)));
  });
});

describe("dayLabel", () => {
  const now = at(2026, 11, 3, 9, 0);

  it("today and yesterday by name", () => {
    expect(dayLabel(at(2026, 11, 3, 0, 5), now, "id", ID_WORDS)).toBe("Hari ini");
    expect(dayLabel(at(2026, 11, 2, 23, 59), now, "id", ID_WORDS)).toBe("Kemarin");
    expect(dayLabel(at(2026, 11, 2, 8, 0), now, "en", EN_WORDS)).toBe("Yesterday");
  });

  it("older days as a date", () => {
    expect(dayLabel(at(2026, 11, 1), now, "id", ID_WORDS)).toBe("1 Nov 2026");
    expect(dayLabel(at(2026, 11, 1), now, "en", EN_WORDS)).toBe("Nov 1, 2026");
  });

  it("yesterday across a month boundary", () => {
    expect(dayLabel(at(2026, 10, 31, 22, 0), at(2026, 11, 1, 7, 0), "id", ID_WORDS)).toBe("Kemarin");
  });
});
