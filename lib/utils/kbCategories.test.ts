import { describe, expect, it } from "vitest";

import { deleteImpact, keepExisting, selectAllState, toggleAll, toggleOne } from "./kbCategories";

const ALL = ["c1", "c2", "c3"];

describe("selectAllState", () => {
  it("none, some, all", () => {
    expect(selectAllState(new Set(), ALL)).toBe("none");
    expect(selectAllState(new Set(["c2"]), ALL)).toBe("some");
    expect(selectAllState(new Set(ALL), ALL)).toBe("all");
  });

  it("picks of categories no longer listed don't count", () => {
    expect(selectAllState(new Set(["gone"]), ALL)).toBe("none");
    expect(selectAllState(new Set([...ALL, "gone"]), ALL)).toBe("all");
  });

  it("an empty list is never 'all'", () => {
    expect(selectAllState(new Set(), [])).toBe("none");
  });
});

describe("toggleAll", () => {
  it("picks everything when nothing or only some is picked", () => {
    expect([...toggleAll(new Set(), ALL)]).toEqual(ALL);
    expect([...toggleAll(new Set(["c1"]), ALL)]).toEqual(ALL);
  });

  it("clears everything when everything is picked", () => {
    expect(toggleAll(new Set(ALL), ALL).size).toBe(0);
  });
});

describe("toggleOne", () => {
  it("adds, then removes, without touching the original", () => {
    const start = new Set(["c1"]);
    const added = toggleOne(start, "c2");
    expect([...added].sort()).toEqual(["c1", "c2"]);
    expect([...toggleOne(added, "c1")]).toEqual(["c2"]);
    expect([...start]).toEqual(["c1"]);
  });
});

describe("keepExisting", () => {
  it("drops picks of categories that are gone", () => {
    expect([...keepExisting(new Set(["c1", "gone"]), ALL)]).toEqual(["c1"]);
  });
});

describe("deleteImpact", () => {
  const categories = [
    { id: "c1", name: "Pengiriman", section_count: 2, article_count: 12, published_article_count: 10 },
    { id: "c2", name: "Pembayaran", section_count: 3, article_count: 20, published_article_count: 15 },
    { id: "c3", name: "Retur", section_count: 2, article_count: 10, published_article_count: 5 },
  ];

  it("adds up the sections, articles and published articles of the picked ones", () => {
    expect(deleteImpact(categories, new Set(["c1", "c3"]))).toEqual({
      categories: [
        { id: "c1", name: "Pengiriman", articles: 12 },
        { id: "c3", name: "Retur", articles: 10 },
      ],
      sections: 4,
      articles: 22,
      published: 15,
      countsKnown: true,
    });
  });

  it("a category without counts (older API): numbers unknown, never a silent zero", () => {
    const old = [{ id: "c1", name: "Pengiriman" }, categories[1]];
    const impact = deleteImpact(old, new Set(["c1", "c2"]));
    expect(impact.countsKnown).toBe(false);
    expect(impact.categories[0].articles).toBeNull();
  });

  it("a category that is genuinely empty still counts as known", () => {
    const empty = [{ id: "c9", name: "Kosong", section_count: 0, article_count: 0, published_article_count: 0 }];
    expect(deleteImpact(empty, new Set(["c9"]))).toMatchObject({ articles: 0, countsKnown: true });
  });
});
