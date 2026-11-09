import { describe, expect, it } from "vitest";
import { latestSuggestions, readSuggestions } from "./noAnswerSuggestions";

const article = (id: string, title = `Artikel ${id}`) => ({ id, title });
const action = (id: string, label = `Tombol ${id}`) => ({ id, label });

describe("readSuggestions", () => {
  it("reads both lists", () => {
    expect(readSuggestions({ articles: [article("a")], quick_actions: [action("q")] })).toEqual({
      articles: [{ id: "a", title: "Artikel a" }],
      quickActions: [{ id: "q", label: "Tombol q" }],
    });
  });

  it("one list is enough", () => {
    expect(readSuggestions({ articles: [article("a")], quick_actions: [] })?.articles).toHaveLength(1);
    expect(readSuggestions({ quick_actions: [action("q")] })?.quickActions).toHaveLength(1);
  });

  it("nothing to offer is null, so the agent card stands alone", () => {
    for (const raw of [null, undefined, {}, { articles: [], quick_actions: [] }, { articles: "x" }]) {
      expect(readSuggestions(raw)).toBeNull();
    }
  });

  it("at most 3 articles and 4 actions", () => {
    const result = readSuggestions({
      articles: ["1", "2", "3", "4"].map((id) => article(id)),
      quick_actions: ["1", "2", "3", "4", "5"].map((id) => action(id)),
    });
    expect(result?.articles.map((a) => a.id)).toEqual(["1", "2", "3"]);
    expect(result?.quickActions.map((a) => a.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("a broken item never takes a slot or makes a blank button", () => {
    const result = readSuggestions({
      articles: [null, { id: "x" }, { id: "", title: "t" }, { id: "b", title: "  " }, { id: 5, title: "t" }, article("1"), article("2"), article("3")],
    });
    expect(result?.articles.map((a) => a.id)).toEqual(["1", "2", "3"]);
  });

  it("drops repeats and trims the text", () => {
    const result = readSuggestions({ articles: [article("a", " Refund "), article("a", "Lagi"), article("b")] });
    expect(result?.articles).toEqual([
      { id: "a", title: "Refund" },
      { id: "b", title: "Artikel b" },
    ]);
  });
});

describe("latestSuggestions", () => {
  const suggestions = { articles: [{ id: "a", title: "t" }], quickActions: [] };
  const bot = { suggestions };
  const visitor = {};

  it("shows under the newest bot message", () => {
    expect(latestSuggestions([visitor, bot], false)).toBe(suggestions);
  });

  it("a newer message takes the old choices away", () => {
    expect(latestSuggestions([bot, visitor], false)).toBeNull();
    expect(latestSuggestions([bot, { suggestions: null }], false)).toBeNull();
  });

  it("not while the choices would mean nothing", () => {
    expect(latestSuggestions([bot], true)).toBeNull();
  });

  it("an empty thread has none", () => {
    expect(latestSuggestions([], false)).toBeNull();
  });
});
