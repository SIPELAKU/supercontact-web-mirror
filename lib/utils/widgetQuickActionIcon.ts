// lib/utils/widgetQuickActionIcon.ts
//
// The icon of a Web Widget quick action (an option card on the widget's Home
// screen). Settings offers a fixed set of keys, drawn with the same glyphs in
// its preview (components/omnichannel/QuickActionsBuilder.tsx) and in the
// widget (widget/src/widget.ts). Quick actions made by a Setup Cepat template
// carry an emoji instead (🏦, 📋, ...), which both show as it is. Keep this
// file free of imports: it ships inside the widget bundle.

export const WIDGET_QUICK_ACTION_ICON_KEYS = [
  "chat",
  "quote",
  "order",
  "sales",
  "help",
  "info",
  "calendar",
  "star",
] as const;

export type WidgetQuickActionIconKey = (typeof WIDGET_QUICK_ACTION_ICON_KEYS)[number];

/** The Settings icon key `icon` names, or null (an emoji, an older word, empty). */
export function quickActionIconKey(icon: string | null | undefined): WidgetQuickActionIconKey | null {
  const key = (icon || "").trim().toLowerCase();
  return (WIDGET_QUICK_ACTION_ICON_KEYS as readonly string[]).includes(key)
    ? (key as WidgetQuickActionIconKey)
    : null;
}

/**
 * The emoji to show for `icon`, or null when it isn't one. An emoji can be
 * several code points (⚠️, 👩‍⚕️, a flag), so this allows a short run with
 * no letters or digits in it.
 */
export function quickActionEmoji(icon: string | null | undefined): string | null {
  const value = (icon || "").trim();
  if (!value || value.length > 16 || /[A-Za-z0-9]/.test(value)) return null;
  return /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(value) ? value : null;
}
