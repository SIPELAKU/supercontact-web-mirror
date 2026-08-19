"use client";

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/theme";

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
