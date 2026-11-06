import { describe, expect, it } from "vitest";

import {
  columnVisibilityKey,
  readColumnVisibility,
  remembersColumns,
  saveColumnVisibility,
} from "./columnVisibilityStorage";

describe("columnVisibilityKey", () => {
  it("one key per table", () => {
    expect(columnVisibilityKey("kb-articles-table")).toBe("st_cv_kb-articles-table");
    expect(columnVisibilityKey("kb-articles-table")).not.toBe(columnVisibilityKey("subscribers-table"));
  });
});

describe("remembersColumns", () => {
  it("is on for a table with an id, without asking for it", () => {
    expect(remembersColumns(undefined, "contacts-table")).toBe(true);
    expect(remembersColumns({}, "contacts-table")).toBe(true);
    expect(remembersColumns({ columnVisibility: true }, "contacts-table")).toBe(true);
    expect(remembersColumns({ rememberColumnVisibility: true }, "contacts-table")).toBe(true);
  });

  it("a table can opt out", () => {
    expect(remembersColumns({ rememberColumnVisibility: false }, "contacts-table")).toBe(false);
  });

  it("no id: nowhere to keep the choice", () => {
    expect(remembersColumns({}, undefined)).toBe(false);
    expect(remembersColumns({ rememberColumnVisibility: true }, "")).toBe(false);
  });

  it("no Columns menu: no choice to keep", () => {
    expect(remembersColumns({ columnVisibility: false }, "broadcast-recipients-table")).toBe(false);
  });
});

describe("saveColumnVisibility", () => {
  const fakeStorage = (start: Record<string, string> = {}) => {
    const items = { ...start };
    return {
      items,
      setItem: (key: string, value: string) => {
        items[key] = value;
      },
      removeItem: (key: string) => {
        delete items[key];
      },
    };
  };

  it("keeps the choice under the table's key, readable again", () => {
    const storage = fakeStorage();
    saveColumnVisibility(storage, "contacts-table", { position: false });
    expect(readColumnVisibility(storage.items["st_cv_contacts-table"])).toEqual({ position: false });
  });

  it("each table keeps its own choice", () => {
    const storage = fakeStorage();
    saveColumnVisibility(storage, "contacts-table", { position: false });
    saveColumnVisibility(storage, "subscribers-table", { company: false });
    expect(Object.keys(storage.items).sort()).toEqual(["st_cv_contacts-table", "st_cv_subscribers-table"]);
  });

  it("showing a column again is a choice too", () => {
    const storage = fakeStorage();
    saveColumnVisibility(storage, "contacts-table", { position: false });
    saveColumnVisibility(storage, "contacts-table", { position: true });
    expect(readColumnVisibility(storage.items["st_cv_contacts-table"])).toEqual({ position: true });
  });

  it("no choice leaves no key, and clears an old one", () => {
    const untouched = fakeStorage();
    saveColumnVisibility(untouched, "contacts-table", {});
    expect(untouched.items).toEqual({});

    const reset = fakeStorage({ "st_cv_contacts-table": '{"position":false}' });
    saveColumnVisibility(reset, "contacts-table", {});
    expect(reset.items).toEqual({});
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
