import { describe, expect, it } from "vitest";
import { WIDGET_HOME_TEXTS, widgetHomeSubtext, widgetLocale, widgetText } from "./widgetHomeTexts";

describe("widgetLocale", () => {
  it("English only for an English setting; Indonesian for Indonesian and Automatic", () => {
    expect(widgetLocale("en")).toBe("en");
    expect(widgetLocale("EN-us")).toBe("en");
    expect(widgetLocale("id")).toBe("id");
    expect(widgetLocale(null)).toBe("id");
    expect(widgetLocale("")).toBe("id");
  });
});

describe("widgetText", () => {
  it("an empty field shows the default for the widget language", () => {
    expect(widgetText("", "response_time_label", "id")).toBe("Biasanya langsung membalas");
    expect(widgetText(null, "response_time_label", "en")).toBe("Usually replies instantly");
    expect(widgetText("   ", "greeting_message", "id")).toBe("Halo! Ada yang bisa kami bantu?");
    expect(widgetText(undefined, "handoff_label", "id")).toBe("Bicara dengan agen");
  });

  it("the tenant's own text shows in every language", () => {
    expect(widgetText("Selamat datang di Batik Sari!", "home_headline", "en")).toBe("Selamat datang di Batik Sari!");
  });
});

describe("widgetHomeSubtext", () => {
  it("subtext first, then the tenant's Greeting Message, then the default subtext", () => {
    expect(widgetHomeSubtext("Sub", "Greet", "id")).toBe("Sub");
    expect(widgetHomeSubtext("", "Selamat datang!", "id")).toBe("Selamat datang!");
    expect(widgetHomeSubtext("", "", "id")).toBe("Pilih opsi di bawah atau kirim pesan kepada kami.");
  });

  it("never falls back to the DEFAULT greeting", () => {
    expect(widgetHomeSubtext(null, null, "en")).toBe(WIDGET_HOME_TEXTS.en.home_subtext);
    expect(widgetHomeSubtext(null, null, "en")).not.toBe(WIDGET_HOME_TEXTS.en.greeting_message);
  });
});

describe("WIDGET_HOME_TEXTS", () => {
  it("keeps the English texts the API used to store, so English widgets look the same", () => {
    expect(WIDGET_HOME_TEXTS.en.response_time_label).toBe("Usually replies instantly");
    expect(WIDGET_HOME_TEXTS.en.greeting_message).toBe("Hi! How can we help?");
    expect(WIDGET_HOME_TEXTS.en.handoff_label).toBe("Talk to a human");
  });
});
