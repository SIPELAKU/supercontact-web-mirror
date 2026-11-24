"use client";

// Light/Dark for the logged-in app. The choice is kept in the browser; the
// page shows dark only on app pages, with the switch shown (see
// effectiveTheme). Puts the `dark` class on <html>, which turns on the dark
// Tailwind colours in app/globals.css, and gives MUI its mode.

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isFeatureHidden } from "@/lib/config/featureFlags";
import { THEME_STORAGE_KEY, type ThemeMode } from "@/lib/constants/theme";
import { effectiveTheme, parseTheme, readStoredTheme, writeStoredTheme } from "@/lib/utils/theme";

interface ThemeModeContextProps {
  /** What the user picked (null: nothing yet). */
  choice: ThemeMode | null;
  /** What this page shows. */
  mode: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const switchHidden = isFeatureHidden("themeSwitch");
  const pathname = usePathname();
  const [choice, setChoice] = useState<ThemeMode | null>(null);
  const mode = effectiveTheme(choice, switchHidden, pathname);

  // The saved choice, and a choice made in another tab.
  useEffect(() => {
    if (switchHidden) return;
    const stored = readStoredTheme(browserStorage());
    if (stored) setChoice(stored);
    const onStorage = (event: StorageEvent) => {
      const next = event.key === THEME_STORAGE_KEY ? parseTheme(event.newValue) : null;
      if (next) setChoice(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [switchHidden]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", mode === "dark");
    html.style.colorScheme = mode === "dark" ? "dark" : "";
  }, [mode]);

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      setChoice(theme);
      if (!switchHidden) writeStoredTheme(browserStorage(), theme);
    },
    [switchHidden],
  );

  return <ThemeModeContext.Provider value={{ choice, mode, setTheme }}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error("useThemeMode must be used within a ThemeModeProvider");
  return context;
}
