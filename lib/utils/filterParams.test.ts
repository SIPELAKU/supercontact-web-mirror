import { describe, expect, it } from "vitest";
import { activeFilters, appendFilterParams } from "./filterParams";

describe("activeFilters", () => {
  it("keeps the filters that are set, as text", () => {
    expect(activeFilters({ status: "read", page_size: 5, archived: false })).toEqual({
      archived: "false",
      page_size: "5",
      status: "read",
    });
  });

  it("a cleared filter is no filter: empty text, null, undefined, empty list", () => {
    expect(activeFilters({ status: "", region: "  ", owner: null, tag: undefined, channel: [] })).toEqual({});
    expect(activeFilters(undefined)).toEqual({});
  });

  it("a multiselect is sent comma-joined, without empty items", () => {
    expect(activeFilters({ status: ["read", "", " failed "] })).toEqual({ status: "read,failed" });
    expect(activeFilters({ status: ["", " "] })).toEqual({});
  });

  it("values with no generic form (e.g. a date range object) are left out", () => {
    expect(activeFilters({ sent: { from: "2026-11-01", to: "2026-11-05" }, status: "sent" })).toEqual({
      status: "sent",
    });
    expect(activeFilters({ tags: [{ id: 1 }, "vip"] })).toEqual({ tags: "vip" });
  });

  it("the same filters in another order give the same keys, so one cache entry", () => {
    const a = activeFilters({ status: "read", channel: "wa" });
    const b = activeFilters({ channel: "wa", status: "read" });
    expect(Object.keys(a)).toEqual(Object.keys(b));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("appendFilterParams", () => {
  it("adds every set filter under its id, next to what is already there", () => {
    const params = new URLSearchParams({ page: "1" });
    appendFilterParams(params, { status: "failed", channel: ["wa", "sms"], owner: "" });
    expect(params.toString()).toBe("page=1&channel=wa%2Csms&status=failed");
  });

  it("no filters adds nothing", () => {
    const params = new URLSearchParams({ page: "1" });
    appendFilterParams(params);
    expect(params.toString()).toBe("page=1");
  });
});
