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

export const theme = createTheme({
  palette: {
    primary: {
      main: BRAND_PRIMARY,
      dark: BRAND_PRIMARY_HOVER,
      light: BRAND_PRIMARY_LIGHT,
    },
    error: {
      main: DANGER,
      dark: DANGER_HOVER,
    },
  },
});
