// lib/constants/theme.ts
//
// Light/Dark for the logged-in app, kept in the browser (no backend). The
// public site stays light for now.

export type ThemeMode = "light" | "dark";

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const DEFAULT_THEME: ThemeMode = "light";

export const THEME_STORAGE_KEY = "smartsales.theme";

/**
 * Dark-mode colours for code that writes its own colours (hex in sx). Only
 * the `.dark` block of app/globals.css defines them, as `--dk-<token>`; keep
 * the two in sync (a test compares them).
 */
export const DARK_TOKENS = {
  /** The page behind the cards. */
  page: "#030712",
  /** Cards, popovers, tooltips (= the MUI dark paper). */
  surface: "#111827",
  /** Input fields. */
  field: "#0B1120",
  /** Hover rows, the selected segment, disabled fields, chart grid lines. */
  raised: "#1F2937",
  /** Field borders and other lines that must show. */
  line: "#374151",
  /** Main text. */
  text: "#F3F4F6",
  /** Labels, placeholders, chart axis text. */
  muted: "#9CA3AF",
  /** Brand-tinted rows, such as table heads. */
  tint: "#1A2340",
} as const;

export type DarkToken = keyof typeof DARK_TOKENS;

/**
 * A colour that changes in dark mode, for sx and inline styles:
 * `var(--dk-<token>, <light>)`. Light mode defines no --dk-* variable, so it
 * renders `light` exactly as before. Recharts colours need nothing: the
 * rules at the end of app/globals.css turn every chart dark.
 */
export function themed(token: DarkToken, light: string): string {
  return `var(--dk-${token}, ${light})`;
}

/**
 * A soft tile behind a coloured icon or chip in dark mode: the colour at low
 * strength over the dark card, instead of a pastel that glows.
 */
export function darkTint(color: string, percent = 18): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}
