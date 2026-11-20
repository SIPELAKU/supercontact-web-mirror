// lib/utils/language.ts
//
// The language choice shared by the public site and the app: reading and
// saving it, and turning it into the language each side shows.

import {
  DEFAULT_APP_LANGUAGE,
  DEFAULT_SITE_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type Dictionary,
  type Language,
} from "@/lib/constants/i18n";

type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

export function parseLanguage(value: unknown): Language | null {
  return value === "en" || value === "id" ? value : null;
}

/** The saved choice; null when none, unreadable, or storage is blocked. */
export function readStoredLanguage(store: KeyValueStore | null | undefined): Language | null {
  try {
    return parseLanguage(store?.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Saves the choice; a blocked storage (private window) is ignored. */
export function writeStoredLanguage(store: KeyValueStore | null | undefined, language: Language): void {
  try {
    store?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // The choice then lasts until the page is reloaded.
  }
}

/** The public site: the choice, or Indonesian. */
export function siteLanguage(choice: Language | null): Language {
  return choice ?? DEFAULT_SITE_LANGUAGE;
}

/** The app: English while the switch is hidden, else the choice or English. */
export function appLanguage(choice: Language | null, switchHidden: boolean): Language {
  if (switchHidden) return DEFAULT_APP_LANGUAGE;
  return choice ?? DEFAULT_APP_LANGUAGE;
}

/** "Notifications, {count} unread" + { count: 3 } -> "Notifications, 3 unread".
 *  An unknown placeholder is left as it is. */
export function formatText(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

/** A Sidebar or Settings menu name in the dictionary's language; the English
 *  name itself when there is no entry. */
export function navLabel(dictionary: Dictionary, name: string): string {
  return Object.prototype.hasOwnProperty.call(dictionary.navLabels, name) ? dictionary.navLabels[name] : name;
}
