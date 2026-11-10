import { describe, expect, it } from "vitest";
import { formatJoinedDate, localTime } from "./profileFormat";

describe("formatJoinedDate", () => {
  it("month and year", () => {
    expect(formatJoinedDate("2026-02-14T08:00:00Z")).toBe("Joined February 2026");
    expect(formatJoinedDate("2025-12-01")).toBe("Joined December 2025");
  });

  it("missing or unreadable", () => {
    for (const value of [undefined, null, "", "not a date"]) expect(formatJoinedDate(value)).toBe("Joined -");
  });
});

describe("localTime", () => {
  const noonUtc = new Date("2026-11-10T12:00:00Z");

  it("the clock in that time zone", () => {
    expect(localTime("Asia/Jakarta", noonUtc)).toBe("19:00");
    expect(localTime(" Asia/Tokyo ", noonUtc)).toBe("21:00");
    expect(localTime("UTC", noonUtc)).toBe("12:00");
  });

  it("no time zone, or one that does not exist", () => {
    for (const zone of [null, undefined, "", "Mars/Olympus"]) expect(localTime(zone, noonUtc)).toBeNull();
  });
});
