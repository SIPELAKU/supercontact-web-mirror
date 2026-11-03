import { describe, expect, it } from "vitest";

import { columnVisibilityKey, readColumnVisibility } from "./columnVisibilityStorage";

describe("columnVisibilityKey", () => {
  it("one key per table", () => {
    expect(columnVisibilityKey("kb-articles-table")).toBe("st_cv_kb-articles-table");
    expect(columnVisibilityKey("kb-articles-table")).not.toBe(columnVisibilityKey("subscribers-table"));
  });
});

describe("readColumnVisibility", () => {
  it("reads back the hidden and shown columns", () => {
    expect(readColumnVisibility('{"locale":false,"view_count":false,"status":true}')).toEqual({
      locale: false,
      view_count: false,
      status: true,
    });
  });

  it("nothing stored, or not JSON: no choice", () => {
    expect(readColumnVisibility(null)).toEqual({});
    expect(readColumnVisibility("")).toEqual({});
    expect(readColumnVisibility("{locale:false")).toEqual({});
  });

  it("not a column map: no choice", () => {
    expect(readColumnVisibility("[false]")).toEqual({});
    expect(readColumnVisibility("true")).toEqual({});
    expect(readColumnVisibility("null")).toEqual({});
  });

  it("drops entries that aren't true/false, keeps the rest", () => {
    expect(readColumnVisibility('{"locale":false,"view_count":"no","status":1}')).toEqual({ locale: false });
  });
});
