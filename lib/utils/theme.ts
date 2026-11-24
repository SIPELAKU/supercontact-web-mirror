// lib/utils/theme.ts
//
// The Light/Dark choice: reading and saving it, which theme a page shows, and
// the tiny script that applies it before the first paint (so a dark page does
// not flash white while React loads).

import { APP_ROUTE_PREFIXES, isAppPath } from "@/lib/config/appRoutes";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type ThemeMode } from "@/lib/constants/theme";

type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

export function parseTheme(value: unknown): ThemeMode | null {
  return value === "light" || value === "dark" ? value : null;
}

/** The saved choice; null when none, unreadable, or storage is blocked. */
export function readStoredTheme(store: KeyValueStore | null | undefined): ThemeMode | null {
  try {
    return parseTheme(store?.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Saves the choice; a blocked storage (private window) is ignored. */
export function writeStoredTheme(store: KeyValueStore | null | undefined, theme: ThemeMode): void {
  try {
    store?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The choice then lasts until the page is reloaded.
  }
}

/** What a page shows: dark only on an app page, with the switch shown and
 *  Dark picked. Everything else (the public site, a hidden switch) is light. */
export function effectiveTheme(choice: ThemeMode | null, switchHidden: boolean, pathname: string | null | undefined): ThemeMode {
  if (switchHidden || !isAppPath(pathname)) return DEFAULT_THEME;
  return choice ?? DEFAULT_THEME;
}

/** Runs in <head> before the page paints: adds the `dark` class to <html>
 *  for an app page when Dark was picked. Same rule as effectiveTheme. */
export function themeBootScript(): string {
  const prefixes = JSON.stringify(APP_ROUTE_PREFIXES);
  const key = JSON.stringify(THEME_STORAGE_KEY);
  return `(function(){try{var p=location.pathname;var app=${prefixes}.some(function(x){return p.indexOf(x)===0});if(app&&localStorage.getItem(${key})==="dark"){var d=document.documentElement;d.classList.add("dark");d.style.colorScheme="dark";}}catch(e){}})();`;
}
