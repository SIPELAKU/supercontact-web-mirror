import { describe, expect, it } from "vitest";
import { addWatchedImport, dropWatchedJob, MAX_WATCHED_IMPORTS, watchedView, type WatchedImport } from "./importWatch";

const entry = (jobIds: string[], fileName = "kontak.csv") => ({ module: "contacts" as const, fileName, jobIds });

describe("addWatchedImport", () => {
  it("adds the newest file on top, keyed by its first job", () => {
    const list = addWatchedImport(addWatchedImport([], entry(["a"], "one.csv")), entry(["b", "c"], "two.csv"));
    expect(list.map((item) => [item.id, item.fileName, item.jobIds])).toEqual([
      ["b", "two.csv", ["b", "c"]],
      ["a", "one.csv", ["a"]],
    ]);
  });

  it("the same file again replaces its entry; nothing to follow adds nothing", () => {
    const once = addWatchedImport([], entry(["a"]));
    expect(addWatchedImport(once, entry(["a", "b"]))).toEqual([{ id: "a", module: "contacts", fileName: "kontak.csv", jobIds: ["a", "b"] }]);
    expect(addWatchedImport(once, entry([]))).toBe(once);
  });

  it("keeps the newest few only", () => {
    let list: WatchedImport[] = [];
    for (let i = 0; i < MAX_WATCHED_IMPORTS + 2; i++) list = addWatchedImport(list, entry([`job-${i}`]));
    expect(list).toHaveLength(MAX_WATCHED_IMPORTS);
    expect(list[0].id).toBe(`job-${MAX_WATCHED_IMPORTS + 1}`);
  });
});

describe("watchedView", () => {
  it("keeps the view and groups of the page that imported", () => {
    const list = addWatchedImport([], {
      module: "recipients",
      view: "broadcast_group",
      groupIds: ["g1"],
      fileName: "a.csv",
      jobIds: ["a"],
    });
    expect(list[0]).toMatchObject({ view: "broadcast_group", groupIds: ["g1"] });
    expect(watchedView(list[0])).toBe("broadcast_group");
  });

  it("an entry saved before views existed is a Contacts import", () => {
    expect(watchedView({})).toBe("contacts");
  });
});

describe("dropWatchedJob", () => {
  it("removes the job from its file and a file with no jobs left", () => {
    const list = addWatchedImport(addWatchedImport([], entry(["a"])), entry(["b", "c"]));
    expect(dropWatchedJob(list, "c").map((item) => item.jobIds)).toEqual([["b"], ["a"]]);
    expect(dropWatchedJob(list, "a").map((item) => item.id)).toEqual(["b"]);
  });
});
