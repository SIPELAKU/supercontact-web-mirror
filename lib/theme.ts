"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Global MUI theme — the single source of truth for brand colors.
 *
 * primary.main  = #5479EE (brand blue, used app-wide)
 * error.main    = #EF4444 (tailwind red-500 — the standard danger color)
 */
export const BRAND_PRIMARY = "#5479EE";
export const BRAND_PRIMARY_HOVER = "#3F66E0";
export const BRAND_PRIMARY_LIGHT = "#DDE4FC";
export const DANGER = "#EF4444";
export const DANGER_HOVER = "#DC2626";

/**
 * Marketing surface system — keep in sync with the --surface-* /
 * --brand-deep / --gradient-* custom properties in app/globals.css.
 * Public-page section bands must use these (via the CSS vars in sx, or
 * these constants) and adjacent sections must not share a surface.
 */
export const SURFACE_BASE = "#ffffff";
export const SURFACE_ALT = "#F8FAFC";
export const SURFACE_TINT = "#EEF2FF";
export const SURFACE_INVERSE = "#062141";
export const SURFACE_INVERSE_DEEP = "#04162d";
export const BRAND_DEEP = "#3854D6";
export const GRADIENT_BRAND = "linear-gradient(135deg, #597CFF 0%, #7692FF 100%)";
export const GRADIENT_BRAND_H = "linear-gradient(90deg, #597CFF 0%, #7692FF 100%)";
export const GRADIENT_DEEP = "linear-gradient(135deg, #4264D0 0%, #2A408E 100%)";

/** Dark surfaces, matching the dark Tailwind greys in app/globals.css
 *  (gray-950 page, gray-900 cards, gray-800 lines). */
export const DARK_BACKGROUND = "#030712";
export const DARK_PAPER = "#111827";
export const DARK_DIVIDER = "#1F2937";

/** The MUI theme for a mode. Light is the theme the app always had. */
export function buildTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND_PRIMARY,
        dark: BRAND_PRIMARY_HOVER,
        light: BRAND_PRIMARY_LIGHT,
      },
      error: {
        main: DANGER,
        dark: DANGER_HOVER,
      },
      ...(mode === "dark"
        ? {
            background: { default: DARK_BACKGROUND, paper: DARK_PAPER },
            divider: DARK_DIVIDER,
          }
        : {}),
    },
    ...(mode === "dark"
      ? {
          components: {
            // MUI lightens dark papers by elevation with a white overlay; flat
            // cards read better against the app's dark greys.
            MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
            // Shadows do not show on a dark page, so a card gets a thin edge.
            MuiCard: { styleOverrides: { root: { border: `1px solid ${DARK_DIVIDER}` } } },
          },
        }
      : {}),
  });
}

export const theme = buildTheme("light");
