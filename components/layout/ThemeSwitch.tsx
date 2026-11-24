"use client";

// Light/Dark switch in the app Topbar. Hidden while HIDDEN_FEATURES.themeSwitch
// is true (pages are moved to dark colours one module at a time).

import { Tooltip } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { isFeatureHidden } from "@/lib/config/featureFlags";
import { useThemeMode } from "@/lib/context/ThemeModeContext";

export default function ThemeSwitch() {
  const { mode, setTheme } = useThemeMode();
  if (isFeatureHidden("themeSwitch")) return null;

  const dark = mode === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Tooltip title={label}>
      <AppButton
        variantStyle="text"
        aria-label={label}
        aria-pressed={dark}
        onClick={() => setTheme(dark ? "light" : "dark")}
        className="h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100"
      >
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </AppButton>
    </Tooltip>
  );
}
