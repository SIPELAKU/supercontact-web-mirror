// lib/utils/noAnswerSuggestions.ts
//
// The choices under a reply the bot had no answer for: the nearest articles
// and the widget's quick actions. Keep this file free of imports: it ships
// inside the widget bundle.

export const MAX_SUGGESTED_ARTICLES = 3;
export const MAX_SUGGESTED_ACTIONS = 4;

export interface NoAnswerSuggestions {
  articles: { id: string; title: string }[];
  quickActions: { id: string; label: string }[];
}

// Complete, unique items only, up to `max`. Whatever the API sends, a button
// never ends up blank.
function cleanItems<K extends "title" | "label">(raw: unknown, key: K, max: number) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const items: ({ id: string } & Record<K, string>)[] = [];
  for (const entry of raw as Array<Record<string, unknown> | null>) {
    const id = entry?.id;
    const text = entry?.[key];
    if (typeof id !== "string" || !id || typeof text !== "string" || !text.trim() || seen.has(id)) continue;
    seen.add(id);
    items.push({ id, [key]: text.trim() } as { id: string } & Record<K, string>);
    if (items.length === max) break;
  }
  return items;
}

/** The `suggestions` of a message, or null when there is nothing to offer. */
export function readSuggestions(raw: unknown): NoAnswerSuggestions | null {
  const s = raw as { articles?: unknown; quick_actions?: unknown } | null | undefined;
  const articles = cleanItems(s?.articles, "title", MAX_SUGGESTED_ARTICLES);
  const quickActions = cleanItems(s?.quick_actions, "label", MAX_SUGGESTED_ACTIONS);
  return articles.length || quickActions.length ? { articles, quickActions } : null;
}

/** Only under the newest message, so a new message makes old choices go. */
export function latestSuggestions(
  messages: ReadonlyArray<{ suggestions?: NoAnswerSuggestions | null }>,
  suppressed: boolean,
): NoAnswerSuggestions | null {
  if (suppressed) return null;
  return messages[messages.length - 1]?.suggestions ?? null;
}
