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
