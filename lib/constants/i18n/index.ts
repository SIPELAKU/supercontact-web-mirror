// lib/constants/i18n/index.ts
//
// One language choice for the public site and the logged-in app, kept in the
// browser (no backend). Until someone picks a language, the public site is
// Indonesian (as before) and the app is English (its current text).

import { en, type Dictionary } from "./en";
import { id } from "./id";

export type Language = "en" | "id";
export type { Dictionary };

export const DICTIONARIES: Record<Language, Dictionary> = { en, id };

/** Each language named in itself, as language pickers usually do. */
export const LANGUAGE_OPTIONS: { value: Language; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "id", label: "Bahasa Indonesia", short: "ID" },
];

export const DEFAULT_APP_LANGUAGE: Language = "en";
export const DEFAULT_SITE_LANGUAGE: Language = "id";

export const LANGUAGE_STORAGE_KEY = "smartsales.language";
