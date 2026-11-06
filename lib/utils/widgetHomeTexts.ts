// lib/utils/widgetHomeTexts.ts
//
// The web widget's own default texts for the five Settings › Web Widget
// fields the API stores EMPTY since v1.163.0 (BE-7.2 / FE-7.2): an empty field
// means "the default in the widget's language", a filled one is the tenant's
// own text in every language. Bundled into widget/src/widget.ts AND used for
// the Settings placeholders, so the two can never disagree. Import-free on
// purpose (esbuild bundles it into the visitor widget); the one type import
// is erased at build time.

import type { WidgetLocale } from "./widgetTime";

export type WidgetHomeTextKey =
  | "home_headline"
  | "home_subtext"
  | "handoff_label"
  | "response_time_label"
  | "greeting_message";

export const WIDGET_HOME_TEXTS: Record<WidgetLocale, Record<WidgetHomeTextKey, string>> = {
  id: {
    home_headline: "Ada yang bisa kami bantu?",
    home_subtext: "Pilih opsi di bawah atau kirim pesan kepada kami.",
    handoff_label: "Bicara dengan agen",
    response_time_label: "Biasanya langsung membalas",
    greeting_message: "Halo! Ada yang bisa kami bantu?",
  },
  en: {
    home_headline: "How can we help?",
    home_subtext: "Choose an option below or send us a message.",
    handoff_label: "Talk to a human",
    response_time_label: "Usually replies instantly",
    greeting_message: "Hi! How can we help?",
  },
};

/**
 * The widget's language from the Widget Language setting: English shows
 * English; Indonesian and "Automatic" (null/empty) show Indonesian, the
 * widget's fallback when the embed code sets no `data-locale` either.
 */
export function widgetLocale(locale?: string | null): WidgetLocale {
  return (locale || "").trim().toLowerCase().startsWith("en") ? "en" : "id";
}

/** The tenant's text, else the default for the language. */
export function widgetText(value: string | null | undefined, key: WidgetHomeTextKey, locale: WidgetLocale): string {
  return (value || "").trim() || WIDGET_HOME_TEXTS[locale][key];
}

/**
 * Home Subtext: the tenant's subtext, else the tenant's OWN Greeting Message,
 * else the default subtext - never the default greeting.
 */
export function widgetHomeSubtext(
  subtext: string | null | undefined,
  greeting: string | null | undefined,
  locale: WidgetLocale,
): string {
  return (subtext || "").trim() || (greeting || "").trim() || WIDGET_HOME_TEXTS[locale].home_subtext;
}
