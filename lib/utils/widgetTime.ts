// lib/utils/widgetTime.ts
//
// The time under each chat bubble and the day separators in the embeddable
// widget (widget/src/widget.ts, bundled on its own by esbuild). Everything is
// in the visitor's own time zone (the browser's). Keep this file free of
// imports: it ships inside the widget bundle.

export type WidgetLocale = "id" | "en";

const LOCALE_TAG: Record<WidgetLocale, string> = { id: "id-ID", en: "en-US" };

// A message's `sent_at`, or null when it has none or it doesn't parse.
export function parseMessageTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "10.12" (id) / "10:12 AM" (en).
export function formatMessageTime(date: Date, locale: WidgetLocale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    hour: locale === "en" ? "numeric" : "2-digit",
    minute: "2-digit",
  }).format(date);
}

// The calendar day a time falls on, in the visitor's time zone.
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// The separator above the first message of a day: "Hari ini" / "Kemarin" /
// "2 Nov 2026" ("Today" / "Yesterday" / "Nov 2, 2026").
export function dayLabel(
  date: Date,
  now: Date,
  locale: WidgetLocale,
  words: { today: string; yesterday: string },
): string {
  const key = dayKey(date);
  if (key === dayKey(now)) return words.today;
  // Built from the calendar date, not now - 24h, so a DST change can't skip a day.
  if (key === dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))) return words.yesterday;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], { day: "numeric", month: "short", year: "numeric" }).format(date);
}
