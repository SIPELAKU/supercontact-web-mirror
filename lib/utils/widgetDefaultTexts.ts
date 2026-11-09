// lib/utils/widgetDefaultTexts.ts
//
// What the widget's bot actually sends when a text field in Settings › Web
// Widget is left blank, shown as that field's placeholder so the admin sees
// exactly what visitors get. The source of truth is the backend
// (supercontact-api app/services/answer_bot_service.py: resolve_no_answer_text,
// resolve_greeting_reply, resolve_closing_reply, resolve_articles_intro,
// resolve_idle_warn_text). FALLBACK_DEFAULT_TEXTS is a copy of those; once
// GET web-widget-config carries `default_texts` (BE-7.1), the server's copy
// wins and this one only covers an older backend.

export type WidgetTextKey = "no_answer" | "greeting" | "closing" | "intro" | "idle_warn";
export type WidgetTextLocale = "id" | "en";

export const FALLBACK_DEFAULT_TEXTS: Record<WidgetTextLocale, Record<WidgetTextKey, string>> = {
  id: {
    no_answer: "Maaf, kami belum memahami maksud pertanyaan Anda. 🙏 Boleh dijelaskan dengan kalimat lain?",
    greeting: "Hai! 👋 Ada yang bisa kami bantu? Silakan tulis pertanyaan Anda di sini.",
    closing:
      "Baik, terima kasih sudah menghubungi kami! 🙏 Tim kami akan menindaklanjuti secepatnya. Bila ada pertanyaan lain, silakan tulis kapan saja.",
    intro: "Berikut artikel yang mungkin membantu:",
    idle_warn:
      "Masih di sana? 😊 Bila tidak ada balasan, chat ini akan kami tutup. Silakan tulis lagi kapan saja bila ada pertanyaan.",
  },
  en: {
    no_answer: "Sorry, we didn't quite understand your question. 🙏 Could you rephrase it?",
    greeting: "Hi there! 👋 How can we help? Just type your question here.",
    closing: "Thank you for reaching out! 🙏 Our team will follow up with you shortly. Feel free to write again anytime.",
    intro: "Here are some articles that might help:",
    idle_warn: "Are you still there? 😊 If we don't hear back, we'll close this chat. Feel free to write again anytime.",
  },
};

// The Widget Language setting → which default to show. English shows English;
// Indonesian and "Automatic" (null/empty) show Indonesian, the backend's
// default when nothing else decides.
export function defaultTextLocale(locale: string | null | undefined): WidgetTextLocale {
  return (locale || "").trim().toLowerCase().startsWith("en") ? "en" : "id";
}

export function widgetDefaultText(
  key: WidgetTextKey,
  locale: string | null | undefined,
  fromServer?: unknown,
): string {
  const lang = defaultTextLocale(locale);
  const server = (fromServer as Record<string, Record<string, unknown> | undefined> | null | undefined)?.[lang]?.[key];
  return typeof server === "string" && server.trim() ? server : FALLBACK_DEFAULT_TEXTS[lang][key];
}
