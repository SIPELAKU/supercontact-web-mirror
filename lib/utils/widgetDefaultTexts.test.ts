import { describe, expect, it } from "vitest";

import { defaultTextLocale, FALLBACK_DEFAULT_TEXTS, widgetDefaultText } from "./widgetDefaultTexts";

describe("defaultTextLocale", () => {
  it("English shows English", () => {
    expect(defaultTextLocale("en")).toBe("en");
    expect(defaultTextLocale(" EN-us ")).toBe("en");
  });

  it("Indonesian and Automatic show Indonesian", () => {
    expect(defaultTextLocale("id")).toBe("id");
    expect(defaultTextLocale("")).toBe("id");
    expect(defaultTextLocale(null)).toBe("id");
    expect(defaultTextLocale(undefined)).toBe("id");
  });
});

describe("widgetDefaultText", () => {
  it("the backend's no-answer default, word for word, in the widget's language", () => {
    expect(widgetDefaultText("no_answer", "id")).toBe(
      "Maaf, kami belum memahami maksud pertanyaan Anda. 🙏 Boleh dijelaskan dengan kalimat lain?",
    );
    expect(widgetDefaultText("no_answer", "en")).toBe(
      "Sorry, we didn't quite understand your question. 🙏 Could you rephrase it?",
    );
  });

  it("the server's copy wins over the built-in one", () => {
    const server = { id: { greeting: "Halo dari server" }, en: { greeting: "Hello from server" } };
    expect(widgetDefaultText("greeting", "id", server)).toBe("Halo dari server");
    expect(widgetDefaultText("greeting", "en", server)).toBe("Hello from server");
  });

  it("falls back per text when the server lacks it, sends a blank, or sends nothing", () => {
    const partial = { id: { greeting: "Halo dari server", closing: "   " } };
    expect(widgetDefaultText("closing", "id", partial)).toBe(FALLBACK_DEFAULT_TEXTS.id.closing);
    expect(widgetDefaultText("intro", "id", partial)).toBe(FALLBACK_DEFAULT_TEXTS.id.intro);
    expect(widgetDefaultText("greeting", "en", partial)).toBe(FALLBACK_DEFAULT_TEXTS.en.greeting);
    expect(widgetDefaultText("idle_warn", "id", null)).toBe(FALLBACK_DEFAULT_TEXTS.id.idle_warn);
    expect(widgetDefaultText("idle_warn", "id", { id: { idle_warn: 42 } })).toBe(FALLBACK_DEFAULT_TEXTS.id.idle_warn);
  });

  it("every text exists in both languages", () => {
    for (const key of Object.keys(FALLBACK_DEFAULT_TEXTS.id)) {
      expect(FALLBACK_DEFAULT_TEXTS.en[key as keyof typeof FALLBACK_DEFAULT_TEXTS.en]).toBeTruthy();
    }
  });
});
