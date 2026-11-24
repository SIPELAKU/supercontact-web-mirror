"use client";

import React, { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { buildTheme } from "@/lib/theme";
import { useThemeMode } from "@/lib/context/ThemeModeContext";

/** The MUI theme in the page's mode (light unless the app is in Dark). */
export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
